import { ExplainRow } from '../../entities/ExplainRow';
import { AccessType } from '../../valueObjects/AccessType';
import { QueryType } from '../../valueObjects/QueryType';
import { RowCount } from '../../valueObjects/RowCount';
import { QueryAnalyzer } from '../QueryAnalyzer';
import { TuningSuggestion } from '../TuningSuggestion';

describe('QueryAnalyzer', () => {
  let analyzer: QueryAnalyzer;

  beforeEach(() => {
    analyzer = new QueryAnalyzer();
  });

  describe('analyze', () => {
    it('should detect full table scan', () => {
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
        rows: new RowCount(10000),
        filtered: 100.0,
        extra: null,
      });

      const suggestions = analyzer.analyze([row]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].severity).toBe('critical');
      expect(suggestions[0].title).toContain('フルテーブルスキャン');
    });

    it('should detect unused index', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: 'idx_user_id,idx_email',
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(5000),
        filtered: 100.0,
        extra: null,
      });

      const suggestions = analyzer.analyze([row]);

      const unusedIndexSuggestion = suggestions.find((s) =>
        s.title.includes('使用されていないインデックス')
      );
      expect(unusedIndexSuggestion).toBeDefined();
      expect(unusedIndexSuggestion?.severity).toBe('warning');
    });

    it('should detect filesort', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('range'),
        possibleKeys: 'idx_created_at',
        key: 'idx_created_at',
        keyLen: '8',
        ref: null,
        rows: new RowCount(1000),
        filtered: 100.0,
        extra: 'Using where; Using filesort',
      });

      const suggestions = analyzer.analyze([row]);

      const filesortSuggestion = suggestions.find((s) => s.title.includes('ファイルソート'));
      expect(filesortSuggestion).toBeDefined();
      expect(filesortSuggestion?.severity).toBe('warning');
    });

    it('should detect temporary table', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'orders',
        partitions: null,
        type: new AccessType('ALL'),
        possibleKeys: null,
        key: null,
        keyLen: null,
        ref: null,
        rows: new RowCount(5000),
        filtered: 100.0,
        extra: 'Using temporary; Using filesort',
      });

      const suggestions = analyzer.analyze([row]);

      const tempTableSuggestion = suggestions.find((s) => s.title.includes('一時テーブル'));
      expect(tempTableSuggestion).toBeDefined();
      expect(tempTableSuggestion?.severity).toBe('critical');
    });

    it('should calculate join cost for multiple tables', () => {
      const rows = [
        new ExplainRow({
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
        }),
        new ExplainRow({
          id: 1,
          selectType: new QueryType('SIMPLE'),
          table: 'orders',
          partitions: null,
          type: new AccessType('ALL'),
          possibleKeys: null,
          key: null,
          keyLen: null,
          ref: null,
          rows: new RowCount(5000),
          filtered: 10.0,
          extra: null,
        }),
      ];

      const suggestions = analyzer.analyze(rows);

      const joinCostSuggestion = suggestions.find((s) => s.title.includes('高コストなJOIN'));
      expect(joinCostSuggestion).toBeDefined();
      expect(joinCostSuggestion?.severity).toBe('critical');
    });

    it('should not generate suggestions for optimal queries', () => {
      const row = new ExplainRow({
        id: 1,
        selectType: new QueryType('SIMPLE'),
        table: 'users',
        partitions: null,
        type: new AccessType('const'),
        possibleKeys: 'PRIMARY',
        key: 'PRIMARY',
        keyLen: '4',
        ref: 'const',
        rows: new RowCount(1),
        filtered: 100.0,
        extra: null,
      });

      const suggestions = analyzer.analyze([row]);

      expect(suggestions).toHaveLength(0);
    });
  });
});
