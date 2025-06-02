import { AccessType } from '../../valueObjects/AccessType';
import { QueryType } from '../../valueObjects/QueryType';
import { RowCount } from '../../valueObjects/RowCount';
import { ExplainRow } from '../ExplainRow';

describe('ExplainRow', () => {
  describe('constructor', () => {
    it('should create ExplainRow with all properties', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: 'Using where',
      });

      expect(row.id).toBe(1);
      expect(row.selectType.value).toBe('SIMPLE');
      expect(row.table).toBe('users');
      expect(row.type.value).toBe('ALL');
      expect(row.rows.value).toBe(1000);
      expect(row.filtered).toBe(100.0);
      expect(row.extra).toBe('Using where');
    });
  });

  describe('isFullTableScan', () => {
    it('should return true when type is ALL', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: null,
      });

      expect(row.isFullTableScan()).toBe(true);
    });

    it('should return false when type is not ALL', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ref'),
        possibleKeys: 'idx_user_id',
        key: 'idx_user_id',
        keyLen: '4',
        ref: 'const',
        rows: new RowCount(10),
        filtered: 100.0,
        extra: null,
      });

      expect(row.isFullTableScan()).toBe(false);
    });
  });

  describe('hasUnusedIndex', () => {
    it('should return true when possible_keys exist but key is null', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: 'idx_user_id,idx_created_at',
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: null,
      });

      expect(row.hasUnusedIndex()).toBe(true);
    });

    it('should return false when possible_keys is null', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: null,
      });

      expect(row.hasUnusedIndex()).toBe(false);
    });

    it('should return false when key is used', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ref'),
        possibleKeys: 'idx_user_id',
        key: 'idx_user_id',
        keyLen: '4',
        ref: 'const',
        rows: new RowCount(10),
        filtered: 100.0,
        extra: null,
      });

      expect(row.hasUnusedIndex()).toBe(false);
    });
  });

  describe('hasFilesort', () => {
    it('should return true when extra contains Using filesort', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: 'Using where; Using filesort',
      });

      expect(row.hasFilesort()).toBe(true);
    });

    it('should return false when extra does not contain Using filesort', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: 'Using where',
      });

      expect(row.hasFilesort()).toBe(false);
    });
  });

  describe('hasTemporaryTable', () => {
    it('should return true when extra contains Using temporary', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: 'Using temporary; Using filesort',
      });

      expect(row.hasTemporaryTable()).toBe(true);
    });
  });

  describe('getEstimatedCost', () => {
    it('should calculate cost based on rows and filtered percentage', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(1000),
        filtered: 50.0,
        extra: null,
      });

      expect(row.getEstimatedCost()).toBe(500);
    });

    it('should return 0 when rows is null', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(null),
        filtered: 100.0,
        extra: null,
      });

      expect(row.getEstimatedCost()).toBe(0);
    });
  });
});
