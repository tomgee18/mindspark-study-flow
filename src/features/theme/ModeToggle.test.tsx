import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { ModeToggle } from './ModeToggle';
import { useTheme } from 'next-themes';

// Mock the next-themes module
vi.mock('next-themes', () => ({
  useTheme: vi.fn().mockReturnValue({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

describe('ModeToggle', () => {
  it('renders the theme toggle button', () => {
    render(<ModeToggle />);
    
    // Check if the button is rendered
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('opens the dropdown menu when clicked', async () => {
    render(<ModeToggle />);
    
    // Click the button to open the dropdown
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    // Check if the dropdown menu items are rendered
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme when a theme option is clicked', async () => {
    const mockSetTheme = vi.fn();
    (useTheme as any).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    
    render(<ModeToggle />);
    
    // Click the button to open the dropdown
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    // Click the Dark theme option
    const darkOption = screen.getByText('Dark');
    fireEvent.click(darkOption);
    
    // Check if setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});