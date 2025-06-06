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
      expect(() => parser.parse('')).toThrow('Empty or whitespace-only EXPLAIN result');
    });

    it('should throw error for invalid format', () => {
      const input = 'This is not a valid EXPLAIN output';
      expect(() => parser.parse(input)).toThrow('Unsupported EXPLAIN format');
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

    it('should parse CSV format without quotes', () => {
      const input = `id,select_type,table,partitions,type,possible_keys,key,key_len,ref,rows,filtered,Extra
1,SIMPLE,users,NULL,ALL,NULL,NULL,NULL,NULL,1000,100.00,NULL`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].rows.value).toBe(1000);
      expect(result[0].filtered).toBe(100.0);
    });

    it('should parse CSV format without quotes with multiple rows', () => {
      const input = `id,select_type,table,partitions,type,possible_keys,key,key_len,ref,rows,filtered,Extra
1,SIMPLE,users,NULL,ALL,PRIMARY,NULL,NULL,NULL,1000,100.00,NULL
1,SIMPLE,orders,NULL,ref,user_id,user_id,4,mydb.users.id,10,100.00,Using index`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);
      expect(result[0].table).toBe('users');
      expect(result[1].table).toBe('orders');
      expect(result[1].type.value).toBe('ref');
      expect(result[1].key).toBe('user_id');
      expect(result[1].extra).toBe('Using index');
    });

    it('should parse CSV format with uppercase headers', () => {
      const input = `ID,SELECT_TYPE,TABLE,PARTITIONS,TYPE,POSSIBLE_KEYS,KEY,KEY_LEN,REF,ROWS,FILTERED,EXTRA
1,SIMPLE,users,NULL,ALL,NULL,NULL,NULL,NULL,1000,100.00,NULL`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].rows.value).toBe(1000);
    });

    it('should parse TSV format (MySQL Workbench tab-separated)', () => {
      const input = `id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	users	NULL	ALL	NULL	NULL	NULL	NULL	1000	100.00	NULL`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].rows.value).toBe(1000);
    });

    it('should parse TSV format with multiple rows', () => {
      const input = `id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	users	NULL	ALL	PRIMARY	NULL	NULL	NULL	1000	100.00	NULL
1	SIMPLE	orders	NULL	ref	user_id	user_id	4	mydb.users.id	10	100.00	NULL`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);
      expect(result[0].table).toBe('users');
      expect(result[1].table).toBe('orders');
      expect(result[1].type.value).toBe('ref');
      expect(result[1].key).toBe('user_id');
    });

    it('should parse plain table format (MySQL Workbench without borders)', () => {
      const input = `id select_type table      partitions type  possible_keys key     key_len ref              rows filtered Extra
1  SIMPLE      users      NULL       ALL   NULL          NULL    NULL    NULL             1000 100.00   NULL
1  SIMPLE      orders     NULL       ref   user_id       user_id 4       mydb.users.id    10   100.00   NULL`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[1].table).toBe('orders');
      expect(result[1].type.value).toBe('ref');
      expect(result[1].ref).toBe('mydb.users.id');
    });

    it('should parse plain table format with variable spacing', () => {
      const input = `id select_type table partitions type possible_keys key key_len ref rows filtered Extra
1 SIMPLE users NULL range idx_age idx_age 5 NULL 500 50.00 Using where; Using filesort`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].type.value).toBe('range');
      expect(result[0].key).toBe('idx_age');
      expect(result[0].keyLen).toBe('5');
      expect(result[0].rows.value).toBe(500);
      expect(result[0].hasFilesort()).toBe(true);
    });

    it('should parse MySQL Workbench single-space separated format', () => {
      // MySQL Workbenchの実際の出力形式（単一スペース区切り）
      const input = `id select_type table partitions type possible_keys key key_len ref rows filtered Extra
1 SIMPLE users NULL ALL NULL NULL NULL NULL 1000 100.00 NULL
1 SIMPLE orders NULL ref user_id user_id 4 mydb.users.id 10 100.00 Using index`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('users');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].possibleKeys).toBeNull();
      expect(result[0].key).toBeNull();
      expect(result[0].rows.value).toBe(1000);
      expect(result[0].filtered).toBe(100.0);
      expect(result[0].extra).toBeNull();

      expect(result[1].table).toBe('orders');
      expect(result[1].type.value).toBe('ref');
      expect(result[1].key).toBe('user_id');
      expect(result[1].ref).toBe('mydb.users.id');
      expect(result[1].extra).toBe('Using index');
    });

    it('should handle MySQL Workbench format with empty strings and NULL values', () => {
      // 空文字列とNULL値を含む形式 (2つのスペースは空文字列を表す)
      const input = `id select_type table partitions type possible_keys key key_len ref rows filtered Extra
1 SIMPLE t1 NULL ALL  NULL NULL NULL 5 100.00 
2 SUBQUERY t2 NULL ref idx_name idx_name 767 const 1 100.00 Using where`;

      const result = parser.parse(input);

      expect(result).toHaveLength(2);

      // First row
      expect(result[0].id).toBe(1);
      expect(result[0].selectType.value).toBe('SIMPLE');
      expect(result[0].table).toBe('t1');
      expect(result[0].type.value).toBe('ALL');
      expect(result[0].possibleKeys).toBe(''); // 空文字列 (2スペース)
      expect(result[0].key).toBeNull(); // NULL
      expect(result[0].extra).toBe(''); // 空文字列 (末尾のスペース)

      // Second row
      expect(result[1].id).toBe(2);
      expect(result[1].selectType.value).toBe('SUBQUERY');
      expect(result[1].table).toBe('t2');
      expect(result[1].type.value).toBe('ref');
      expect(result[1].key).toBe('idx_name');
      expect(result[1].keyLen).toBe('767');
      expect(result[1].ref).toBe('const');
      expect(result[1].extra).toBe('Using where');
    });
  });
});
