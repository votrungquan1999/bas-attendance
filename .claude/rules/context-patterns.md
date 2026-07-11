---
paths: ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js']
description: 'Claude Code React context: patterns and state management best practices'
---

# React Context Patterns

## 1. Hook Transformation

- NEVER use the hooks from `createReducerContext` directly in components. ALWAYS transform them into more useful, domain-specific hooks.

✅ Correct (transforming hooks into domain-specific ones):

```tsx
// component.state.tsx
const [Provider, useRawState, useRawDispatch] = createReducerContext(reducer, initialState)

// Transform into domain-specific hooks
export function useComponentState() {
  const state = useRawState()
  return {
    isOpen: state.isOpen,
    selectedId: state.selectedId,
    // ... other computed values
  }
}

export function useComponentActions() {
  const dispatch = useRawDispatch()
  return {
    openDialog: (id: string) => dispatch({ type: 'OPEN_DIALOG', payload: id }),
    closeDialog: () => dispatch({ type: 'CLOSE_DIALOG' }),
    // ... other actions
  }
}

export { Provider as ComponentProvider }
```

❌ Incorrect (using raw hooks directly):

```tsx
// component.tsx - DON'T DO THIS
export function MyComponent() {
  const state = useRawState() // ❌ Don't use raw state
  const dispatch = useRawDispatch() // ❌ Don't use raw dispatch

  const handleClick = () => {
    dispatch({ type: 'OPEN_DIALOG', payload: 'some-id' }) // ❌ Raw dispatch
  }

  return <div onClick={handleClick}>{state.isOpen ? 'Open' : 'Closed'}</div>
}
```

✅ Correct (using transformed hooks):

```tsx
// component.tsx
export function MyComponent() {
  const { isOpen, selectedId } = useComponentState()
  const { openDialog, closeDialog } = useComponentActions()

  const handleClick = () => {
    openDialog('some-id') // ✅ Clean, semantic action
  }

  return <div onClick={handleClick}>{isOpen ? 'Open' : 'Closed'}</div>
}
```

## 2. Fallback Context Pattern

If `createReducerContext` is not available in the project:

1. **STOP** and ask the user what to do next:

   - Should you add `createReducerContext` to the project?
   - Should you use normal React context instead?
   - Should you use a different state management solution?

2. **DO NOT** proceed with guessing or assuming a solution.

✅ Fallback with normal Context (only if user approves):

```tsx
'use client'

import { createContext, useContext, useReducer } from 'react'
import type { MyState, MyAction } from './component.type'

const StateContext = createContext<MyState | null>(null)
const DispatchContext = createContext<React.Dispatch<MyAction> | null>(null)

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(myReducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useMyState() {
  const state = useContext(StateContext)
  if (!state) throw new Error('useMyState must be used within MyProvider')
  return state
}

export function useMyDispatch() {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useMyDispatch must be used within MyProvider')
  return dispatch
}
```

## 3. Behavioral Components

- Behavioral components MUST accept an optional `asChild` prop and use Radix `Slot`.

✅ Correct:

```tsx
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps {
  asChild?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ asChild = false, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp className='bg-primary text-primary-foreground px-4 py-2 rounded' {...props}>
      {children}
    </Comp>
  )
}
```

## 4. Context Provider Patterns

- Always provide error boundaries for context providers
- Use TypeScript for context type safety
- Provide clear error messages for missing providers

✅ Correct:

```tsx
export function useMyContext() {
  const context = useContext(MyContext)
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

## 5. Context Optimization

- Split contexts by concern to avoid unnecessary re-renders
- Use multiple smaller contexts instead of one large context
- Consider using `useMemo` for context values when appropriate

✅ Correct:

```tsx
// Split contexts by concern
const UserContext = createContext<User | null>(null)
const ThemeContext = createContext<Theme | null>(null)
const SettingsContext = createContext<Settings | null>(null)

// Instead of one large context
const AppContext = createContext<{
  user: User
  theme: Theme
  settings: Settings
} | null>(null)
```
