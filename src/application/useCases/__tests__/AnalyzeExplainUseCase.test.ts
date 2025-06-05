import { QueryAnalyzer } from '../../../domain/services/QueryAnalyzer';
import { ExplainParser } from '../../../infrastructure/parsers/ExplainParser';
import { AnalyzeExplainUseCase } from '../AnalyzeExplainUseCase';

describe('AnalyzeExplainUseCase', () => {
  let useCase: AnalyzeExplainUseCase;
  let parser: ExplainParser;
  let analyzer: QueryAnalyzer;

  beforeEach(() => {
    parser = new ExplainParser();
    analyzer = new QueryAnalyzer();
    useCase = new AnalyzeExplainUseCase(parser, analyzer);
  });

  describe('execute', () => {
    it('should analyze simple query successfully', async () => {
      const input = `+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+`;

      const result = await useCase.execute(input);

      expect(result.rows).toHaveLength(1);
      expect(result.suggestions).toHaveLength(0); // 1000 rows is below threshold
      expect(result.rows[0].table).toBe('users');
    });

    it('should detect performance issues', async () => {
      const input = `+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra                       |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+
|  1 | SIMPLE      | users | NULL       | ALL  | idx_email     | NULL | NULL    | NULL | 10000 |   100.00 | Using where; Using filesort |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+`;

      const result = await useCase.execute(input);

      expect(result.suggestions.length).toBeGreaterThan(0);

      const hasFulTableScanSuggestion = result.suggestions.some((s) =>
        s.title.includes('フルテーブルスキャン')
      );
      expect(hasFulTableScanSuggestion).toBe(true);

      const hasUnusedIndexSuggestion = result.suggestions.some((s) =>
        s.title.includes('使用されていないインデックス')
      );
      expect(hasUnusedIndexSuggestion).toBe(true);

      const hasFilesortSuggestion = result.suggestions.some((s) =>
        s.title.includes('ファイルソート')
      );
      expect(hasFilesortSuggestion).toBe(true);
    });

    it('should handle multiple table joins', async () => {
      const input = `+----+-------------+--------+------------+------+---------------+---------+---------+------------------------+------+----------+-------+
| id | select_type | table  | partitions | type | possible_keys | key     | key_len | ref                    | rows | filtered | Extra |
+----+-------------+--------+------------+------+---------------+---------+---------+------------------------+------+----------+-------+
|  1 | SIMPLE      | users  | NULL       | ALL  | PRIMARY       | NULL    | NULL    | NULL                   | 1000 |   100.00 | NULL  |
|  1 | SIMPLE      | orders | NULL       | ALL  | user_id       | NULL    | NULL    | NULL                   | 5000 |    10.00 | NULL  |
+----+-------------+--------+------------+------+---------------+---------+---------+------------------------+------+----------+-------+`;

      const result = await useCase.execute(input);

      expect(result.rows).toHaveLength(2);

      const hasJoinCostSuggestion = result.suggestions.some((s) =>
        s.title.includes('高コストなJOIN')
      );
      expect(hasJoinCostSuggestion).toBe(true);
    });

    it('should return empty suggestions for optimal query', async () => {
      const input = `+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+`;

      const result = await useCase.execute(input);

      expect(result.rows).toHaveLength(1);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should throw error for invalid input', async () => {
      const input = 'Invalid EXPLAIN output';

      await expect(useCase.execute(input)).rejects.toThrow('Unsupported EXPLAIN format');
    });
  });
});
