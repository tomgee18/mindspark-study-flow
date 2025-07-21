# TypeScript Naming Conventions

This document outlines the naming conventions for TypeScript code in the MindSpark Study Flow application.

## General Principles

1. **Be descriptive**: Names should clearly describe what they represent.
2. **Be consistent**: Follow the same conventions throughout the codebase.
3. **Be concise**: Names should be as short as possible while still being descriptive.
4. **Avoid abbreviations**: Unless they are widely understood (e.g., HTTP, URL).

## File Naming

1. **Component files**: Use PascalCase for React component files (e.g., `Button.tsx`, `UserProfile.tsx`).
2. **Test files**: Append `.test` or `.spec` to the file name (e.g., `Button.test.tsx`, `utils.spec.ts`).
3. **Utility files**: Use camelCase for utility files (e.g., `formatDate.ts`, `apiUtils.ts`).
4. **Index files**: Use `index.ts` for barrel files that re-export from other files.
5. **Style files**: Use the same name as the component with a `.css`, `.scss`, or `.module.css` extension (e.g., `Button.module.css`).

## Variables and Functions

1. **Variables**: Use camelCase for variable names (e.g., `userName`, `isLoading`).
2. **Constants**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_RETRY_COUNT`, `API_URL`).
3. **Functions**: Use camelCase for function names (e.g., `getUserData`, `formatDate`).
4. **Boolean variables**: Prefix with `is`, `has`, `should`, etc. (e.g., `isActive`, `hasPermission`).
5. **Event handlers**: Prefix with `handle` or `on` (e.g., `handleClick`, `onSubmit`).

## Types and Interfaces

1. **Interfaces**: Use PascalCase and prefix with `I` (e.g., `IUser`, `IApiResponse`).
2. **Types**: Use PascalCase (e.g., `UserRole`, `ApiResponse`).
3. **Enums**: Use PascalCase (e.g., `UserRole`, `HttpMethod`).
4. **Type parameters (generics)**: Use single uppercase letters or PascalCase with descriptive names (e.g., `T`, `U`, `TData`, `TResponse`).

## React Components

1. **Component names**: Use PascalCase (e.g., `Button`, `UserProfile`).
2. **Props interfaces**: Use PascalCase and suffix with `Props` (e.g., `ButtonProps`, `UserProfileProps`).
3. **Context**: Use PascalCase and suffix with `Context` (e.g., `UserContext`, `ThemeContext`).
4. **Hooks**: Use camelCase and prefix with `use` (e.g., `useUser`, `useTheme`).

## CSS Classes

1. **CSS classes**: Use kebab-case for CSS class names (e.g., `button-primary`, `user-profile`).
2. **BEM methodology**: Follow BEM (Block Element Modifier) naming convention when applicable:
   - Block: `block-name`
   - Element: `block-name__element-name`
   - Modifier: `block-name--modifier-name` or `block-name__element-name--modifier-name`

## Examples

### Interface and Type Definitions

```typescript
// Interface for user data
interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Type for user role
type UserRole = 'admin' | 'user' | 'guest';

// Enum for HTTP methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
```

### React Component

```typescript
// Component props interface
interface IButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  isDisabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// React component
const Button: React.FC<IButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isDisabled = false,
  onClick,
  children,
}) => {
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`button button--${variant} button--${size} ${isDisabled ? 'button--disabled' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};
```

### Custom Hook

```typescript
// Custom hook for fetching user data
const useUserData = (userId: string): { user: IUser | null; isLoading: boolean; error: Error | null } => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUser(userId);
        setUser(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
};
```