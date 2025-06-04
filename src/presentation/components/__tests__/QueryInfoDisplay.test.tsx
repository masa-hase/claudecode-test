import { render, screen } from '@testing-library/react';
import type { QueryInfo } from '../../../domain/services/QueryParser';
import { QueryInfoDisplay } from '../QueryInfoDisplay';

describe('QueryInfoDisplay', () => {
  const baseQueryInfo: QueryInfo = {
    type: 'SELECT',
    tables: [],
    columns: [],
    joins: [],
    whereConditions: [],
    orderBy: [],
    groupBy: [],
    having: null,
    limit: null,
    subqueries: [],
  };

  it('should display query type', () => {
    render(<QueryInfoDisplay queryInfo={baseQueryInfo} />);
    expect(screen.getByText('クエリタイプ')).toBeInTheDocument();
    expect(screen.getByText('SELECT')).toBeInTheDocument();
  });

  it('should display tables', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      tables: ['users', 'posts'],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('対象テーブル')).toBeInTheDocument();
    expect(screen.getByText('users, posts')).toBeInTheDocument();
  });

  it('should display columns', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      columns: ['id', 'name', 'email'],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('選択カラム')).toBeInTheDocument();
    expect(screen.getByText('id, name, email')).toBeInTheDocument();
  });

  it('should display joins', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      joins: [
        { type: 'INNER', table: 'posts', condition: 'users.id = posts.user_id' },
        { type: 'LEFT', table: 'comments', condition: 'posts.id = comments.post_id' },
      ],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('JOIN')).toBeInTheDocument();
    expect(screen.getByText('INNER JOIN posts ON users.id = posts.user_id')).toBeInTheDocument();
    expect(
      screen.getByText('LEFT JOIN comments ON posts.id = comments.post_id')
    ).toBeInTheDocument();
  });

  it('should display where conditions', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      whereConditions: [
        { column: 'status', operator: '=', value: "'active'", type: 'AND' },
        { column: 'age', operator: '>', value: '18', type: 'AND' },
      ],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('WHERE条件')).toBeInTheDocument();
    expect(screen.getByText("status = 'active'")).toBeInTheDocument();
    expect(screen.getByText('age > 18')).toBeInTheDocument();
  });

  it('should display group by', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      groupBy: ['category', 'status'],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('GROUP BY')).toBeInTheDocument();
    expect(screen.getByText('category, status')).toBeInTheDocument();
  });

  it('should display having', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      having: 'COUNT(*) > 10',
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('HAVING')).toBeInTheDocument();
    expect(screen.getByText('COUNT(*) > 10')).toBeInTheDocument();
  });

  it('should display order by', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      orderBy: [
        { column: 'created_at', direction: 'DESC' },
        { column: 'name', direction: 'ASC' },
      ],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('ORDER BY')).toBeInTheDocument();
    expect(screen.getByText('created_at DESC, name ASC')).toBeInTheDocument();
  });

  it('should display limit', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      limit: 100,
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('LIMIT')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should display subqueries count', () => {
    const queryInfo: QueryInfo = {
      ...baseQueryInfo,
      subqueries: [
        { ...baseQueryInfo, type: 'SELECT' },
        { ...baseQueryInfo, type: 'SELECT' },
      ],
    };
    render(<QueryInfoDisplay queryInfo={queryInfo} />);
    expect(screen.getByText('サブクエリ')).toBeInTheDocument();
    expect(screen.getByText('2個のサブクエリが含まれています')).toBeInTheDocument();
  });

  it('should handle empty tables', () => {
    render(<QueryInfoDisplay queryInfo={baseQueryInfo} />);
    expect(screen.getByText('なし')).toBeInTheDocument();
  });
});
