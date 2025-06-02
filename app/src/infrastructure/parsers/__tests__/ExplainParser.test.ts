import { ExplainParser } from '../ExplainParser';

describe('ExplainParser', () => {
  let parser: ExplainParser;

  beforeEach(() => {
    parser = new ExplainParser();
  });

  describe('parse', () => {
    it('should parse table format EXPLAIN result', () => {
      const input = `+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].rows.value).toBe(1000);
    });

    it('should parse multiple rows', () => {
      const input = `+----+-------------+--------+------------+------+---------------+---------+---------+------------------------+------+----------+-------+
| id | select_type | table  | partitions | type | possible_keys | key     | key_len | ref                    | rows | filtered | Extra |
+----+-------------+--------+------------+------+---------------+---------+---------+------------------------+------+----------+-------+
|  1 | SIMPLE      | users  | NULL       | ALL  | PRIMARY       | NULL    | NULL    | NULL                   | 1000 |   100.00 | NULL  |
|  1 | SIMPLE      | orders | NULL       | ref  | user_id       | user_id | 4       | mydb.users.id         |   10 |   100.00 | NULL  |
+----+-------------+--------+------------+------+---------------+---------+---------+------------------------+------+----------+-------+`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);
      expect(result[0].table).toBe('users');
      expect(result[1].table).toBe('orders');
    });

    it('should parse vertical format (\\G)', () => {
      const input = `*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: users
   partitions: NULL
         type: range
possible_keys: idx_age
          key: idx_age
      key_len: 5
          ref: NULL
         rows: 500
     filtered: 50.00
        Extra: Using where; Using filesort`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].type.value).toBe('range');
      expect(result[0].key).toBe('idx_age');
      expect(result[0].hasFilesort()).toBe(true);
    });

    it('should handle NULL values correctly', () => {
      const input = `+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | NULL  | NULL       | NULL | NULL          | NULL | NULL    | NULL | NULL |     NULL | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].table).toBeNull();
      expect(result[0].type.value).toBeNull();
      expect(result[0].rows.value).toBeNull();
    });

    it('should throw error for empty input', () => {
      expect(() => parser.parse('')).toThrow('Empty EXPLAIN result');
    });

    it('should throw error for invalid format', () => {
      const input = 'This is not a valid EXPLAIN output';
      expect(() => parser.parse(input)).toThrow('Invalid EXPLAIN format');
    });

    it('should parse CSV format EXPLAIN result', () => {
      const input = `"id","select_type","table","partitions","type","possible_keys","key","key_len","ref","rows","filtered","Extra"
"1","SIMPLE","users","NULL","ALL","NULL","NULL","NULL","NULL","1000","100.00","NULL"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].rows.value).toBe(1000);
      expect(result[0].filtered).toBe(100.0);
    });

    it('should parse CSV format with multiple rows', () => {
      const input = `"id","select_type","table","partitions","type","possible_keys","key","key_len","ref","rows","filtered","Extra"
"1","SIMPLE","users","NULL","ALL","PRIMARY","NULL","NULL","NULL","1000","100.00","NULL"
"1","SIMPLE","orders","NULL","ref","user_id","user_id","4","mydb.users.id","10","100.00","NULL"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);
      expect(result[0].table).toBe('users');
      expect(result[1].table).toBe('orders');
      expect(result[1].type.value).toBe('ref');
      expect(result[1].key).toBe('user_id');
    });

    it('should parse CSV format with special characters and quotes', () => {
      const input = `"id","select_type","table","partitions","type","possible_keys","key","key_len","ref","rows","filtered","Extra"
"1","SIMPLE","users","NULL","ALL","idx_email,idx_created","NULL","NULL","NULL","5000","25.00","Using where; Using filesort"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].possibleKeys).toBe('idx_email,idx_created');
      expect(result[0].filtered).toBe(25.0);
      expect(result[0].extra).toBe('Using where; Using filesort');
      expect(result[0].hasFilesort()).toBe(true);
    });
  });
});
