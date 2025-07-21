# State Management Patterns

This document outlines the state management patterns used in the MindSpark Study Flow application.

## Overview

The application uses a layered approach to state management:

1. **Local Component State** - For component-specific state using `useState` and `useReducer`
2. **Custom Hooks** - For reusable state logic
3. **Context API** - For global UI state that needs to be shared across components
4. **React Query** - For server state management (API data, caching, synchronization)

## Local Component State

Use `useState` for simple local state and `useReducer` for complex state logic.

### When to Use
- Component-specific state that doesn't need to be shared
- Simple state that can be managed with `useState`
- Complex state logic that benefits from `useReducer`

### Examples

```tsx
// Simple state with useState
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);

// Complex state with useReducer
interface State {
  loading: boolean;
  data: any[];
  error: string | null;
}

type Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'FETCH_ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, {
  loading: false,
  data: [],
  error: null,
});
```

## Custom Hooks

Custom hooks encapsulate reusable state logic and can be shared across components.

### Available Custom Hooks

#### `useToggle`
For boolean state that can be toggled.

```tsx
const [isVisible, toggleVisible, setVisible] = useToggle(false);

// Toggle the value
toggleVisible();

// Set specific value
setVisible(true);
```

#### `useLocalStorage`
For state that persists in localStorage.

```tsx
const [theme, setTheme] = useLocalStorage('theme', 'light');

// Value is automatically synced with localStorage
setTheme('dark');
```

#### `useApi`
For handling API calls with loading, error, and data states.

```tsx
const { data, loading, error, execute } = useApi(
  () => fetch('/api/users').then(res => res.json()),
  { immediate: true }
);

// Manually trigger the API call
execute();
```

#### `useForm`
For form state management with validation.

```tsx
const form = useForm({
  initialValues: { email: '', password: '' },
  validate: (values) => {
    const errors: any = {};
    if (!values.email) errors.email = 'Email is required';
    if (!values.password) errors.password = 'Password is required';
    return errors;
  },
  onSubmit: async (values) => {
    await submitForm(values);
  },
});

// In component
<input
  value={form.values.email}
  onChange={(e) => form.setValue('email', e.target.value)}
  onBlur={() => form.setFieldTouched('email')}
/>
{form.touched.email && form.errors.email && (
  <span>{form.errors.email}</span>
)}
```

#### `useDebounce`
For debouncing values or callbacks.

```tsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// Use debouncedSearchTerm for API calls
useEffect(() => {
  if (debouncedSearchTerm) {
    searchAPI(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

#### `useClickOutside`
For detecting clicks outside an element.

```tsx
const [isOpen, setIsOpen] = useState(false);
const ref = useClickOutside(() => setIsOpen(false));

return (
  <div ref={ref}>
    {isOpen && <div>Dropdown content</div>}
  </div>
);
```

## Context API

Use React Context for global UI state that needs to be shared across multiple components.

### When to Use
- Global UI state (theme, user preferences, etc.)
- State that needs to be accessed by many components at different levels
- State that doesn't change frequently

### Pattern

```tsx
// 1. Define the context type
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Create a custom hook for consuming the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Existing Contexts

#### `MindMapContext`
Manages the state of the mind map including nodes, edges, and interactions.

```tsx
const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useMindMap();
```

## React Query (Server State)

Use React Query for managing server state, including API calls, caching, and synchronization.

### When to Use
- Fetching data from APIs
- Caching server responses
- Background updates and synchronization
- Optimistic updates

### Patterns

#### Basic Query

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(res => res.json()),
});
```

#### Mutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (newUser) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(newUser),
  }),
  onSuccess: () => {
    // Invalidate and refetch users query
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

#### Query with Parameters

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
  enabled: !!userId, // Only run query if userId exists
});
```

## State Management Guidelines

### 1. Choose the Right Tool

- **Local State**: Component-specific state that doesn't need to be shared
- **Custom Hooks**: Reusable state logic
- **Context**: Global UI state shared across components
- **React Query**: Server state and API data

### 2. Keep State Close to Where It's Used

Don't lift state up unnecessarily. Keep state as local as possible and only lift it up when multiple components need access to it.

### 3. Use Custom Hooks for Reusable Logic

Extract common state patterns into custom hooks to promote reusability and maintainability.

### 4. Separate Server State from Client State

Use React Query for server state and local state/context for client state. Don't mix them.

### 5. Optimize Context Usage

- Split contexts by concern (don't put everything in one context)
- Use multiple providers for different parts of the state
- Consider using `useMemo` and `useCallback` to prevent unnecessary re-renders

### 6. Handle Loading and Error States

Always handle loading and error states in your components, especially when dealing with async operations.

### 7. Use TypeScript

Define proper types for your state to catch errors early and improve developer experience.

## Common Patterns

### Loading States

```tsx
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{data}</div>;
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['user', newUser.id] });

    // Snapshot previous value
    const previousUser = queryClient.getQueryData(['user', newUser.id]);

    // Optimistically update
    queryClient.setQueryData(['user', newUser.id], newUser);

    return { previousUser };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['user', newUser.id], context?.previousUser);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['user'] });
  },
});
```

### Conditional Queries

```tsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId && isAuthenticated,
});
```