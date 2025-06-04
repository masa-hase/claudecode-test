import { act, renderHook } from '@testing-library/react';
import { useQueryAnalyzer } from '../useQueryAnalyzer';

describe('useQueryAnalyzer', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    expect(result.current.queryInput).toBe('');
    expect(result.current.queryInfo).toBeNull();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should update query input', () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    act(() => {
      result.current.setQueryInput('SELECT * FROM users');
    });

    expect(result.current.queryInput).toBe('SELECT * FROM users');
  });

  it('should analyze SQL query', async () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    act(() => {
      result.current.setQueryInput('SELECT * FROM users');
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.queryInfo).not.toBeNull();
    expect(result.current.queryInfo?.type).toBe('SELECT');
    expect(result.current.queryInfo?.tables).toEqual(['USERS']);
    expect(result.current.suggestions.length).toBeGreaterThan(0);
  });

  it('should show error for empty input', async () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.error).toBe('SQLクエリを入力してください');
  });

  it('should clear error when input changes', async () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    act(() => {
      result.current.setQueryInput('');
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.error).toBe('SQLクエリを入力してください');

    act(() => {
      result.current.setQueryInput('SELECT * FROM users');
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset all state', async () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    act(() => {
      result.current.setQueryInput('SELECT * FROM users');
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.queryInfo).not.toBeNull();
    expect(result.current.suggestions.length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.queryInput).toBe('');
    expect(result.current.queryInfo).toBeNull();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle complex queries', async () => {
    const { result } = renderHook(() => useQueryAnalyzer());

    const complexQuery = `
      SELECT u.name, COUNT(p.id) as post_count 
      FROM users u 
      LEFT JOIN posts p ON u.id = p.user_id 
      WHERE u.status = 'active' 
      GROUP BY u.id, u.name 
      HAVING COUNT(p.id) > 5 
      ORDER BY post_count DESC 
      LIMIT 10
    `;

    act(() => {
      result.current.setQueryInput(complexQuery);
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.queryInfo).not.toBeNull();
    expect(result.current.queryInfo?.joins).toHaveLength(1);
    expect(result.current.queryInfo?.groupBy).toContain('U.ID');
    expect(result.current.queryInfo?.orderBy).toHaveLength(1);
    expect(result.current.queryInfo?.limit).toBe(10);
  });
});
