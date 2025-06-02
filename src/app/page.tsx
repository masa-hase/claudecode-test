'use client';

import { ExplainInput } from '@/presentation/components/ExplainInput';
import { ExplainResultTable } from '@/presentation/components/ExplainResultTable';
import { TuningSuggestionCard } from '@/presentation/components/TuningSuggestionCard';
import { useExplainAnalyzer } from '@/presentation/hooks/useExplainAnalyzer';

export default function Home() {
  const { explainInput, setExplainInput, rows, suggestions, error, isLoading, analyze } =
    useExplainAnalyzer();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MySQL EXPLAIN分析ツール</h1>

        <div className="mb-8">
          <ExplainInput
            value={explainInput}
            onChange={setExplainInput}
            onAnalyze={analyze}
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <>
            <div className="mb-8">
              <ExplainResultTable rows={rows} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">チューニング提案</h2>
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <TuningSuggestionCard
                      key={`${suggestion.severity}-${index}`}
                      suggestion={suggestion}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-700">現在のクエリは最適化されています。</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
