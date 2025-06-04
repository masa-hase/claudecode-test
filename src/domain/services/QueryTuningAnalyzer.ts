import type { QueryInfo } from './QueryParser';

export interface QueryTuningSuggestion {
  level: 'critical' | 'warning' | 'info';
  type: string;
  description: string;
  suggestion: string;
  impact?: 'high' | 'medium' | 'low';
  example?: string;
}

export interface OptimizationMetrics {
  estimatedImprovement: number; // パーセンテージ
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number; // 1-10
}

export class QueryTuningAnalyzer {
  private readonly indexSuggestions = new Map<string, string[]>();

  analyze(queryInfo: QueryInfo): QueryTuningSuggestion[] {
    const suggestions: QueryTuningSuggestion[] = [];

    // クエリパターンの分析
    this.analyzeQueryPattern(queryInfo, suggestions);

    // インデックス最適化の分析
    this.analyzeIndexOptimization(queryInfo, suggestions);

    // JOIN最適化の分析
    this.analyzeJoinOptimization(queryInfo, suggestions);

    // SELECT * の使用チェック
    if (queryInfo.columns.length === 0 && queryInfo.type === 'SELECT') {
      suggestions.push({
        level: 'warning',
        type: 'カラム指定',
        description: 'SELECT * の使用を避ける',
        suggestion:
          '必要なカラムのみを明示的に指定することで、データ転送量を削減し、パフォーマンスを向上させることができます。',
      });
    }

    // JOINの最適化チェック
    if (queryInfo.joins.length > 3) {
      suggestions.push({
        level: 'warning',
        type: 'JOIN最適化',
        description: '複数のJOINが使用されています',
        suggestion:
          'JOINの数が多い場合、クエリの実行時間が長くなる可能性があります。必要に応じてクエリを分割するか、非正規化を検討してください。',
      });
    }

    // WHERE句なしの警告
    if (
      queryInfo.whereConditions.length === 0 &&
      queryInfo.type === 'SELECT' &&
      queryInfo.tables.length > 0
    ) {
      suggestions.push({
        level: 'critical',
        type: 'フルスキャン',
        description: 'WHERE句が指定されていません',
        suggestion:
          'WHERE句を追加してデータを絞り込むことで、テーブルのフルスキャンを避けることができます。',
      });
    }

    // LIKE演算子の前方一致チェック
    for (const condition of queryInfo.whereConditions) {
      if (condition.operator === 'LIKE' && condition.value.startsWith("'%")) {
        suggestions.push({
          level: 'warning',
          type: 'インデックス使用',
          description: 'LIKE演算子で前方一致検索が使用されていません',
          suggestion: `${condition.column}のLIKE検索で'%'から始まるパターンは、インデックスを使用できません。可能であれば前方一致検索に変更してください。`,
        });
      }
    }

    // ORDER BYとLIMITの組み合わせチェック
    if (queryInfo.orderBy.length > 0 && queryInfo.limit === null) {
      suggestions.push({
        level: 'info',
        type: 'パフォーマンス',
        description: 'ORDER BYにLIMITが指定されていません',
        suggestion:
          '大量のデータをソートする場合、LIMITを使用して必要な行数のみを取得することで、パフォーマンスを向上させることができます。',
      });
    }

    // GROUP BYでのインデックス使用提案
    if (queryInfo.groupBy.length > 0) {
      suggestions.push({
        level: 'info',
        type: 'インデックス',
        description: 'GROUP BY句が使用されています',
        suggestion: `GROUP BYで使用されているカラム（${queryInfo.groupBy.join(', ')}）にインデックスを作成することで、グループ化処理のパフォーマンスを向上させることができます。`,
      });
    }

    // サブクエリの使用チェック
    if (queryInfo.subqueries.length > 0) {
      suggestions.push({
        level: 'info',
        type: '最適化',
        description: 'サブクエリが使用されています',
        suggestion:
          'サブクエリはJOINやEXISTSに書き換えることで、パフォーマンスが向上する場合があります。実行計画を確認して最適化を検討してください。',
      });
    }

    // 複数テーブルのUPDATE/DELETE警告
    if (
      (queryInfo.type === 'UPDATE' || queryInfo.type === 'DELETE') &&
      queryInfo.whereConditions.length === 0
    ) {
      suggestions.push({
        level: 'critical',
        type: '安全性',
        description: 'WHERE句なしのUPDATE/DELETE',
        suggestion:
          'WHERE句を指定せずにUPDATE/DELETEを実行すると、テーブル全体が影響を受けます。必ずWHERE句で条件を指定してください。',
      });
    }

    // ORDER BY複数カラムチェック
    if (queryInfo.orderBy.length > 2) {
      suggestions.push({
        level: 'info',
        type: 'インデックス',
        description: '複数カラムでのORDER BY',
        suggestion:
          '複数のカラムでソートする場合、複合インデックスの作成を検討してください。カラムの順序はクエリのORDER BY句と一致させる必要があります。',
      });
    }

    // INサブクエリのチェック
    for (const condition of queryInfo.whereConditions) {
      if (condition.operator === 'IN' && queryInfo.subqueries.length > 0) {
        suggestions.push({
          level: 'warning',
          type: '最適化',
          description: 'INサブクエリが使用されています',
          suggestion:
            'IN (SELECT ...) はEXISTSやJOINに書き換えることで、パフォーマンスが向上する場合があります。',
        });
        break;
      }
    }

    return this.prioritizeSuggestions(suggestions);
  }

