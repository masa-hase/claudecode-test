export class AccessType {
  private static readonly VALID_TYPES = [
    'system',
    'const',
    'eq_ref',
    'ref',
    'fulltext',
    'ref_or_null',
    'index_merge',
    'unique_subquery',
    'index_subquery',
    'range',
    'index',
    'ALL',
  ] as const;

  private static readonly PERFORMANCE_SCORES: Record<string, number> = {
    system: 10,
    const: 9,
    eq_ref: 8,
    ref: 7,
    fulltext: 6,
    ref_or_null: 6,
    index_merge: 5,
    unique_subquery: 5,
    index_subquery: 4,
    range: 3,
    index: 2,
    ALL: 1,
  };

  private readonly _value: string | null;

  constructor(value: string | null) {
    if (
      value !== null &&
      !AccessType.VALID_TYPES.includes(value as (typeof AccessType.VALID_TYPES)[number])
    ) {
      throw new Error(`Invalid access type: ${value}`);
    }
    this._value = value;
  }

  get value(): string | null {
    return this._value;
  }

  isFullTableScan(): boolean {
    return this._value === 'ALL';
  }

  isIndexScan(): boolean {
    return this._value === 'index';
  }

  isOptimal(): boolean {
    return this._value === 'system' || this._value === 'const' || this._value === 'eq_ref';
  }

  requiresOptimization(): boolean {
    return this._value === 'ALL' || this._value === 'index';
  }

  getPerformanceScore(): number {
    if (this._value === null) return 0;
    return AccessType.PERFORMANCE_SCORES[this._value] || 0;
  }

  equals(other: AccessType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value || 'NULL';
  }
}
