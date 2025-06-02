import { render, screen } from '@testing-library/react';
import { TuningSuggestion } from '../../../domain/services/TuningSuggestion';
import { TuningSuggestionCard } from '../TuningSuggestionCard';

describe('TuningSuggestionCard', () => {
  it('should render critical suggestion', () => {
    const suggestion = new TuningSuggestion(
      'Critical Issue',
      'This is a critical performance issue',
      'critical',
      'Fix this immediately'
    );

    render(<TuningSuggestionCard suggestion={suggestion} />);

    expect(screen.getByText('Critical Issue')).toBeInTheDocument();
    expect(screen.getByText('This is a critical performance issue')).toBeInTheDocument();
    expect(screen.getByText('Fix this immediately')).toBeInTheDocument();
    expect(screen.getByText('重要')).toBeInTheDocument();
  });

  it('should render warning suggestion', () => {
    const suggestion = new TuningSuggestion('Warning Issue', 'This needs attention', 'warning');

    render(<TuningSuggestionCard suggestion={suggestion} />);

    expect(screen.getByText('Warning Issue')).toBeInTheDocument();
    expect(screen.getByText('This needs attention')).toBeInTheDocument();
    expect(screen.getByText('警告')).toBeInTheDocument();
  });

  it('should render info suggestion', () => {
    const suggestion = new TuningSuggestion('Info', 'Just for your information', 'info');

    render(<TuningSuggestionCard suggestion={suggestion} />);

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Just for your information')).toBeInTheDocument();
    expect(screen.getByText('情報')).toBeInTheDocument();
  });

  it('should not render recommendation when not provided', () => {
    const suggestion = new TuningSuggestion('Title', 'Description', 'info');

    render(<TuningSuggestionCard suggestion={suggestion} />);

    expect(screen.queryByText('推奨対策:')).not.toBeInTheDocument();
  });

  it('should apply correct styling for critical severity', () => {
    const suggestion = new TuningSuggestion('Critical', 'Description', 'critical');

    const { container } = render(<TuningSuggestionCard suggestion={suggestion} />);

    const card = container.querySelector('.border-red-300');
    expect(card).toBeInTheDocument();
  });

  it('should apply correct styling for warning severity', () => {
    const suggestion = new TuningSuggestion('Warning', 'Description', 'warning');

    const { container } = render(<TuningSuggestionCard suggestion={suggestion} />);

    const card = container.querySelector('.border-amber-300');
    expect(card).toBeInTheDocument();
  });
});
