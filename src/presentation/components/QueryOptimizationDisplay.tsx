'use client';

import type { OptimizedQuery } from '@/domain/services/QueryOptimizer';
import type { QueryTuningSuggestion } from '@/domain/services/QueryTuningAnalyzer';
import React from 'react';

interface QueryOptimizationDisplayProps {
  suggestions: QueryTuningSuggestion[];
  optimizedQuery?: OptimizedQuery;
}

export function QueryOptimizationDisplay({
  suggestions,
  optimizedQuery,
}: QueryOptimizationDisplayProps) {
  const getLevelBadgeClass = (level: QueryTuningSuggestion['level']) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getImpactBadgeClass = (impact?: QueryTuningSuggestion['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-purple-100 text-purple-800';
      case 'medium':
        return 'bg-indigo-100 text-indigo-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 最適化されたクエリ */}
      {optimizedQuery && optimizedQuery.changes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最適化されたクエリ</h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">推定改善率</span>
              <span className="text-2xl font-bold text-gray-900">
                {optimizedQuery.estimatedImprovement}%
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${optimizedQuery.estimatedImprovement}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-md p-4 border border-green-200">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {optimizedQuery.optimized}
            </pre>
          </div>

          {/* 変更点 */}
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">適用された最適化:</h4>
            {optimizedQuery.changes.map((change) => (
              <div
                key={`${change.type}-${change.description}`}
                className="bg-white rounded-md p-3 border border-green-100"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-900">{change.description}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {change.type}
                  </span>
                </div>
                {change.before && change.after && (
                  <div className="mt-2 text-xs">
                    <div className="text-red-600">- {change.before}</div>
                    <div className="text-green-600">+ {change.after}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最適化提案 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          最適化提案 ({suggestions.length}件)
        </h3>

        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-700">
            最適化の提案はありません。クエリは既に最適化されています。
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={`${suggestion.level}-${suggestion.type}-${suggestion.description}`}
                className={`border rounded-lg p-4 ${
                  suggestion.level === 'critical'
                    ? 'border-red-300 bg-red-50'
                    : suggestion.level === 'warning'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${getLevelBadgeClass(suggestion.level)}`}
                    >
                      {suggestion.level.toUpperCase()}
                    </span>
                    {suggestion.impact && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getImpactBadgeClass(suggestion.impact)}`}
                      >
                        影響: {suggestion.impact}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-900">{suggestion.type}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-900 font-medium mb-2">{suggestion.description}</p>

                <div className="bg-white bg-opacity-60 rounded p-3 mb-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">提案:</span> {suggestion.suggestion}
                  </p>
                </div>

                {suggestion.example && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-700">例:</span>
                    <pre className="mt-1 text-xs bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto">
                      {suggestion.example}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
