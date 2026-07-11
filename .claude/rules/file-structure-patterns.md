---
paths: ['**/*.tsx', '**/*.jsx']
description: 'Claude Code component architecture: file structure patterns and directory organization for React components'
---

# Component Architecture File Structure

## 1. File Structure Pattern

For complex components, ALWAYS follow this file structure pattern:

### File Structure

- **`component.tsx`** - Server component (main entry point)
- **`component.ui.tsx`** - Client display components (styling & UI)
- **`component.state.tsx`** - State management (hooks, context, reducers)
- **`component.type.ts`** - Shared types between client and server

✅ Example structure:

```
src/components/user-profile/
├── user-profile.tsx          # Server component
├── user-profile.ui.tsx       # Client UI components
├── user-profile.state.tsx    # State management
└── user-profile.type.ts      # Shared types
```

## 2. Prohibited File Patterns

- **NEVER** create `component.client.tsx` files
- This pattern is a cheat that violates server/client component separation
- Interactive logic and client-side functions MUST be in `component.state.tsx`
- Client state and functions MUST be exposed as hooks from the state file
- Other client components should consume these hooks, not import client components directly
- **STRICTLY** follow section 3 guidelines: content (text, copy, translations, data access) belongs in server components with NO exceptions

❌ Prohibited pattern:

```
src/components/user-profile/
├── user-profile.tsx          # Server component
├── user-profile.client.tsx   # ❌ NEVER DO THIS
└── user-profile.ui.tsx       # Client UI components
```

✅ Correct pattern:

```
src/components/user-profile/
├── user-profile.tsx          # Server component
├── user-profile.ui.tsx       # Client UI components
├── user-profile.state.tsx    # Client state and hooks
└── user-profile.type.ts      # Shared types
```

## 3. Directory Organization

- Group related components in the same directory
- Use descriptive directory names that match the component purpose
- Keep shared utilities in a separate `lib/` or `utils/` directory
- Place types in a `types/` directory if they're shared across multiple components

✅ Correct:

```
src/components/
├── user-profile/
│   ├── user-profile.tsx
│   ├── user-profile.ui.tsx
│   ├── user-profile.state.tsx
│   └── user-profile.type.ts
├── product-card/
│   ├── product-card.tsx
│   ├── product-card.ui.tsx
│   └── product-card.state.tsx
└── shared/
    ├── button/
    └── input/
```

## 4. Naming Conventions

- Use kebab-case for file and directory names
- Match the component name with the directory name
- Use descriptive suffixes: `.ui.tsx`, `.state.tsx`, `.type.ts`
- Keep file names consistent across the project
