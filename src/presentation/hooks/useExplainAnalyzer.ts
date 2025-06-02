import { useCallback, useState } from 'react';
import { AnalyzeExplainUseCase } from '../../application/useCases/AnalyzeExplainUseCase';
import type { ExplainRow } from '../../domain/entities/ExplainRow';
import { QueryAnalyzer } from '../../domain/services/QueryAnalyzer';
import type { TuningSuggestion } from '../../domain/services/TuningSuggestion';
import { ExplainParser } from '../../infrastructure/parsers/ExplainParser';

export const useExplainAnalyzer = () => {
  const [explainInput, setExplainInput] = useState('');
  const [rows, setRows] = useState<ExplainRow[]>([]);
  const [suggestions, setSuggestions] = useState<TuningSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetExplainInput = useCallback((value: string) => {
    setExplainInput(value);
    setError(null); // Clear error when input changes
  }, []);

  const analyze = useCallback(async () => {
    if (!explainInput.trim()) {
      setError('EXPLAIN結果を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parser = new ExplainParser();
      const analyzer = new QueryAnalyzer();
      const useCase = new AnalyzeExplainUseCase(parser, analyzer);

      const result = await useCase.execute(explainInput);

      setRows(result.rows);
      setSuggestions(result.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析中にエラーが発生しました');
      setRows([]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [explainInput]);

  const reset = useCallback(() => {
    setExplainInput('');
    setRows([]);
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    explainInput,
    setExplainInput: handleSetExplainInput,
    rows,
    suggestions,
    error,
    isLoading,
    analyze,
    reset,
  };
};
