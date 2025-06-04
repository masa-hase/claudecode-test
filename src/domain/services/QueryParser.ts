export type QueryInfo = {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  tables: string[];
  columns: string[];
  joins: JoinInfo[];
  whereConditions: WhereCondition[];
  orderBy: OrderByInfo[];
  groupBy: string[];
  having: string | null;
  limit: number | null;
  subqueries: QueryInfo[];
};

export type JoinInfo = {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';
  table: string;
  condition: string;
};

export type WhereCondition = {
  column: string;
  operator: string;
  value: string;
  type: 'AND' | 'OR';
};

export type OrderByInfo = {
  column: string;
  direction: 'ASC' | 'DESC';
};

export class QueryParser {
  parse(query: string): QueryInfo {
    const normalizedQuery = this.normalizeQuery(query);

    return {
      type: this.getQueryType(normalizedQuery),
      tables: this.extractTables(normalizedQuery),
      columns: this.extractColumns(normalizedQuery),
      joins: this.extractJoins(normalizedQuery),
      whereConditions: this.extractWhereConditions(normalizedQuery),
      orderBy: this.extractOrderBy(normalizedQuery),
      groupBy: this.extractGroupBy(normalizedQuery),
      having: this.extractHaving(normalizedQuery),
      limit: this.extractLimit(normalizedQuery),
      subqueries: this.extractSubqueries(normalizedQuery),
    };
  }

  private normalizeQuery(query: string): string {
    return query.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim().toUpperCase();
  }

  private getQueryType(query: string): QueryInfo['type'] {
    const firstWord = query.split(' ')[0];
    switch (firstWord) {
      case 'SELECT':
        return 'SELECT';
      case 'INSERT':
        return 'INSERT';
      case 'UPDATE':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'OTHER';
    }
  }