  private analyzeQueryPattern(queryInfo: QueryInfo, suggestions: QueryTuningSuggestion[]): void {
    // N+1クエリパターンの検出
    if (
      queryInfo.type === 'SELECT' &&
      queryInfo.limit === 1 &&
      queryInfo.whereConditions.some((c) => c.column.toLowerCase().includes('id'))
    ) {
      suggestions.push({
        level: 'warning',
        type: 'N+1クエリ',
        description: '単一レコードの取得が繰り返される可能性があります',
        suggestion: 'INクエリまたはJOINを使用してバッチ取得することで、クエリ数を削減できます。',
        impact: 'high',
        example: `SELECT * FROM ${queryInfo.tables[0]} WHERE id IN (1, 2, 3, ...)`,
      });
    }

    // カーテシアン積の検出
    if (
      queryInfo.joins.length > 0 &&
      queryInfo.joins.some((j) => !j.condition || j.condition.trim() === '')
    ) {
      suggestions.push({
        level: 'critical',
        type: 'カーテシアン積',
        description: 'JOIN条件が指定されていないJOINがあります',
        suggestion:
          '適切なJOIN条件を指定してください。カーテシアン積は大量のレコードを生成し、パフォーマンスを著しく低下させます。',
        impact: 'high',
      });
    }
  }

