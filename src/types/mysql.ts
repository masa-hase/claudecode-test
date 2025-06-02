export interface ExplainResult {
  id: number;
  select_type: string;
  table: string | null;
  partitions: string | null;
  type: string | null;
  possible_keys: string | null;
  key: string | null;
  key_len: string | null;
  ref: string | null;
  rows: number | null;
  filtered: number | null;
  Extra: string | null;
}

export type SuggestionSeverity = 'critical' | 'warning' | 'info';

export interface TuningSuggestion {
  title: string;
  description: string;
  recommendation?: string;
  severity: SuggestionSeverity;
}
