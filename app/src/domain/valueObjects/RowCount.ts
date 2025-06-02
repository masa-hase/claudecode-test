export class RowCount {
  private readonly _value: number | null;

  constructor(value: number | null) {
    if (value !== null && value < 0) {
      throw new Error('Row count cannot be negative');
    }
    this._value = value;
  }

  get value(): number | null {
    return this._value;
  }

  isLarge(): boolean {
    return this._value !== null && this._value > 10000;
  }

  isMedium(): boolean {
    return this._value !== null && this._value >= 1000 && this._value <= 10000;
  }

  isSmall(): boolean {
    return this._value !== null && this._value < 1000;
  }

  multiply(other: RowCount): RowCount {
    if (this._value === null || other._value === null) {
      return new RowCount(null);
    }
    return new RowCount(this._value * other._value);
  }

  equals(other: RowCount): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value !== null ? this._value.toString() : 'NULL';
  }
}
