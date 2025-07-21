# State Management Patterns

This document outlines the state management patterns used in the MindSpark Study Flow application.

## Overview

The application uses a combination of state management approaches:

1. **Local Component State**: For component-specific state.
2. **React Context**: For global UI state.
3. **React Query**: For server state management.
4. **Custom Hooks**: For reusable state logic.

## When to Use Each Approach

### Local Component State

Use local component state (useState, useReducer) when:

- The state is only used by a single component.
- The state doesn't need to be shared with other components.
- The state is simple and doesn't require complex logic.

Example:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

### React Context

Use React Context when:

- The state needs to be shared across multiple components.
- The state is UI-related (theme, sidebar state, etc.).
- The state doesn't change frequently.

Example:

```tsx
// Create a context
export const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: 'light',
  setTheme: () => {},
});

// Create a provider
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Use the context
const { theme, setTheme } = useContext(ThemeContext);
```

### React Query

Use React Query when:

- The state represents server data.
- The state needs to be cached, refetched, or synchronized with the server.
- The state requires background updates or polling.

Example:

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});
```

### Custom Hooks

Use custom hooks when:

- The state logic is reused across multiple components.
- The state logic is complex and benefits from abstraction.
- The state logic involves multiple useState or useReducer calls.

Example:

```tsx
const [value, toggle, setValue] = useToggle(false);
```

## Best Practices

1. **Keep State Close to Where It's Used**: Don't put state in a global store if it's only used by a single component.
2. **Use Context Sparingly**: Don't put everything in context; it can lead to unnecessary re-renders.
3. **Separate UI State from Server State**: Use React Query for server state and Context for UI state.
4. **Use Immutable Updates**: Always update state immutably to avoid bugs.
5. **Avoid Prop Drilling**: If you're passing props down more than 2-3 levels, consider using Context.
6. **Use TypeScript**: Define clear types for your state to catch errors early.

## Custom Hooks

The application includes several custom hooks for state management:

### useLocalStorage

A hook for persisting state in localStorage:

```tsx
const [value, setValue] = useLocalStorage('key', initialValue);
```

### useToggle

A hook for managing boolean toggle state:

```tsx
const [isOpen, toggle, setIsOpen] = useToggle(false);
```

### useAsync

A hook for managing async operations:

```tsx
const { status, value, error, execute } = useAsync(fetchData);
```

## Context Structure

The application uses several contexts for global state:

### MindMapContext

Manages the state of the mind map:

```tsx
const { nodes, edges, selectedNodeId, setNodes, setEdges } = useMindMap();
```

### ThemeContext

Manages the theme state:

```tsx
const { theme, setTheme } = useTheme();
```

## React Query Usage

React Query is used for server state management:

```tsx
// Define a query
const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});

// Define a mutation
const { mutate, isLoading } = useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```