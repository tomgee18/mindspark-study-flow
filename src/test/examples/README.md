# Test Examples

This directory contains example tests that demonstrate best practices for testing different types of code in the MindSpark Study Flow application.

## Test Files

### `component.test.tsx`
Examples of testing React components including:
- Basic component rendering
- Event handling
- Props validation
- Async behavior
- Form interactions

### `hook.test.ts`
Examples of testing custom React hooks including:
- Hook initialization
- State updates
- Side effects
- Error handling

### `utility.test.ts`
Examples of testing utility functions including:
- Pure function testing
- Error handling
- Edge cases
- Complex logic

### `integration.test.tsx`
Examples of integration tests including:
- Component interactions
- API integration
- React Query usage
- User workflows

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test component.test.tsx
```

## Best Practices

1. **Arrange, Act, Assert**: Structure tests with clear setup, action, and verification phases.
2. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested.
3. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it.
4. **Mock External Dependencies**: Use mocks for API calls, external libraries, and complex dependencies.
5. **Clean Up**: Ensure tests clean up after themselves to avoid side effects.
6. **Test Edge Cases**: Include tests for error conditions and edge cases.

## Common Testing Patterns

### Testing User Interactions
```tsx
fireEvent.click(screen.getByRole('button'));
fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
```

### Testing Async Behavior
```tsx
await waitFor(() => {
  expect(screen.getByText('Loaded data')).toBeInTheDocument();
});
```

### Testing with Mocks
```tsx
const mockFunction = vi.fn();
mockFunction.mockReturnValue('mocked value');
expect(mockFunction).toHaveBeenCalledWith('expected argument');
```

### Testing Hooks
```tsx
const { result } = renderHook(() => useCustomHook());
act(() => {
  result.current.someAction();
});
expect(result.current.someValue).toBe('expected');
```