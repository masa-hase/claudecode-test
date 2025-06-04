import type { QueryInfo, QueryParser } from '../../domain/services/QueryParser';
import type {
  QueryTuningAnalyzer,
  QueryTuningSuggestion,
} from '../../domain/services/QueryTuningAnalyzer';

export interface AnalyzeQueryResult {
  queryInfo: QueryInfo;
  suggestions: QueryTuningSuggestion[];
}

export class AnalyzeQueryUseCase {
  constructor(
    private readonly parser: QueryParser,
    private readonly analyzer: QueryTuningAnalyzer
  ) {}

  async execute(sqlQuery: string): Promise<AnalyzeQueryResult> {
    // Parse SQL query
    const queryInfo = this.parser.parse(sqlQuery);

    // Analyze for performance issues
    const suggestions = this.analyzer.analyze(queryInfo);

    return {
      queryInfo,
      suggestions,
    };
  }
}
