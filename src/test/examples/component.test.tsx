import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { Button } from '@/components/ui/button';

// Example: Testing a simple component
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });
});

// Example: Testing a component with async behavior
describe('Async Component Example', () => {
  it('shows loading state and then content', async () => {
    const AsyncComponent = () => {
      const [loading, setLoading] = React.useState(true);
      const [data, setData] = React.useState<string | null>(null);

      React.useEffect(() => {
        setTimeout(() => {
          setData('Loaded data');
          setLoading(false);
        }, 100);
      }, []);

      if (loading) return <div>Loading...</div>;
      return <div>{data}</div>;
    };

    render(<AsyncComponent />);
    
    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Loaded data')).toBeInTheDocument();
    });
    
    // Loading should be gone
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});

// Example: Testing a form component
describe('Form Component Example', () => {
  it('submits form with correct data', () => {
    const handleSubmit = vi.fn();
    
    const FormComponent = () => {
      const [value, setValue] = React.useState('');
      
      const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(value);
      };

      return (
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text"
          />
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<FormComponent />);
    
    const input = screen.getByPlaceholderText('Enter text');
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    // Type in the input
    fireEvent.change(input, { target: { value: 'test input' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    expect(handleSubmit).toHaveBeenCalledWith('test input');
  });
});