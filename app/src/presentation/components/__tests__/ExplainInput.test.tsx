import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExplainInput } from '../ExplainInput';

describe('ExplainInput', () => {
  it('should render textarea with placeholder', () => {
    render(<ExplainInput value="" onChange={() => {}} onAnalyze={() => {}} />);

    const textarea = screen.getByPlaceholderText(/MySQLのEXPLAIN結果を/);
    expect(textarea).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    const testValue = 'Test EXPLAIN result';
    render(<ExplainInput value={testValue} onChange={() => {}} onAnalyze={() => {}} />);

    const textarea = screen.getByDisplayValue(testValue);
    expect(textarea).toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<ExplainInput value="" onChange={handleChange} onAnalyze={() => {}} />);

    const textarea = screen.getByPlaceholderText(/MySQLのEXPLAIN結果を/);
    await user.type(textarea, 'test');

    expect(handleChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
  });

  it('should call onAnalyze when button is clicked', () => {
    const handleAnalyze = jest.fn();
    render(<ExplainInput value="test" onChange={() => {}} onAnalyze={handleAnalyze} />);

    const button = screen.getByText('分析する');
    fireEvent.click(button);

    expect(handleAnalyze).toHaveBeenCalledTimes(1);
  });

  it('should disable button when value is empty', () => {
    render(<ExplainInput value="" onChange={() => {}} onAnalyze={() => {}} />);

    const button = screen.getByText('分析する');
    expect(button).toBeDisabled();
  });

  it('should enable button when value is not empty', () => {
    render(<ExplainInput value="test" onChange={() => {}} onAnalyze={() => {}} />);

    const button = screen.getByText('分析する');
    expect(button).not.toBeDisabled();
  });

  it('should show loading state', () => {
    render(<ExplainInput value="test" onChange={() => {}} onAnalyze={() => {}} isLoading />);

    const button = screen.getByText('分析中...');
    expect(button).toBeDisabled();
  });
});
