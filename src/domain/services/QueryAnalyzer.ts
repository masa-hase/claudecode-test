import type { ExplainRow } from '../entities/ExplainRow';
import { TuningSuggestion } from './TuningSuggestion';

export class QueryAnalyzer {
  private readonly LARGE_TABLE_THRESHOLD = 5000;
  private readonly HIGH_JOIN_COST_THRESHOLD = 50000;
  private readonly LOW_FILTERED_THRESHOLD = 30;

  analyze(rows: ExplainRow[]): TuningSuggestion[] {
    const suggestions: TuningSuggestion[] = [];

    // Analyze each row
    for (const row of rows) {
      // Check for full table scan
      if (row.isFullTableScan() && row.rows.value && row.rows.value > this.LARGE_TABLE_THRESHOLD) {
        suggestions.push(TuningSuggestion.fullTableScan(row.table, row.rows.value));
      }

      // Check for unused indexes
      if (row.hasUnusedIndex() && row.possibleKeys) {
        suggestions.push(TuningSuggestion.unusedIndex(row.table, row.possibleKeys));
      }

      // Check for filesort
      if (row.hasFilesort()) {
        suggestions.push(TuningSuggestion.filesort(row.table));
      }

      // Check for temporary table
      if (row.hasTemporaryTable()) {
        suggestions.push(TuningSuggestion.temporaryTable(row.table));
      }

      // Check for low filtered percentage
      if (row.filtered !== null && row.filtered < this.LOW_FILTERED_THRESHOLD) {
        suggestions.push(TuningSuggestion.lowFilteredPercentage(row.table, row.filtered));
      }
    }

    // Check for expensive joins
    if (rows.length > 1) {
      const totalCost = this.calculateJoinCost(rows);
      if (totalCost > this.HIGH_JOIN_COST_THRESHOLD) {
        suggestions.push(TuningSuggestion.highJoinCost(totalCost));
      }
    }

    return suggestions;
  }

  private calculateJoinCost(rows: ExplainRow[]): number {
    return rows.reduce((cost, row) => {
      const rowCost = row.getEstimatedCost();
      return cost === 0 ? rowCost : cost * rowCost;
    }, 0);
  }
}