  private extractTables(query: string): string[] {
    const tables: string[] = [];

    // FROM句のテーブル
    const fromMatch = query.match(/FROM\s+([^\s,]+(?:\s*,\s*[^\s,]+)*)/i);
    if (fromMatch) {
      const fromTables = fromMatch[1].split(',').map((t) => t.trim());
      tables.push(...fromTables);
    }

    // JOIN句のテーブル
    const joinMatches = query.matchAll(/(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([^\s]+)/gi);
    for (const match of joinMatches) {
      tables.push(match[1]);
    }

    // UPDATE句のテーブル
    const updateMatch = query.match(/UPDATE\s+([^\s]+)/i);
    if (updateMatch) {
      tables.push(updateMatch[1]);
    }

    // INSERT INTO句のテーブル
    const insertMatch = query.match(/INSERT\s+INTO\s+([^\s(]+)/i);
    if (insertMatch) {
      tables.push(insertMatch[1]);
    }

    // DELETE FROM句のテーブル
    const deleteMatch = query.match(/DELETE\s+FROM\s+([^\s]+)/i);
    if (deleteMatch) {
      tables.push(deleteMatch[1]);
    }

    return [...new Set(tables)];
  }

  private extractColumns(query: string): string[] {
    const columns: string[] = [];

    // SELECT句のカラム
    const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i);
    if (selectMatch) {
      const selectPart = selectMatch[1];
      if (selectPart !== '*') {
        const cols = selectPart.split(',').map((c) => {
          // エイリアスを除去
          const col = c.trim();
          const asIndex = col.lastIndexOf(' AS ');
          return asIndex > -1 ? col.substring(0, asIndex).trim() : col;
        });
        columns.push(...cols);
      }
    }

    return columns;
  }

  private extractJoins(query: string): JoinInfo[] {
    const joins: JoinInfo[] = [];

    // 各JOINタイプの正規表現パターンを個別に実行
    const joinPatterns = [
      {
        regex:
          /INNER\s+JOIN\s+(\w+)\s+\w*\s*ON\s+([\s\S]+?)(?=\s+(?:LEFT|RIGHT|INNER|FULL)\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s+LIMIT|$)/gi,
        type: 'INNER',
      },
      {
        regex:
          /LEFT\s+JOIN\s+(\w+)\s+\w*\s*ON\s+([\s\S]+?)(?=\s+(?:LEFT|RIGHT|INNER|FULL)\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s+LIMIT|$)/gi,
        type: 'LEFT',
      },
      {
        regex:
          /RIGHT\s+JOIN\s+(\w+)\s+\w*\s*ON\s+([\s\S]+?)(?=\s+(?:LEFT|RIGHT|INNER|FULL)\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s+LIMIT|$)/gi,
        type: 'RIGHT',
      },
      {
        regex:
          /FULL\s+JOIN\s+(\w+)\s+\w*\s*ON\s+([\s\S]+?)(?=\s+(?:LEFT|RIGHT|INNER|FULL)\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s+LIMIT|$)/gi,
        type: 'FULL',
      },
      {
        regex:
          /CROSS\s+JOIN\s+(\w+)\s+\w*\s*ON\s+([\s\S]+?)(?=\s+(?:LEFT|RIGHT|INNER|FULL)\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s+LIMIT|$)/gi,
        type: 'CROSS',
      },
    ];

    for (const pattern of joinPatterns) {
      let match: RegExpExecArray | null;
      // exec()を使って全ての一致を検索
      match = pattern.regex.exec(query);
      while (match !== null) {
        joins.push({
          type: pattern.type as JoinInfo['type'],
          table: match[1],
          condition: match[2].trim(),
        });
        match = pattern.regex.exec(query);
      }
      // 正規表現のlastIndexをリセット
      pattern.regex.lastIndex = 0;
    }

    return joins;
  }

  private extractWhereConditions(query: string): WhereCondition[] {
    const conditions: WhereCondition[] = [];
    const whereMatch = query.match(/WHERE\s+(.*?)(?:GROUP|ORDER|HAVING|LIMIT|$)/i);

    if (whereMatch) {
      const wherePart = whereMatch[1];
      // 簡易的な解析（実際のSQLパーサーはもっと複雑）
      const conditionPattern =
        /(\w+)\s*(=|!=|<>|<|>|<=|>=|LIKE|IN|NOT\s+IN)\s*('[^']*'|"[^"]*"|\d+|\([^)]+\))/gi;
      const matches = wherePart.matchAll(conditionPattern);

      for (const match of matches) {
        conditions.push({
          column: match[1],
          operator: match[2],
          value: match[3],
          type: 'AND', // 簡易実装のためANDと仮定
        });
      }
    }

    return conditions;
  }

  private extractOrderBy(query: string): OrderByInfo[] {
    const orderBy: OrderByInfo[] = [];
    const orderMatch = query.match(/ORDER\s+BY\s+(.*?)(?:LIMIT|$)/i);

    if (orderMatch) {
      const orderPart = orderMatch[1];
      const orders = orderPart.split(',');

      for (const order of orders) {
        const parts = order.trim().split(/\s+/);
        orderBy.push({
          column: parts[0],
          direction: (parts[1] === 'DESC' ? 'DESC' : 'ASC') as OrderByInfo['direction'],
        });
      }
    }

    return orderBy;
  }

  private extractGroupBy(query: string): string[] {
    const groupMatch = query.match(/GROUP\s+BY\s+(.*?)(?:HAVING|ORDER|LIMIT|$)/i);

    if (groupMatch) {
      return groupMatch[1].split(',').map((g) => g.trim());
    }

    return [];
  }

  private extractHaving(query: string): string | null {
    const havingMatch = query.match(/HAVING\s+(.*?)(?:ORDER|LIMIT|$)/i);
    return havingMatch ? havingMatch[1].trim() : null;
  }

  private extractLimit(query: string): number | null {
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    return limitMatch ? Number.parseInt(limitMatch[1], 10) : null;
  }

  private extractSubqueries(query: string): QueryInfo[] {
    const subqueries: QueryInfo[] = [];

    // 括弧内のSELECTクエリを検出
    let depth = 0;
    let subqueryStart = -1;
    let i = 0;

    while (i < query.length) {
      if (query[i] === '(') {
        if (depth === 0) {
          // 新しい括弧の開始位置を記録
          subqueryStart = i + 1;
        }
        depth++;
      } else if (query[i] === ')') {
        depth--;
        if (depth === 0 && subqueryStart !== -1) {
          // 括弧が閉じられた時、内容を確認
          const subqueryCandidate = query.substring(subqueryStart, i).trim();
          if (subqueryCandidate.toUpperCase().startsWith('SELECT')) {
            try {
              const subqueryInfo = this.parse(subqueryCandidate);
              subqueries.push(subqueryInfo);
            } catch (e) {
              // パースに失敗した場合はスキップ
            }
          }
          subqueryStart = -1;
        }
      }
      i++;
    }

    return subqueries;
  }
}
