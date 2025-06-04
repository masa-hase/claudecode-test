import { fireEvent, render, screen } from '@testing-library/react';
import { QueryInput } from '../QueryInput';

describe('QueryInput', () => {
  const mockOnChange = jest.fn();
  const mockOnAnalyze = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial value', () => {
    render(
      <QueryInput value="SELECT * FROM users" onChange={mockOnChange} onAnalyze={mockOnAnalyze} />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('SELECT * FROM users');
  });

  it('should call onChange when text is entered', () => {
    render(<QueryInput value="" onChange={mockOnChange} onAnalyze={mockOnAnalyze} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'SELECT id FROM posts' } });

    expect(mockOnChange).toHaveBeenCalledWith('SELECT id FROM posts');
  });

  it('should call onAnalyze when button is clicked', () => {
    render(
      <QueryInput value="SELECT * FROM users" onChange={mockOnChange} onAnalyze={mockOnAnalyze} />
    );

    const button = screen.getByRole('button', { name: 'クエリを分析する' });
    fireEvent.click(button);

    expect(mockOnAnalyze).toHaveBeenCalled();
  });

  it('should disable button when value is empty', () => {
    render(<QueryInput value="" onChange={mockOnChange} onAnalyze={mockOnAnalyze} />);

    const button = screen.getByRole('button', { name: 'クエリを分析する' });
    expect(button).toBeDisabled();
  });

  it('should disable button when loading', () => {
    render(
      <QueryInput
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onAnalyze={mockOnAnalyze}
        isLoading={true}
      />
    );

    const button = screen.getByRole('button', { name: '解析中...' });
    expect(button).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'SQLクエリの形式が正しくありません';
    render(
      <QueryInput
        value="INVALID SQL"
        onChange={mockOnChange}
        onAnalyze={mockOnAnalyze}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should have correct placeholder text', () => {
    render(<QueryInput value="" onChange={mockOnChange} onAnalyze={mockOnAnalyze} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder');
    expect(textarea.getAttribute('placeholder')).toContain('SELECT');
  });

  it('should have correct label', () => {
    render(<QueryInput value="" onChange={mockOnChange} onAnalyze={mockOnAnalyze} />);

    expect(screen.getByLabelText('SQLクエリを入力')).toBeInTheDocument();
  });
});
