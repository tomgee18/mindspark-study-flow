import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Example: Integration test for a feature
describe('User Profile Integration', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  // Mock API call
  const mockFetchUser = vi.fn();

  const UserProfile = ({ userId }: { userId: string }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const userData = await mockFetchUser(userId);
          setUser(userData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }, [userId]);

    if (loading) return <div>Loading user...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>User not found</div>;

    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <button onClick={() => alert('Edit user')}>Edit</button>
      </div>
    );
  };

  beforeEach(() => {
    mockFetchUser.mockClear();
  });

  it('displays user information after loading', async () => {
    mockFetchUser.mockResolvedValue(mockUser);

    render(<UserProfile userId="1" />);

    // Initially shows loading
    expect(screen.getByText('Loading user...')).toBeInTheDocument();

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    mockFetchUser.mockRejectedValue(new Error('Failed to fetch user'));

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch user')).toBeInTheDocument();
    });
  });

  it('calls edit function when edit button is clicked', async () => {
    mockFetchUser.mockResolvedValue(mockUser);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(alertSpy).toHaveBeenCalledWith('Edit user');

    alertSpy.mockRestore();
  });
});

// Example: Testing component with React Query
describe('Data Fetching with React Query', () => {
  const DataComponent = () => {
    const [enabled, setEnabled] = React.useState(false);
    
    // Mock useQuery hook behavior
    const { data, isLoading, error } = React.useMemo(() => {
      if (!enabled) {
        return { data: null, isLoading: false, error: null };
      }
      
      return {
        data: { message: 'Hello from API' },
        isLoading: false,
        error: null,
      };
    }, [enabled]);

    return (
      <div>
        <button onClick={() => setEnabled(true)}>Fetch Data</button>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error occurred</div>}
        {data && <div>{data.message}</div>}
      </div>
    );
  };

  it('fetches and displays data when button is clicked', () => {
    render(<DataComponent />);

    expect(screen.queryByText('Hello from API')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /fetch data/i }));

    expect(screen.getByText('Hello from API')).toBeInTheDocument();
  });
});