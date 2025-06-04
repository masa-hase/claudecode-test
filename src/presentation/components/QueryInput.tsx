'use client';

import type { FC } from 'react';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const QueryInput: FC<QueryInputProps> = ({
  value,
  onChange,
  onAnalyze,
  isLoading = false,
  error,
}) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <label htmlFor="query-input" className="block text-sm font-medium text-gray-700 mb-2">
          SQLクエリを入力
        </label>
        <textarea
          id="query-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[200px] p-4 border border-gray-400 rounded-md font-mono text-sm text-gray-900 bg-gray-50 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`SELECT u.id, u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name
ORDER BY post_count DESC
LIMIT 10`}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={isLoading || !value.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '解析中...' : 'クエリを分析する'}
      </button>
    </div>
  );
};
