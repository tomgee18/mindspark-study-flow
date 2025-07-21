import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import Header from './Header';

describe('Header', () => {
  it('renders the header with the app name', () => {
    render(<Header />);
    
    // Check if the app name is rendered
    expect(screen.getByText('MindSpark')).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    render(<Header />);
    
    // Check if the theme toggle button is rendered
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});