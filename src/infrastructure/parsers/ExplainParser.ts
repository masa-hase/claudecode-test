import { ExplainRow } from '../../domain/entities/ExplainRow';
import { AccessType } from '../../domain/valueObjects/AccessType';
import { QueryType } from '../../domain/valueObjects/QueryType';
import { RowCount } from '../../domain/valueObjects/RowCount';

const MIN_ALIGNED_FORMAT_SPACES = 3;
const MAX_SINGLE_SPACE_FORMAT_SPACES = 2;
const MAX_HEADER_COLUMN_DIFFERENCE = 2;

/**
 * Detects the format type of plain table EXPLAIN output
 */
function detectPlainTableFormatType(
  headerLine: string,
  firstDataLine: string
): 'aligned' | 'single-space' | 'space-separated' {
  // First check for aligned format (with padding spaces)
  const maxConsecutiveSpaces = Math.max(
    ...(firstDataLine.match(/\s+/g) || []).map((s) => s.length)
  );

  if (maxConsecutiveSpaces > MIN_ALIGNED_FORMAT_SPACES) {
    return 'aligned';
  }

  // Check if it's MySQL Workbench single-space format
  // In single-space format:
  // - Values are separated by exactly one space
  // - Empty values appear as consecutive spaces
  // - Column count should roughly match header count (allowing for Extra column containing spaces)
  const headerParts = headerLine.trim().split(/\s+/);
  const dataParts = firstDataLine.split(' ');

  // Remove trailing empty parts (caused by trailing spaces)
  while (dataParts.length > 0 && dataParts[dataParts.length - 1] === '') {
    dataParts.pop();
  }

  // For single-space format, the number of data parts should be close to the number of headers
  // We allow some difference because the Extra column might contain spaces
  const partsDifference = Math.abs(dataParts.length - headerParts.length);

  // Single-space format criteria:
  // 1. No long sequences of spaces (maxConsecutiveSpaces <= 2)
  // 2. Column count difference within acceptable range (allows for Extra column variations)
  if (
    partsDifference <= MAX_HEADER_COLUMN_DIFFERENCE &&
    maxConsecutiveSpaces <= MAX_SINGLE_SPACE_FORMAT_SPACES
  ) {
    return 'single-space';
  }

  return 'space-separated';
}

export class ExplainParser {
  private static readonly MIN_TSV_COLUMNS = 5;

  private static readonly EXPLAIN_COLUMNS = {
    ID: 'id',
    SELECT_TYPE: 'select_type',
    TABLE: 'table',
    PARTITIONS: 'partitions',
    TYPE: 'type',
    POSSIBLE_KEYS: 'possible_keys',
    KEY: 'key',
    KEY_LEN: 'key_len',
    REF: 'ref',
    ROWS: 'rows',
    FILTERED: 'filtered',
    EXTRA: 'Extra',
  } as const;

  private static readonly COLUMN_ORDER = [
    ExplainParser.EXPLAIN_COLUMNS.ID,
    ExplainParser.EXPLAIN_COLUMNS.SELECT_TYPE,
    ExplainParser.EXPLAIN_COLUMNS.TABLE,
    ExplainParser.EXPLAIN_COLUMNS.PARTITIONS,
    ExplainParser.EXPLAIN_COLUMNS.TYPE,
    ExplainParser.EXPLAIN_COLUMNS.POSSIBLE_KEYS,
    ExplainParser.EXPLAIN_COLUMNS.KEY,
    ExplainParser.EXPLAIN_COLUMNS.KEY_LEN,
    ExplainParser.EXPLAIN_COLUMNS.REF,
    ExplainParser.EXPLAIN_COLUMNS.ROWS,
    ExplainParser.EXPLAIN_COLUMNS.FILTERED,
    ExplainParser.EXPLAIN_COLUMNS.EXTRA,
  ];

  // Pre-compiled regular expressions for performance
  private static readonly COLUMN_REGEX_MAP = new Map<string, RegExp>();

  static {
    // Initialize pre-compiled regular expressions for each column
    for (const colName of ExplainParser.COLUMN_ORDER) {
      ExplainParser.COLUMN_REGEX_MAP.set(colName, new RegExp(`\\b${colName}\\b`, 'i'));
    }
  }

