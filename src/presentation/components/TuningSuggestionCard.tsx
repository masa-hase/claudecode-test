import type React from 'react';
import type { TuningSuggestion } from '../../domain/services/TuningSuggestion';

interface TuningSuggestionCardProps {
  suggestion: TuningSuggestion;
}

export const TuningSuggestionCard: React.FC<TuningSuggestionCardProps> = ({ suggestion }) => {
  const getSeverityStyles = () => {
    switch (suggestion.severity) {
      case 'critical':
        return {
          container: 'text-red-700 bg-red-50 border-red-300',
          badge: 'bg-red-100 text-red-800',
          label: '重要',
        };
      case 'warning':
        return {
          container: 'text-amber-700 bg-amber-50 border-amber-300',
          badge: 'bg-amber-100 text-amber-800',
          label: '警告',
        };
      default:
        return {
          container: 'text-blue-700 bg-blue-50 border-blue-300',
          badge: 'bg-blue-100 text-blue-800',
          label: '情報',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className={`p-4 border rounded-md ${styles.container}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-current">{suggestion.title}</h3>
          <p className="mt-1 text-current">{suggestion.description}</p>
          {suggestion.recommendation && (
            <div className="mt-2">
              <span className="font-medium text-current">推奨対策:</span>
              <p className="mt-1 text-current">{suggestion.recommendation}</p>
            </div>
          )}
        </div>
        <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${styles.badge}`}>
          {styles.label}
        </span>
      </div>
    </div>
  );
};
