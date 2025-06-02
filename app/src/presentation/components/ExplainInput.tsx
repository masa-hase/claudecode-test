import type React from 'react';

interface ExplainInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading?: boolean;
}

export const ExplainInput: React.FC<ExplainInputProps> = ({
  value,
  onChange,
  onAnalyze,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">EXPLAIN結果を入力</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 p-3 border border-gray-400 rounded-md font-mono text-base text-gray-900 bg-gray-50 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="MySQLのEXPLAIN結果をここに貼り付けてください（テーブル形式、垂直形式、CSV形式対応）..."
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={onAnalyze}
        disabled={!value.trim() || isLoading}
        className={`mt-4 px-6 py-2 rounded-md transition-colors ${
          !value.trim() || isLoading
            ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? '分析中...' : '分析する'}
      </button>
    </div>
  );
};
