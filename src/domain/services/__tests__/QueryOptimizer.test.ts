import { QueryOptimizer } from '../QueryOptimizer';
import { QueryParser } from '../QueryParser';

describe('QueryOptimizer', () => {
  let optimizer: QueryOptimizer;
  let parser: QueryParser;

  beforeEach(() => {
    optimizer = new QueryOptimizer();
    parser = new QueryParser();
  });

  describe('optimize', () => {
    it('should optimize IN subquery to EXISTS', () => {
      const query =
        'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE status = "active")';
      const queryInfo = parser.parse(query);

      const result = optimizer.optimize(query, queryInfo);

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('subquery_optimization');
      expect(result.changes[0].description).toContain('EXISTS');
      expect(result.estimatedImprovement).toBeGreaterThan(0);
    });

    it('should suggest optimization for large IN clauses', () => {
      const values = Array.from({ length: 15 }, (_, i) => i + 1).join(',');
      const query = `SELECT * FROM products WHERE id IN (${values})`;
      const queryInfo = parser.parse(query);

      const result = optimizer.optimize(query, queryInfo);

      expect(result.changes.some((c) => c.type === 'rewrite')).toBe(true);
      expect(result.estimatedImprovement).toBeGreaterThan(0);
    });

    it('should add index hints for WHERE clauses', () => {
      const query = 'SELECT * FROM users WHERE email = "test@example.com"';
      const queryInfo = parser.parse(query);

      const result = optimizer.optimize(query, queryInfo);

      expect(result.changes.some((c) => c.type === 'index_hint')).toBe(true);
      expect(result.optimized).toContain('USE INDEX');
    });

    it('should not optimize already optimized queries', () => {
      const query = 'SELECT id, name FROM users LIMIT 10';
      const queryInfo = parser.parse(query);

      const result = optimizer.optimize(query, queryInfo);

      expect(result.changes).toHaveLength(0);
      expect(result.original).toBe(result.optimized);
      expect(result.estimatedImprovement).toBe(0);
    });

    it('should optimize multiple aspects of a complex query', () => {
      const query = `
        SELECT u.*, 
               (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
        FROM users u
        WHERE u.id IN (SELECT user_id FROM orders WHERE status = 'pending')
        ORDER BY u.created_at
      `;
      const queryInfo = parser.parse(query);

      const result = optimizer.optimize(query, queryInfo);

      expect(result.changes.length).toBeGreaterThanOrEqual(1);
      expect(result.estimatedImprovement).toBeGreaterThan(0);
    });

    it('should handle JOIN order optimization suggestion', () => {
      const query = `
        SELECT * 
        FROM large_table l
        JOIN medium_table m ON l.id = m.large_id
        JOIN small_table s ON m.id = s.medium_id
        WHERE s.status = 'active'
      `;
      const queryInfo = parser.parse(query);

      const result = optimizer.optimize(query, queryInfo);

      // JOINの最適化またはインデックスヒントが提案されることを確認
      expect(result.changes.length).toBeGreaterThan(0);
      const hasJoinOrIndexOptimization = result.changes.some(
        (c) => c.type === 'join_order' || c.type === 'index_hint'
      );
      expect(hasJoinOrIndexOptimization).toBe(true);
    });
  });
});
