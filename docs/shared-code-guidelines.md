# Shared Code Guidelines

This document outlines the guidelines for organizing and using shared code in the MindSpark Study Flow application.

## Shared Code Structure

Shared code should be organized in the following directories:

```
src/
├── components/
│   ├── ui/           # Basic UI components
│   └── common/       # Shared components
├── hooks/            # Shared hooks
├── utils/            # Shared utility functions
├── lib/              # Third-party library wrappers
├── contexts/         # Shared context providers
└── types/            # Shared TypeScript types
```

## Guidelines

### Shared Components

- Place shared UI components in `src/components/ui/`.
- Place shared business components in `src/components/common/`.
- Shared components should be reusable across multiple features.
- Shared components should have clear props interfaces.

### Shared Hooks

- Place shared hooks in `src/hooks/`.
- Shared hooks should be reusable across multiple features.
- Shared hooks should have clear return types.

### Shared Utility Functions

- Place shared utility functions in `src/utils/`.
- Shared utility functions should be pure functions.
- Shared utility functions should be reusable across multiple features.

### Third-Party Library Wrappers

- Place third-party library wrappers in `src/lib/`.
- Library wrappers should provide a consistent interface to third-party libraries.
- Library wrappers should abstract away implementation details.

### Shared Context Providers

- Place shared context providers in `src/contexts/`.
- Shared context providers should be reusable across multiple features.
- Shared context providers should have clear provider and hook interfaces.

### Shared TypeScript Types

- Place shared TypeScript types in `src/types/`.
- Shared types should be reusable across multiple features.
- Shared types should be well-documented.

## Best Practices

1. **Reusability**: Shared code should be designed for reuse.
2. **Abstraction**: Shared code should abstract away implementation details.
3. **Documentation**: Shared code should be well-documented.
4. **Testing**: Shared code should be well-tested.
5. **Versioning**: Consider versioning shared code if it changes frequently.
6. **Dependency Direction**: Features should depend on shared code, not the other way around.

## When to Create Shared Code

Consider creating shared code when:

1. The same code is used in multiple features.
2. The code provides a common abstraction.
3. The code is stable and unlikely to change frequently.

## When Not to Create Shared Code

Avoid creating shared code when:

1. The code is only used in one feature.
2. The code is likely to change frequently.
3. The code has complex dependencies on feature-specific code.