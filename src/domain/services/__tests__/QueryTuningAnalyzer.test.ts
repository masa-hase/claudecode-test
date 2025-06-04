import type { QueryInfo } from '../QueryParser';
import { QueryTuningAnalyzer } from '../QueryTuningAnalyzer';

describe('QueryTuningAnalyzer', () => {
  const analyzer = new QueryTuningAnalyzer();

  it('should suggest avoiding SELECT *', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users'],
      columns: [],
      joins: [],
      whereConditions: [],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: 'カラム指定',
        description: 'SELECT * の使用を避ける',
      })
    );
  });

  it('should warn about too many JOINs', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users', 'posts', 'comments', 'likes', 'tags'],
      columns: ['id'],
      joins: [
        { type: 'INNER', table: 'posts', condition: 'users.id = posts.user_id' },
        { type: 'INNER', table: 'comments', condition: 'posts.id = comments.post_id' },
        { type: 'INNER', table: 'likes', condition: 'posts.id = likes.post_id' },
        { type: 'INNER', table: 'tags', condition: 'posts.id = tags.post_id' },
      ],
      whereConditions: [],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: 'JOIN最適化',
        description: '複数のJOINが使用されています',
      })
    );
  });

  it('should warn about missing WHERE clause', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users'],
      columns: ['id', 'name'],
      joins: [],
      whereConditions: [],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: 'フルスキャン',
        description: 'WHERE句が指定されていません',
      })
    );
  });

  it('should warn about LIKE with leading wildcard', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users'],
      columns: ['id', 'name'],
      joins: [],
      whereConditions: [{ column: 'name', operator: 'LIKE', value: "'%smith'", type: 'AND' }],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: 'インデックス使用',
        description: 'LIKE演算子で前方一致検索が使用されていません',
      })
    );
  });

  it('should suggest LIMIT with ORDER BY', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users'],
      columns: ['id', 'name'],
      joins: [],
      whereConditions: [{ column: 'status', operator: '=', value: "'active'", type: 'AND' }],
      orderBy: [{ column: 'created_at', direction: 'DESC' }],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: 'パフォーマンス',
        description: 'ORDER BYにLIMITが指定されていません',
      })
    );
  });

  it('should suggest index for GROUP BY', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['orders'],
      columns: ['category', 'COUNT(*)'],
      joins: [],
      whereConditions: [],
      orderBy: [],
      groupBy: ['category'],
      having: 'COUNT(*) > 10',
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: 'インデックス',
        description: 'GROUP BY句が使用されています',
      })
    );
  });

  it('should warn about UPDATE without WHERE', () => {
    const queryInfo: QueryInfo = {
      type: 'UPDATE',
      tables: ['users'],
      columns: [],
      joins: [],
      whereConditions: [],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: '安全性',
        level: 'critical',
        description: 'WHERE句なしのUPDATE/DELETE',
      })
    );
  });

  it('should warn about subqueries', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users'],
      columns: ['id', 'name'],
      joins: [],
      whereConditions: [
        { column: 'id', operator: 'IN', value: '(SELECT user_id FROM posts)', type: 'AND' },
      ],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [
        {
          type: 'SELECT',
          tables: ['posts'],
          columns: ['user_id'],
          joins: [],
          whereConditions: [],
          orderBy: [],
          groupBy: [],
          having: null,
          limit: null,
          subqueries: [],
        },
      ],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: '最適化',
        description: 'サブクエリが使用されています',
      })
    );
  });

  it('should warn about IN subquery specifically', () => {
    const queryInfo: QueryInfo = {
      type: 'SELECT',
      tables: ['users'],
      columns: ['id', 'name'],
      joins: [],
      whereConditions: [
        { column: 'id', operator: 'IN', value: '(SELECT user_id FROM posts)', type: 'AND' },
      ],
      orderBy: [],
      groupBy: [],
      having: null,
      limit: null,
      subqueries: [
        {
          type: 'SELECT',
          tables: ['posts'],
          columns: ['user_id'],
          joins: [],
          whereConditions: [],
          orderBy: [],
          groupBy: [],
          having: null,
          limit: null,
          subqueries: [],
        },
      ],
    };

    const suggestions = analyzer.analyze(queryInfo);
    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: '最適化',
        description: 'INサブクエリが使用されています',
      })
    );
  });
});
