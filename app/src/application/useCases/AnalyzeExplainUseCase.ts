import type { ExplainRow } from '../../domain/entities/ExplainRow';
import type { QueryAnalyzer } from '../../domain/services/QueryAnalyzer';
import type { TuningSuggestion } from '../../domain/services/TuningSuggestion';
import type { ExplainParser } from '../../infrastructure/parsers/ExplainParser';

export interface AnalyzeExplainResult {
  rows: ExplainRow[];
  suggestions: TuningSuggestion[];
}

export class AnalyzeExplainUseCase {
  constructor(
    private readonly parser: ExplainParser,
    private readonly analyzer: QueryAnalyzer
  ) {}

  async execute(explainResult: string): Promise<AnalyzeExplainResult> {
    // Parse EXPLAIN result
    const rows = this.parser.parse(explainResult);

    // Analyze for performance issues
    const suggestions = this.analyzer.analyze(rows);

    return {
      rows,
      suggestions,
    };
  }
}
