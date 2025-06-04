import { QueryParser } from '../QueryParser';

describe('QueryParser', () => {
  const parser = new QueryParser();

  describe('parse', () => {
    it('should parse a simple SELECT query', () => {
      const query = 'SELECT id, name FROM users WHERE id = 1';
      const result = parser.parse(query);

      expect(result.type).toBe('SELECT');
      expect(result.tables).toEqual(['USERS']);
      expect(result.columns).toEqual(['ID', 'NAME']);
      expect(result.whereConditions).toHaveLength(1);
      expect(result.whereConditions[0]).toEqual({
        column: 'ID',
        operator: '=',
        value: '1',
        type: 'AND',
      });
    });

    it('should parse a query with JOIN', () => {
      const query = `
        SELECT u.name, p.title 
        FROM users u 
        INNER JOIN posts p ON u.id = p.user_id 
        WHERE u.active = 1
      `;
      const result = parser.parse(query);

      expect(result.type).toBe('SELECT');
      expect(result.tables).toEqual(['USERS', 'POSTS']);
      expect(result.joins).toHaveLength(1);
      expect(result.joins[0]).toEqual({
        type: 'INNER',
        table: 'POSTS',
        condition: 'U.ID = P.USER_ID',
      });
    });

    it('should parse a query with ORDER BY and LIMIT', () => {
      const query = 'SELECT * FROM users ORDER BY created_at DESC LIMIT 10';
      const result = parser.parse(query);

      expect(result.orderBy).toHaveLength(1);
      expect(result.orderBy[0]).toEqual({
        column: 'CREATED_AT',
        direction: 'DESC',
      });
      expect(result.limit).toBe(10);
    });

    it('should parse a query with GROUP BY and HAVING', () => {
      const query = `
        SELECT category, COUNT(*) as count 
        FROM products 
        GROUP BY category 
        HAVING COUNT(*) > 10
      `;
      const result = parser.parse(query);

      expect(result.groupBy).toEqual(['CATEGORY']);
      expect(result.having).toBe('COUNT(*) > 10');
    });

    it('should parse an INSERT query', () => {
      const query = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')";
      const result = parser.parse(query);

      expect(result.type).toBe('INSERT');
      expect(result.tables).toEqual(['USERS']);
    });

    it('should parse an UPDATE query', () => {
      const query = "UPDATE users SET name = 'Jane' WHERE id = 1";
      const result = parser.parse(query);

      expect(result.type).toBe('UPDATE');
      expect(result.tables).toEqual(['USERS']);
    });

    it('should parse a DELETE query', () => {
      const query = 'DELETE FROM users WHERE id = 1';
      const result = parser.parse(query);

      expect(result.type).toBe('DELETE');
      expect(result.tables).toEqual(['USERS']);
    });

    it('should parse multiple JOIN types', () => {
      const query = `
        SELECT * 
        FROM users u 
        LEFT JOIN posts p ON u.id = p.user_id 
        RIGHT JOIN comments c ON p.id = c.post_id
      `;
      const result = parser.parse(query);

      expect(result.joins).toHaveLength(2);
      expect(result.joins[0].type).toBe('LEFT');
      expect(result.joins[1].type).toBe('RIGHT');
    });

    it('should handle multiple WHERE conditions', () => {
      const query =
        "SELECT * FROM users WHERE age > 18 AND status = 'active' AND city LIKE '%Tokyo%'";
      const result = parser.parse(query);

      expect(result.whereConditions).toHaveLength(3);
      expect(result.whereConditions[0].operator).toBe('>');
      expect(result.whereConditions[1].operator).toBe('=');
      expect(result.whereConditions[2].operator).toBe('LIKE');
    });

    it('should extract columns with aliases', () => {
      const query = 'SELECT id AS user_id, name AS user_name FROM users';
      const result = parser.parse(query);

      expect(result.columns).toEqual(['ID', 'NAME']);
    });

    it('should handle subqueries', () => {
      const query = `
        SELECT * FROM users 
        WHERE id IN (SELECT user_id FROM posts WHERE created_at > '2024-01-01')
      `;
      const result = parser.parse(query);

      expect(result.subqueries).toHaveLength(1);
      expect(result.subqueries[0].type).toBe('SELECT');
      expect(result.subqueries[0].tables).toEqual(['POSTS']);
    });
  });
});