  private analyzeIndexOptimization(
    queryInfo: QueryInfo,
    suggestions: QueryTuningSuggestion[]
  ): void {
    // WHERE句のカラムに対するインデックス提案
    const whereColumns = queryInfo.whereConditions.map((c) => c.column);
    const uniqueWhereColumns = [...new Set(whereColumns)];

    if (uniqueWhereColumns.length > 0) {
      // 頻出カラムの検出
      const columnFrequency = new Map<string, number>();
      for (const col of whereColumns) {
        columnFrequency.set(col, (columnFrequency.get(col) || 0) + 1);
      }

      // 高頻度カラムに対するインデックス提案
      columnFrequency.forEach((freq, col) => {
        if (freq > 1) {
          suggestions.push({
            level: 'info',
            type: 'インデックス最適化',
            description: `${col}カラムが複数の条件で使用されています`,
            suggestion: `${col}カラムにインデックスを作成することで、クエリ性能が向上する可能性があります。`,
            impact: 'medium',
            example: `CREATE INDEX idx_${queryInfo.tables[0]}_${col} ON ${queryInfo.tables[0]}(${col});`,
          });
        }
      });

      // 複合インデックスの提案
      if (uniqueWhereColumns.length > 1) {
        const compositeIndexColumns = uniqueWhereColumns.slice(0, 3).join(', ');
        suggestions.push({
          level: 'info',
          type: '複合インデックス',
          description: '複数のカラムがWHERE句で使用されています',
          suggestion:
            '複合インデックスを作成することで、クエリ性能をさらに向上させることができます。',
          impact: 'high',
          example: `CREATE INDEX idx_${queryInfo.tables[0]}_composite ON ${queryInfo.tables[0]}(${compositeIndexColumns});`,
        });
      }
    }

    // ORDER BYカラムのインデックス提案
    if (queryInfo.orderBy.length > 0) {
      const orderColumns = queryInfo.orderBy.map((o) => o.column).join(', ');
      suggestions.push({
        level: 'info',
        type: 'ソート最適化',
        description: 'ORDER BY句でソートが行われています',
        suggestion: `ORDER BYで使用されているカラム（${orderColumns}）にインデックスを作成することで、ソート処理を高速化できます。`,
        impact: 'medium',
        example: `CREATE INDEX idx_${queryInfo.tables[0]}_sort ON ${queryInfo.tables[0]}(${orderColumns});`,
      });
    }
  }

  private analyzeJoinOptimization(
    queryInfo: QueryInfo,
    suggestions: QueryTuningSuggestion[]
  ): void {
    if (queryInfo.joins.length === 0) return;

    // JOIN順序の最適化提案
    if (queryInfo.joins.length > 2) {
      suggestions.push({
        level: 'info',
        type: 'JOIN順序最適化',
        description: '複数のJOINが使用されています',
        suggestion:
          '小さいテーブルから大きいテーブルへJOINすることで、中間結果セットを小さく保ち、パフォーマンスを向上させることができます。',
        impact: 'medium',
      });
    }

    // LEFT JOINの最適化
    const leftJoins = queryInfo.joins.filter((j) => j.type === 'LEFT');
    if (
      leftJoins.length > 0 &&
      queryInfo.whereConditions.some((c) => leftJoins.some((j) => c.column.includes(j.table)))
    ) {
      suggestions.push({
        level: 'warning',
        type: 'LEFT JOIN最適化',
        description: 'LEFT JOINしたテーブルにWHERE条件が適用されています',
        suggestion:
          'LEFT JOINしたテーブルのカラムにWHERE条件を適用すると、実質的にINNER JOINと同じになります。INNER JOINに変更することを検討してください。',
        impact: 'low',
      });
    }

    // JOINキーのインデックス提案
    for (const join of queryInfo.joins) {
      // JOIN条件からカラムを抽出（簡易的な実装）
      const columnMatch = join.condition.match(/(\w+\.\w+)\s*=\s*(\w+\.\w+)/i);
      if (columnMatch) {
        suggestions.push({
          level: 'info',
          type: 'JOINインデックス',
          description: `${join.table}テーブルとのJOIN条件`,
          suggestion:
            'JOIN条件で使用されているカラムにインデックスを作成することで、JOIN処理を高速化できます。',
          impact: 'high',
          example: `CREATE INDEX idx_${join.table}_join ON ${join.table}(<join_column>);`,
        });
      }
    }
  }

  private prioritizeSuggestions(suggestions: QueryTuningSuggestion[]): QueryTuningSuggestion[] {
    // 優先度でソート: critical > warning > info, impact: high > medium > low
    return suggestions.sort((a, b) => {
      const levelPriority = { critical: 3, warning: 2, info: 1 };
      const impactPriority = { high: 3, medium: 2, low: 1 };

      const aLevel = levelPriority[a.level];
      const bLevel = levelPriority[b.level];

      if (aLevel !== bLevel) {
        return bLevel - aLevel;
      }

      const aImpact = a.impact ? impactPriority[a.impact] : 0;
      const bImpact = b.impact ? impactPriority[b.impact] : 0;

      return bImpact - aImpact;
    });
  }
}
