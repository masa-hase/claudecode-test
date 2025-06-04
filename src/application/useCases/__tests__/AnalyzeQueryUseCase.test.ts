import { QueryParser } from '../../../domain/services/QueryParser';
import { QueryTuningAnalyzer } from '../../../domain/services/QueryTuningAnalyzer';
import { AnalyzeQueryUseCase } from '../AnalyzeQueryUseCase';

describe('AnalyzeQueryUseCase', () => {
  let useCase: AnalyzeQueryUseCase;
  let parser: QueryParser;
  let analyzer: QueryTuningAnalyzer;

  beforeEach(() => {
    parser = new QueryParser();
    analyzer = new QueryTuningAnalyzer();
    useCase = new AnalyzeQueryUseCase(parser, analyzer);
  });

  it('should analyze a simple SELECT query', async () => {
    const query = 'SELECT * FROM users';
    const result = await useCase.execute(query);

    expect(result.queryInfo).toBeDefined();
    expect(result.queryInfo.type).toBe('SELECT');
    expect(result.queryInfo.tables).toEqual(['USERS']);

    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions).toContainEqual(
      expect.objectContaining({
        type: 'カラム指定',
        description: 'SELECT * の使用を避ける',
      })
    );
  });

  it('should analyze a query with multiple issues', async () => {
    const query = `
      SELECT * 
      FROM users u 
      LEFT JOIN posts p ON u.id = p.user_id 
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN tags t ON p.id = t.post_id
      ORDER BY u.created_at DESC
    `;
    const result = await useCase.execute(query);

    expect(result.queryInfo.joins).toHaveLength(4);

    const suggestionTypes = result.suggestions.map((s) => s.type);
    expect(suggestionTypes).toContain('カラム指定');
    expect(suggestionTypes).toContain('JOIN最適化');
    expect(suggestionTypes).toContain('フルスキャン');
    expect(suggestionTypes).toContain('パフォーマンス');
  });

  it('should analyze UPDATE query without WHERE', async () => {
    const query = "UPDATE users SET status = 'inactive'";
    const result = await useCase.execute(query);

    expect(result.queryInfo.type).toBe('UPDATE');

    const criticalSuggestions = result.suggestions.filter((s) => s.level === 'critical');
    expect(criticalSuggestions).toHaveLength(1);
    expect(criticalSuggestions[0].type).toBe('安全性');
  });

  it('should analyze query with subqueries', async () => {
    const query = `
      SELECT name 
      FROM users 
      WHERE id IN (
        SELECT user_id 
        FROM posts 
        WHERE created_at > '2024-01-01'
      )
    `;
    const result = await useCase.execute(query);

    expect(result.queryInfo.subqueries).toHaveLength(1);

    const suggestions = result.suggestions.filter((s) => s.description.includes('サブクエリ'));
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('should handle GROUP BY queries', async () => {
    const query = `
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE price > 100
      GROUP BY category 
      HAVING COUNT(*) > 10
    `;
    const result = await useCase.execute(query);

    expect(result.queryInfo.groupBy).toEqual(['CATEGORY']);
    expect(result.queryInfo.having).toBe('COUNT(*) > 10');

    const indexSuggestions = result.suggestions.filter((s) => s.type === 'インデックス');
    expect(indexSuggestions.length).toBeGreaterThan(0);
  });
});