  parse(input: string): ExplainRow[] {
    if (!input || input.trim() === '') {
      throw new Error('Empty or whitespace-only EXPLAIN result provided');
    }

    const trimmedInput = input.trim();

    // Check if it's CSV format
    if (this.isCSVFormat(trimmedInput)) {
      return this.parseCSVFormat(trimmedInput);
    }

    // Check if it's vertical format (\G)
    if (trimmedInput.includes('***************************')) {
      return this.parseVerticalFormat(trimmedInput);
    }

    // Check if it's table format with borders
    if (trimmedInput.includes('+----+')) {
      return this.parseTableFormat(trimmedInput);
    }

    // Check if it's tab-separated format (MySQL Workbench)
    if (this.isTSVFormat(trimmedInput)) {
      return this.parseTSVFormat(trimmedInput);
    }

    // Try to parse as plain table format (MySQL Workbench without borders)
    if (this.isPlainTableFormat(trimmedInput)) {
      // For plain table format, use the original input to preserve trailing spaces
      return this.parsePlainTableFormat(input);
    }

    throw new Error(
      'Unsupported EXPLAIN format. Supported formats: CSV, TSV, table with borders (+----+), vertical (\\G), or plain table format.'
    );
  }

  private isCSVFormat(input: string): boolean {
    const firstLine = input.split('\n')[0];
    // Check if it looks like CSV header with common EXPLAIN columns
    return (
      firstLine.includes('"id"') &&
      firstLine.includes('"select_type"') &&
      firstLine.includes('"table"')
    );
  }

  /**
   * Checks if the input is in TSV (Tab-Separated Values) format
   * commonly used by MySQL Workbench when exporting EXPLAIN results
   */
  private isTSVFormat(input: string): boolean {
    const firstLine = input.split('\n')[0];
    // Check if it's tab-separated and contains EXPLAIN columns
    const tabs = firstLine.split('\t');
    return (
      tabs.length > ExplainParser.MIN_TSV_COLUMNS &&
      tabs.some((col) => col.toLowerCase() === ExplainParser.EXPLAIN_COLUMNS.ID) &&
      tabs.some((col) => col.toLowerCase() === ExplainParser.EXPLAIN_COLUMNS.SELECT_TYPE) &&
      tabs.some((col) => col.toLowerCase() === ExplainParser.EXPLAIN_COLUMNS.TABLE)
    );
  }

  /**
   * Checks if the input is in plain table format without borders
   * commonly used by MySQL Workbench when copying results
   */
  private isPlainTableFormat(input: string): boolean {
    const lines = input.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return false;

    const firstLine = lines[0].toLowerCase();
    // Check if first line contains typical EXPLAIN column headers separated by spaces
    return (
      firstLine.includes(ExplainParser.EXPLAIN_COLUMNS.ID) &&
      firstLine.includes(ExplainParser.EXPLAIN_COLUMNS.SELECT_TYPE) &&
      firstLine.includes(ExplainParser.EXPLAIN_COLUMNS.TABLE) &&
      !firstLine.includes('|') &&
      !firstLine.includes('\t')
    );
  }

  private parseTableFormat(input: string): ExplainRow[] {
    const lines = input.split('\n').filter((line) => line.trim());

    // Find header line
    const headerIndex = lines.findIndex((line) => line.includes('| id |'));
    if (headerIndex === -1) {
      throw new Error('Invalid table format: header line with "| id |" not found');
    }

    // Extract column names
    const headerLine = lines[headerIndex];
    const columns = headerLine
      .split('|')
      .filter((col) => col.trim())
      .map((col) => col.trim());

    const rows: ExplainRow[] = [];

    // Parse data rows
    for (let i = headerIndex + 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('|') || line.includes('+----+')) continue;

      const values = line
        .split('|')
        .filter((val) => val !== '')
        .map((val) => val.trim());

      if (values.length !== columns.length) continue;

      const rowData: Record<string, string> = {};
      columns.forEach((col, index) => {
        rowData[col] = values[index];
      });

      rows.push(this.createExplainRow(rowData));
    }

