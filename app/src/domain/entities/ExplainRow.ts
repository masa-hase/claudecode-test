import type { AccessType } from '../valueObjects/AccessType';
import type { QueryType } from '../valueObjects/QueryType';
import type { RowCount } from '../valueObjects/RowCount';

export interface ExplainRowProps {
  id: number;
  selectType: QueryType;
  table: string | null;
  partitions: string | null;
  type: AccessType;
  possibleKeys: string | null;
  key: string | null;
  keyLen: string | null;
  ref: string | null;
  rows: RowCount;
  filtered: number | null;
  extra: string | null;
}

export class ExplainRow {
  private readonly _id: number;
  private readonly _selectType: QueryType;
  private readonly _table: string | null;
  private readonly _partitions: string | null;
  private readonly _type: AccessType;
  private readonly _possibleKeys: string | null;
  private readonly _key: string | null;
  private readonly _keyLen: string | null;
  private readonly _ref: string | null;
  private readonly _rows: RowCount;
  private readonly _filtered: number | null;
  private readonly _extra: string | null;

  constructor(props: ExplainRowProps) {
    this._id = props.id;
    this._selectType = props.selectType;
    this._table = props.table;
    this._partitions = props.partitions;
    this._type = props.type;
    this._possibleKeys = props.possibleKeys;
    this._key = props.key;
    this._keyLen = props.keyLen;
    this._ref = props.ref;
    this._rows = props.rows;
    this._filtered = props.filtered;
    this._extra = props.extra;
  }

  get id(): number {
    return this._id;
  }

  get selectType(): QueryType {
    return this._selectType;
  }

  get table(): string | null {
    return this._table;
  }

  get partitions(): string | null {
    return this._partitions;
  }

  get type(): AccessType {
    return this._type;
  }

  get possibleKeys(): string | null {
    return this._possibleKeys;
  }

  get key(): string | null {
    return this._key;
  }

  get keyLen(): string | null {
    return this._keyLen;
  }

  get ref(): string | null {
    return this._ref;
  }

  get rows(): RowCount {
    return this._rows;
  }

  get filtered(): number | null {
    return this._filtered;
  }

  get extra(): string | null {
    return this._extra;
  }

  isFullTableScan(): boolean {
    return this._type.isFullTableScan();
  }

  hasUnusedIndex(): boolean {
    return this._possibleKeys !== null && this._key === null;
  }

  hasFilesort(): boolean {
    return this._extra?.includes('Using filesort') ?? false;
  }

  hasTemporaryTable(): boolean {
    return this._extra?.includes('Using temporary') ?? false;
  }

  getEstimatedCost(): number {
    const rowCount = this._rows.value;
    if (rowCount === null) return 0;

    const filterPercentage = this._filtered !== null ? this._filtered / 100 : 1;
    return Math.round(rowCount * filterPercentage);
  }

  getPossibleKeysList(): string[] {
    if (!this._possibleKeys) return [];
    return this._possibleKeys.split(',').map((k) => k.trim());
  }
}
