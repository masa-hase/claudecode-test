import { useCallback, useState } from 'react';
import { AnalyzeQueryUseCase } from '../../application/useCases/AnalyzeQueryUseCase';
import { type OptimizedQuery, QueryOptimizer } from '../../domain/services/QueryOptimizer';
import { type QueryInfo, QueryParser } from '../../domain/services/QueryParser';
import {
  QueryTuningAnalyzer,
  type QueryTuningSuggestion,
} from '../../domain/services/QueryTuningAnalyzer';

export const useQueryAnalyzer = () => {
  const [queryInput, setQueryInput] = useState('');
  const [queryInfo, setQueryInfo] = useState<QueryInfo | null>(null);
  const [suggestions, setSuggestions] = useState<QueryTuningSuggestion[]>([]);
  const [optimizedQuery, setOptimizedQuery] = useState<OptimizedQuery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetQueryInput = useCallback((value: string) => {
    setQueryInput(value);
    setError(null); // Clear error when input changes
  }, []);

  const analyze = useCallback(async () => {
    if (!queryInput.trim()) {
      setError('SQLクエリを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parser = new QueryParser();
      const analyzer = new QueryTuningAnalyzer();
      const useCase = new AnalyzeQueryUseCase(parser, analyzer);

      const result = await useCase.execute(queryInput);

      setQueryInfo(result.queryInfo);
      setSuggestions(result.suggestions);

      // クエリの最適化
      const optimizer = new QueryOptimizer();
      const optimized = optimizer.optimize(queryInput, result.queryInfo);
      setOptimizedQuery(optimized);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析中にエラーが発生しました');
      setQueryInfo(null);
      setSuggestions([]);
      setOptimizedQuery(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryInput]);

  const reset = useCallback(() => {
    setQueryInput('');
    setQueryInfo(null);
    setSuggestions([]);
    setOptimizedQuery(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    queryInput,
    setQueryInput: handleSetQueryInput,
    queryInfo,
    suggestions,
    optimizedQuery,
    error,
    isLoading,
    analyze,
    reset,
  };
};
