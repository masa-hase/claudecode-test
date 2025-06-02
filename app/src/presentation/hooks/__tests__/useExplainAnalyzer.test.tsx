import { act, renderHook } from '@testing-library/react';
import { useExplainAnalyzer } from '../useExplainAnalyzer';

describe('useExplainAnalyzer', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useExplainAnalyzer());

    expect(result.current.explainInput).toBe('');
    expect(result.current.rows).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should update explainInput', () => {
    const { result } = renderHook(() => useExplainAnalyzer());

    act(() => {
      result.current.setExplainInput('SELECT * FROM users');
    });

    expect(result.current.explainInput).toBe('SELECT * FROM users');
  });

  it('should analyze valid EXPLAIN result', async () => {
    const { result } = renderHook(() => useExplainAnalyzer());

    const validExplain = `+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+`;

    act(() => {
      result.current.setExplainInput(validExplain);
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].table).toBe('users');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle analysis error', async () => {
    const { result } = renderHook(() => useExplainAnalyzer());

    act(() => {
      result.current.setExplainInput('invalid explain');
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.rows).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBe('Invalid EXPLAIN format');
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear error when new input is set', async () => {
    const { result } = renderHook(() => useExplainAnalyzer());

    // First, cause an error
    act(() => {
      result.current.setExplainInput('invalid');
    });

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.error).toBe('Invalid EXPLAIN format');

    // Then, set new input
    act(() => {
      result.current.setExplainInput('new input');
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset all state', async () => {
    const { result } = renderHook(() => useExplainAnalyzer());

    // Set some state
    act(() => {
      result.current.setExplainInput('test');
    });

    await act(async () => {
      await result.current.analyze();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.explainInput).toBe('');
    expect(result.current.rows).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
