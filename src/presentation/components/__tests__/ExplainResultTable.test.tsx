import { render, screen } from '@testing-library/react';
import { ExplainRow } from '../../../domain/entities/ExplainRow';
import { AccessType } from '../../../domain/valueObjects/AccessType';
import { QueryType } from '../../../domain/valueObjects/QueryType';
import { RowCount } from '../../../domain/valueObjects/RowCount';
import { ExplainResultTable } from '../ExplainResultTable';

describe('ExplainResultTable', () => {
  const createMockRow = (overrides?: Record<string, unknown>): ExplainRow => {
    return new ExplainRow({
      id: 1,
      selectType: new QueryType('SIMPLE'),
      table: 'users',
      partitions: null,
      type: new AccessType('ALL'),
      possibleKeys: null,
      key: null,
      keyLen: null,
      ref: null,
      rows: new RowCount(1000),
      filtered: 100.0,
      extra: null,
      ...overrides,
    });
  };

  it('should render table headers', () => {
    render(<ExplainResultTable rows={[]} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Select Type')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Possible Keys')).toBeInTheDocument();
    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Rows')).toBeInTheDocument();
    expect(screen.getByText('Filtered')).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  it('should render empty state when no rows', () => {
    render(<ExplainResultTable rows={[]} />);

    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('should render single row data', () => {
    const row = createMockRow();
    render(<ExplainResultTable rows={[row]} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('SIMPLE')).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('ALL')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render multiple rows', () => {
    const rows = [
      createMockRow({ id: 1, table: 'users' }),
      createMockRow({
        id: 2,
        table: 'orders',
        type: new AccessType('ref'),
        key: 'user_id',
        rows: new RowCount(10),
      }),
    ];
    render(<ExplainResultTable rows={rows} />);

    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('orders')).toBeInTheDocument();
    expect(screen.getByText('ref')).toBeInTheDocument();
    expect(screen.getByText('user_id')).toBeInTheDocument();
  });

  it('should highlight performance issues', () => {
    const row = createMockRow({
      type: new AccessType('ALL'),
      rows: new RowCount(10000),
    });
    render(<ExplainResultTable rows={[row]} />);

    // Check if ALL type is highlighted
    const typeCell = screen.getByText('ALL').closest('td');
    expect(typeCell).toHaveClass('text-red-700');
  });

  it('should show NULL values as dash', () => {
    const row = createMockRow({
      key: null,
      extra: null,
    });
    render(<ExplainResultTable rows={[row]} />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('should format filtered percentage', () => {
    const row = createMockRow({ filtered: 50.5 });
    render(<ExplainResultTable rows={[row]} />);

    expect(screen.getByText('50.5%')).toBeInTheDocument();
  });
});
