# Component Organization Guidelines

This document outlines the guidelines for organizing components in the MindSpark Study Flow application.

## Component Types

1. **UI Components**: Basic UI components that are used across the application.
2. **Common Components**: Reusable components that are shared across multiple features.
3. **Feature Components**: Components that are specific to a feature.
4. **Page Components**: Components that represent entire pages.

## Directory Structure

```
src/
├── components/
│   ├── ui/           # Basic UI components (buttons, inputs, etc.)
│   ├── common/       # Shared components used across features
│   ├── auth/         # Authentication-related components
│   └── quiz/         # Quiz-specific components
├── features/
│   ├── ai/           # AI-related feature components
│   ├── mind-map/     # Mind map feature components
│   ├── quiz/         # Quiz feature components
│   ├── sidebar/      # Sidebar feature components
│   └── theme/        # Theme-related feature components
└── pages/            # Page components
```

## Guidelines

### UI Components

- Place basic UI components in `src/components/ui/`.
- Each UI component should be small, focused, and reusable.
- UI components should not have business logic.
- Examples: Button, Input, Card, etc.

### Common Components

- Place shared components in `src/components/common/`.
- Common components can use UI components.
- Common components should be reusable across multiple features.
- Examples: Modal, Dropdown, etc.

### Feature Components

- Place feature-specific components in `src/features/{feature-name}/components/`.
- Feature components can use UI and common components.
- Feature components should be focused on a specific feature.
- Examples: MindMapNode, QuizQuestion, etc.

### Page Components

- Place page components in `src/pages/`.
- Page components can use UI, common, and feature components.
- Page components should represent entire pages.
- Examples: HomePage, QuizPage, etc.

## Naming Conventions

- Use PascalCase for component names.
- Use descriptive names that reflect the component's purpose.
- Suffix test files with `.test.tsx`.
- Suffix story files with `.stories.tsx`.

## File Structure

Each component should have its own directory with the following structure:

```
ComponentName/
├── ComponentName.tsx       # Component implementation
├── ComponentName.test.tsx  # Component tests
├── ComponentName.css       # Component styles (if not using CSS-in-JS)
└── index.ts                # Export file
```

## Best Practices

1. **Single Responsibility**: Each component should have a single responsibility.
2. **Reusability**: Design components to be reusable when possible.
3. **Props Interface**: Define a clear props interface for each component.
4. **Documentation**: Document complex components with comments.
5. **Testing**: Write tests for components.
6. **Accessibility**: Ensure components are accessible.