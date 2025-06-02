export class QueryType {
  private static readonly VALID_TYPES = [
    'SIMPLE',
    'PRIMARY',
    'SUBQUERY',
    'DERIVED',
    'UNION',
    'UNION RESULT',
    'DEPENDENT UNION',
    'DEPENDENT SUBQUERY',
    'MATERIALIZED',
    'UNCACHEABLE SUBQUERY',
    'UNCACHEABLE UNION',
  ] as const;

  private readonly _value: string;

  constructor(value: string) {
    if (!QueryType.VALID_TYPES.includes(value as (typeof QueryType.VALID_TYPES)[number])) {
      throw new Error(`Invalid query type: ${value}`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  isSimple(): boolean {
    return this._value === 'SIMPLE';
  }

  isSubquery(): boolean {
    return this._value.includes('SUBQUERY');
  }

  isUnion(): boolean {
    return this._value.includes('UNION');
  }

  equals(other: QueryType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
