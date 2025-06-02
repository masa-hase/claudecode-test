import { ExplainRow } from '../../domain/entities/ExplainRow';
import { AccessType } from '../../domain/valueObjects/AccessType';
import { QueryType } from '../../domain/valueObjects/QueryType';
import { RowCount } from '../../domain/valueObjects/RowCount';

export class ExplainParser {
  parse(input: string): ExplainRow[] {
    if (!input || input.trim() === '') {
      throw new Error('Empty EXPLAIN result');
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

    // Check if it's table format
    if (trimmedInput.includes('+----+')) {
      return this.parseTableFormat(trimmedInput);
    }

    throw new Error('Invalid EXPLAIN format');
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

  private parseTableFormat(input: string): ExplainRow[] {
    const lines = input.split('\n').filter((line) => line.trim());

    // Find header line
    const headerIndex = lines.findIndex((line) => line.includes('| id |'));
    if (headerIndex === -1) {
      throw new Error('Invalid EXPLAIN format: header not found');
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
      throw new Error('Invalid CSV format: no data rows found');
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
      extra: this.parseNullableString(data.Extra || data.extra),
    });
  }

  private parseNullableString(value: string | undefined): string | null {
    if (!value || value === 'NULL' || value === 'null') {
      return null;
    }
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
