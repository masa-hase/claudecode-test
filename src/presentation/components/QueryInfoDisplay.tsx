'use client';

import type { FC } from 'react';
import type { QueryInfo } from '../../domain/services/QueryParser';

interface QueryInfoDisplayProps {
  queryInfo: QueryInfo;
}

export const QueryInfoDisplay: FC<QueryInfoDisplayProps> = ({ queryInfo }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">クエリ解析結果</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">クエリタイプ</h4>
          <p className="text-sm text-gray-900 font-medium">{queryInfo.type}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">対象テーブル</h4>
          <p className="text-sm text-gray-900 font-medium">
            {queryInfo.tables.length > 0 ? queryInfo.tables.join(', ') : 'なし'}
          </p>
        </div>

        {queryInfo.columns.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">選択カラム</h4>
            <p className="text-sm text-gray-900 font-medium">{queryInfo.columns.join(', ')}</p>
          </div>
        )}

        {queryInfo.joins.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">JOIN</h4>
            <ul className="text-sm text-gray-900 font-medium space-y-1">
              {queryInfo.joins.map((join, index) => (
                <li key={index}>
                  {join.type} JOIN {join.table} ON {join.condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        {queryInfo.whereConditions.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">WHERE条件</h4>
            <ul className="text-sm text-gray-900 font-medium space-y-1">
              {queryInfo.whereConditions.map((condition, index) => (
                <li key={index}>
                  {condition.column} {condition.operator} {condition.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {queryInfo.groupBy.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">GROUP BY</h4>
            <p className="text-sm text-gray-900 font-medium">{queryInfo.groupBy.join(', ')}</p>
          </div>
        )}

        {queryInfo.having && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">HAVING</h4>
            <p className="text-sm text-gray-900 font-medium">{queryInfo.having}</p>
          </div>
        )}

        {queryInfo.orderBy.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">ORDER BY</h4>
            <p className="text-sm text-gray-900 font-medium">
              {queryInfo.orderBy.map((o) => `${o.column} ${o.direction}`).join(', ')}
            </p>
          </div>
        )}

        {queryInfo.limit !== null && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">LIMIT</h4>
            <p className="text-sm text-gray-900 font-medium">{queryInfo.limit}</p>
          </div>
        )}

        {queryInfo.subqueries.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">サブクエリ</h4>
            <p className="text-sm text-gray-900 font-medium">
              {queryInfo.subqueries.length}個のサブクエリが含まれています
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