    return rows;
  }

  private parseVerticalFormat(input: string): ExplainRow[] {
    const rows: ExplainRow[] = [];
    const blocks = input.split('***************************').filter((block) => block.trim());

    for (const block of blocks) {
      const rowData: Record<string, string> = {};
      const lines = block.split('\n').filter((line) => line.includes(':'));

      for (const line of lines) {
        const [key, value] = line.split(':').map((s) => s.trim());
        if (key && value !== undefined) {
          rowData[key] = value;
        }
      }

      if (Object.keys(rowData).length > 0) {
        rows.push(this.createExplainRow(rowData));
      }
    }

    return rows;
  }

  private parseCSVFormat(input: string): ExplainRow[] {
    const lines = input.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error('Invalid CSV format: missing data rows after header');
    }

    // Parse CSV header
    const headers = this.parseCSVLine(lines[0]);
    const rows: ExplainRow[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);

      if (values.length !== headers.length) continue;

      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      rows.push(this.createExplainRow(rowData));
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && !insideQuotes) {
        insideQuotes = true;
      } else if (char === '"' && insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else if (char === '"' && insideQuotes) {
        insideQuotes = false;
      } else if (char === ',' && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  /**
   * Parses TSV (Tab-Separated Values) format EXPLAIN output
   * This format is used when exporting from MySQL Workbench
   */
  private parseTSVFormat(input: string): ExplainRow[] {
    const lines = input.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error('Invalid TSV format: missing data rows after tab-separated header');
    }

    // Parse TSV header
    const headers = lines[0].split('\t').map((h) => h.trim());
    const rows: ExplainRow[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map((v) => v.trim());

      if (values.length !== headers.length) continue;

      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      rows.push(this.createExplainRow(rowData));
    }

    return rows;
  }

  /**
   * Parses plain table format EXPLAIN output without borders
   * Detects the specific format type and delegates to appropriate parser
   */
  private parsePlainTableFormat(input: string): ExplainRow[] {
    // Don't filter with trim() as it removes important trailing spaces
    const lines = input.split('\n').filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new Error('Invalid plain table format: missing data rows after header line');
    }

    const headerLine = lines[0];
    const firstDataLine = lines[1];

    const formatType = detectPlainTableFormatType(headerLine, firstDataLine);

    // Debug logging for format detection
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`ExplainParser: Detected plain table format type: ${formatType}`);
    }

    switch (formatType) {
      case 'aligned':
        return this.parseAlignedTableFormat(lines);
      case 'single-space':
        return this.parseSingleSpaceFormat(lines);
      default:
        return this.parseSpaceSeparatedFormat(lines);
    }
  }

  /**
   * Parses aligned table format where columns are positioned at fixed locations
   */
  private parseAlignedTableFormat(lines: string[]): ExplainRow[] {
    const headerLine = lines[0];
    const headers: Array<{ name: string; start: number; end: number }> = [];

    // Find column positions in the header using pre-compiled regex
    for (const colName of ExplainParser.COLUMN_ORDER) {
      const regex = ExplainParser.COLUMN_REGEX_MAP.get(colName);
      if (!regex) continue;
      const match = headerLine.match(regex);
      if (match && match.index !== undefined) {
        headers.push({
          name: colName,
          start: match.index,
          end: match.index + colName.length,
        });
      }
    }

    // Sort headers by position
    headers.sort((a, b) => a.start - b.start);

    // Adjust end positions based on the start of the next column
    for (let i = 0; i < headers.length - 1; i++) {
      headers[i].end = headers[i + 1].start;
    }
    // Last column extends to end of line
    if (headers.length > 0) {
      headers[headers.length - 1].end = Number.MAX_SAFE_INTEGER;
    }

    const rows: ExplainRow[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const rowData: Record<string, string> = {};

      for (const header of headers) {
        const value = line.substring(header.start, Math.min(header.end, line.length)).trim();
        rowData[header.name] = value || 'NULL';
      }

      rows.push(this.createExplainRow(rowData));
    }

    return rows;
  }

  /**
   * Parses space-separated format where values are separated by multiple spaces
   */
  private parseSpaceSeparatedFormat(lines: string[]): ExplainRow[] {
    const headerLine = lines[0];
    const headers = headerLine.split(/\s+/);
    const rows: ExplainRow[] = [];

    // Parse data rows (for formats where values are separated by multiple spaces)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].trim().split(/\s+/);
      const rowData: Record<string, string> = {};

      // Map values to headers, handling the Extra column which might contain spaces
      for (let j = 0; j < headers.length; j++) {
        if (
          headers[j].toLowerCase() === ExplainParser.EXPLAIN_COLUMNS.EXTRA.toLowerCase() &&
          j === headers.length - 1
        ) {
          // Extra is the last column and might contain spaces
          rowData[headers[j]] = values.slice(j).join(' ');
        } else {
          rowData[headers[j]] = values[j] || 'NULL';
        }
      }

      rows.push(this.createExplainRow(rowData));
    }

    return rows;
  }

  /**
   * Parses MySQL Workbench single-space separated format
   * In this format:
   * - Values are separated by single spaces
   * - Empty values are represented by consecutive spaces
   * - NULL values are the literal string "NULL"
   */
  private parseSingleSpaceFormat(lines: string[]): ExplainRow[] {
    const headerLine = lines[0];
    const headers = headerLine.trim().split(/\s+/);
    const rows: ExplainRow[] = [];

    // For true single-space separated format (MySQL Workbench)
    // In this format:
    // - Values are separated by single spaces
    // - Empty values are represented by consecutive spaces (which become empty strings when split)
    // - NULL values are the literal string "NULL"

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Split by single space to preserve empty values
      // Don't trim the line to keep trailing spaces
      const parts = line.split(' ');

      // Remove trailing empty parts (from trailing spaces)
      while (parts.length > 0 && parts[parts.length - 1] === '') {
        parts.pop();
      }

      // For exact match of parts to headers, do simple mapping
      if (parts.length === headers.length) {
        const rowData: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          rowData[headers[j]] = parts[j];
        }
        rows.push(this.createExplainRow(rowData));
      } else {
        // Handle cases where Extra column might contain spaces
        const rowData: Record<string, string> = {};

        // Map all columns except Extra
        for (let j = 0; j < headers.length - 1; j++) {
          rowData[headers[j]] = parts[j] || '';
        }

        // Extra column gets all remaining parts joined
        const extraIndex = headers.length - 1;
        if (
          headers[extraIndex].toLowerCase() === ExplainParser.EXPLAIN_COLUMNS.EXTRA.toLowerCase()
        ) {
          const extraParts = parts.slice(extraIndex);
          rowData[headers[extraIndex]] = extraParts.join(' ');
        } else {
          rowData[headers[extraIndex]] = parts[extraIndex] || '';
        }

        rows.push(this.createExplainRow(rowData));
      }
    }

    return rows;
  }

  private createExplainRow(data: Record<string, string>): ExplainRow {
    return new ExplainRow({
      id: this.parseNumber(data.id) || 0,
      selectType: new QueryType(data.select_type || 'SIMPLE'),
      table: this.parseNullableString(data.table),
      partitions: this.parseNullableString(data.partitions),
      type: new AccessType(this.parseNullableString(data.type)),
      possibleKeys: this.parseNullableString(data.possible_keys),
      key: this.parseNullableString(data.key),
      keyLen: this.parseNullableString(data.key_len),
      ref: this.parseNullableString(data.ref),
      rows: new RowCount(this.parseNumber(data.rows)),
      filtered: this.parseNumber(data.filtered),
      extra: this.parseNullableString(data.Extra !== undefined ? data.Extra : data.extra),
    });
  }

  private parseNullableString(value: string | undefined): string | null {
    if (value === undefined || value === 'NULL' || value === 'null') {
      return null;
    }
    // Empty string should be preserved as empty string, not converted to null
    return value;
  }

  private parseNumber(value: string | undefined): number | null {
    if (!value || value === 'NULL' || value === 'null') {
      return null;
    }
    const num = Number.parseFloat(value);
    return Number.isNaN(num) ? null : num;
  }
}
