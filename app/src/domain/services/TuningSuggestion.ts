export type SuggestionSeverity = 'critical' | 'warning' | 'info';

export class TuningSuggestion {
  private readonly _title: string;
  private readonly _description: string;
  private readonly _recommendation: string | undefined;
  private readonly _severity: SuggestionSeverity;

  constructor(
    title: string,
    description: string,
    severity: SuggestionSeverity,
    recommendation?: string
  ) {
    this._title = title;
    this._description = description;
    this._severity = severity;
    this._recommendation = recommendation;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get recommendation(): string | undefined {
    return this._recommendation;
  }

  get severity(): SuggestionSeverity {
    return this._severity;
  }

  static fullTableScan(tableName: string | null, rowCount: number): TuningSuggestion {
    return new TuningSuggestion(
      'フルテーブルスキャンが検出されました',
      `テーブル${tableName ? ` "${tableName}"` : ''}で全行スキャン（${rowCount}行）が実行されています。`,
      'critical',
      'WHERE句の条件に適切なインデックスを作成してください。頻繁に検索される列にインデックスを追加することで、クエリのパフォーマンスが大幅に向上します。'
    );
  }

  static unusedIndex(tableName: string | null, possibleKeys: string): TuningSuggestion {
    return new TuningSuggestion(
      '使用されていないインデックスが存在します',
      `テーブル${tableName ? ` "${tableName}"` : ''}で利用可能なインデックス（${possibleKeys}）が使用されていません。`,
      'warning',
      'インデックスヒントを使用するか、クエリを見直してインデックスが使用されるように修正してください。'
    );
  }

  static filesort(tableName: string | null): TuningSuggestion {
    return new TuningSuggestion(
      'ファイルソートが発生しています',
      `テーブル${tableName ? ` "${tableName}"` : ''}でソート処理がインデックスを使用せずに実行されています。`,
      'warning',
      'ORDER BY句で使用している列にインデックスを作成するか、既存のインデックスを活用できるようにクエリを修正してください。'
    );
  }

  static temporaryTable(tableName: string | null): TuningSuggestion {
    return new TuningSuggestion(
      '一時テーブルが使用されています',
      `テーブル${tableName ? ` "${tableName}"` : ''}の処理で一時テーブルが作成されています。`,
      'critical',
      'GROUP BYやDISTINCTの処理を見直し、インデックスを活用できるように最適化してください。'
    );
  }

  static highJoinCost(totalCost: number): TuningSuggestion {
    return new TuningSuggestion(
      '高コストなJOINが検出されました',
      `複数テーブルのJOINで推定${totalCost}行の処理が発生しています。`,
      'critical',
      'JOIN条件に適切なインデックスを作成し、小さいテーブルから順にJOINするように順序を調整してください。'
    );
  }

  static lowFilteredPercentage(tableName: string | null, filtered: number): TuningSuggestion {
    return new TuningSuggestion(
      '低いフィルタリング効率',
      `テーブル${tableName ? ` "${tableName}"` : ''}でフィルタリング効率が${filtered}%と低くなっています。`,
      'warning',
      'WHERE句の条件を見直し、より選択的な条件を先に評価するように調整してください。'
    );
  }
}
