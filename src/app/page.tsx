'use client';

import { ExplainInput } from '@/presentation/components/ExplainInput';
import { ExplainResultTable } from '@/presentation/components/ExplainResultTable';
import { QueryInfoDisplay } from '@/presentation/components/QueryInfoDisplay';
import { QueryInput } from '@/presentation/components/QueryInput';
import { QueryOptimizationDisplay } from '@/presentation/components/QueryOptimizationDisplay';
import { TuningSuggestionCard } from '@/presentation/components/TuningSuggestionCard';
import { useExplainAnalyzer } from '@/presentation/hooks/useExplainAnalyzer';
import { useQueryAnalyzer } from '@/presentation/hooks/useQueryAnalyzer';
import { useState } from 'react';

type AnalysisMode = 'explain' | 'query';

export default function Home() {
  const [mode, setMode] = useState<AnalysisMode>('explain');

  const explainAnalyzer = useExplainAnalyzer();
  const queryAnalyzer = useQueryAnalyzer();

  const handleModeChange = (newMode: AnalysisMode) => {
    setMode(newMode);
    // Reset both analyzers when switching modes
    explainAnalyzer.reset();
    queryAnalyzer.reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MySQL EXPLAIN分析ツール</h1>

        {/* Mode Selector */}
        <div className="mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => handleModeChange('explain')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                mode === 'explain'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              EXPLAIN結果を分析
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('query')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                mode === 'query'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              SQLクエリを分析
            </button>
          </div>
        </div>

        {/* Analysis Input Area */}
        <div className="mb-8">
          {mode === 'explain' ? (
            <ExplainInput
              value={explainAnalyzer.explainInput}
              onChange={explainAnalyzer.setExplainInput}
              onAnalyze={explainAnalyzer.analyze}
              isLoading={explainAnalyzer.isLoading}
              error={explainAnalyzer.error}
            />
          ) : (
            <QueryInput
              value={queryAnalyzer.queryInput}
              onChange={queryAnalyzer.setQueryInput}
              onAnalyze={queryAnalyzer.analyze}
              isLoading={queryAnalyzer.isLoading}
              error={queryAnalyzer.error}
            />
          )}
        </div>

        {/* Results Area */}
        {mode === 'explain' && explainAnalyzer.rows.length > 0 && (
          <>
            <div className="mb-8">
              <ExplainResultTable rows={explainAnalyzer.rows} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">チューニング提案</h2>
              {explainAnalyzer.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {explainAnalyzer.suggestions.map((suggestion, index) => (
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

        {mode === 'query' && queryAnalyzer.queryInfo && (
          <>
            <div className="mb-8">
              <QueryInfoDisplay queryInfo={queryAnalyzer.queryInfo} />
            </div>

            <div className="mb-8">
              <QueryOptimizationDisplay
                suggestions={queryAnalyzer.suggestions}
                optimizedQuery={queryAnalyzer.optimizedQuery}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
