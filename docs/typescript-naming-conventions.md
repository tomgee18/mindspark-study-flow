# TypeScript Naming Conventions

This document outlines the naming conventions for TypeScript code in the MindSpark Study Flow application.

## General Principles

- Use descriptive names that clearly communicate the purpose of the variable, function, class, or interface.
- Avoid abbreviations unless they are widely understood.
- Be consistent with the existing codebase.

## Variables and Functions

- Use `camelCase` for variable and function names.
- Use descriptive names that indicate the purpose of the variable or function.
- Boolean variables should have a prefix like `is`, `has`, `can`, etc.

```typescript
// Good
const userName = "John";
const isActive = true;
const hasPermission = checkPermission();

function calculateTotal() { /* ... */ }
function isValidEmail(email: string) { /* ... */ }

// Bad
const u = "John";
const active = true;
const perm = checkPermission();

function calc() { /* ... */ }
```

## Constants

- Use `UPPER_SNAKE_CASE` for constants that are truly constant and known at compile time.
- Use `camelCase` for constants that are determined at runtime.

```typescript
// Good
const MAX_ITEMS = 100;
const API_URL = "https://api.example.com";

// For runtime constants
const userSettings = fetchUserSettings();

// Bad
const maxItems = 100;
const apiUrl = "https://api.example.com";
```

## Classes and Interfaces

- Use `PascalCase` for class and interface names.
- Use descriptive names that indicate the purpose of the class or interface.
- Prefix interfaces with `I` only when there is a class with the same name.

```typescript
// Good
interface User {
  name: string;
  email: string;
}

class UserService {
  // ...
}

// When there's both an interface and a class
interface IUserRepository {
  findById(id: string): User;
}

class UserRepository implements IUserRepository {
  // ...
}

// Bad
interface userInterface {
  name: string;
  email: string;
}

class userService {
  // ...
}
```

## Types and Type Aliases

- Use `PascalCase` for type aliases.
- Use descriptive names that indicate the purpose of the type.

```typescript
// Good
type UserRole = "admin" | "user" | "guest";
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Bad
type userRole = "admin" | "user" | "guest";
type api_response<T> = {
  data: T;
  status: number;
  message: string;
};
```

## Enums

- Use `PascalCase` for enum names.
- Use `PascalCase` for enum members.

```typescript
// Good
enum HttpStatus {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
}

// Bad
enum httpStatus {
  ok = 200,
  created = 201,
  bad_request = 400,
  unauthorized = 401,
}
```

## Generics

- Use single uppercase letters for simple generic type parameters.
- Use descriptive `PascalCase` names for complex generic type parameters.

```typescript
// Good
function identity<T>(arg: T): T {
  return arg;
}

// For more complex generics
interface Repository<TEntity extends BaseEntity> {
  findById(id: string): TEntity;
}

// Bad
function identity<t>(arg: t): t {
  return arg;
}

interface Repository<entity extends BaseEntity> {
  findById(id: string): entity;
}
```

## Private and Protected Members

- Use `camelCase` for private and protected members.
- Prefix private members with an underscore (`_`) to distinguish them from public members.

```typescript
// Good
class User {
  private _id: string;
  protected _name: string;
  public email: string;

  constructor(id: string, name: string, email: string) {
    this._id = id;
    this._name = name;
    this.email = email;
  }

  get name(): string {
    return this._name;
  }
}

// Bad
class User {
  private id: string;
  protected name: string;
  public email: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  get getName(): string {
    return this.name;
  }
}
```

## File Names

- Use `kebab-case` for file names.
- Use descriptive names that indicate the purpose of the file.
- Use `.tsx` extension for files containing JSX.
- Use `.ts` extension for files not containing JSX.

```
// Good
user-service.ts
auth-context.tsx
use-form.ts

// Bad
userService.ts
AuthContext.tsx
useForm.ts
```

## Folder Names

- Use `kebab-case` for folder names.
- Use descriptive names that indicate the purpose of the folder.

```
// Good
src/components/user-profile/
src/hooks/use-auth/

// Bad
src/components/userProfile/
src/hooks/useAuth/
```

## Import Aliases

- Use consistent import aliases for commonly imported modules.
- Use `@` as the alias for the `src` directory.

```typescript
// Good
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// Bad
import { Button } from "../../../components/ui/button";
import { useAuth } from "src/hooks/use-auth";
```

## Event Handlers

- Prefix event handler props with `on`.
- Prefix event handler functions with `handle`.

```typescript
// Good
interface ButtonProps {
  onClick?: () => void;
}

function Button({ onClick }: ButtonProps) {
  const handleClick = () => {
    // Do something
    if (onClick) {
      onClick();
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}

// Bad
interface ButtonProps {
  click?: () => void;
}

function Button({ click }: ButtonProps) {
  const clickFunction = () => {
    // Do something
    if (click) {
      click();
    }
  };

  return <button onClick={clickFunction}>Click me</button>;
}
```

## React Components

- Use `PascalCase` for React component names.
- Use descriptive names that indicate the purpose of the component.
- Use `.tsx` extension for files containing JSX.

```typescript
// Good
function UserProfile() {
  return <div>User Profile</div>;
}

// Bad
function userProfile() {
  return <div>User Profile</div>;
}
```

## React Hooks

- Prefix custom hooks with `use`.
- Use `camelCase` for hook names.

```typescript
// Good
function useAuth() {
  // ...
}

function useLocalStorage<T>(key: string, initialValue: T) {
  // ...
}

// Bad
function auth() {
  // ...
}

function UseLocalStorage<T>(key: string, initialValue: T) {
  // ...
}
```

## Context

- Suffix context with `Context`.
- Suffix context provider with `Provider`.
- Prefix context hook with `use`.

```typescript
// Good
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  // ...
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Bad
const Auth = createContext<AuthContextType | undefined>(undefined);

function Provider({ children }: { children: React.ReactNode }) {
  // ...
  return <Auth.Provider value={value}>{children}</Auth.Provider>;
}

function getAuth() {
  const context = useContext(Auth);
  if (context === undefined) {
    throw new Error("getAuth must be used within a Provider");
  }
  return context;
}
```