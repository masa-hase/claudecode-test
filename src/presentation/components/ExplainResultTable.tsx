import type React from 'react';
import type { ExplainRow } from '../../domain/entities/ExplainRow';

interface ExplainResultTableProps {
  rows: ExplainRow[];
}

export const ExplainResultTable: React.FC<ExplainResultTableProps> = ({ rows }) => {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const getTypeClassName = (type: string | null): string => {
    if (!type) return '';

    switch (type) {
      case 'ALL':
        return 'text-red-700 font-semibold';
      case 'index':
        return 'text-amber-700 font-medium';
      case 'range':
      case 'ref':
        return 'text-blue-700';
      case 'eq_ref':
      case 'const':
      case 'system':
        return 'text-green-700 font-medium';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">解析結果</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Select Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Table
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Possible Keys
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rows
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Filtered
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Extra
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-4 text-center text-gray-700">
                  データがありません
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.id}-${row.table}`} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.selectType.value}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatValue(row.table)}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm ${getTypeClassName(row.type.value)}`}
                  >
                    {formatValue(row.type.value)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatValue(row.possibleKeys)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatValue(row.key)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatValue(row.rows.value)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.filtered !== null ? `${row.filtered}%` : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{formatValue(row.extra)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
