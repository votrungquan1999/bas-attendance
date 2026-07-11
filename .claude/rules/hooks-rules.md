---
paths: ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js']
description: 'Claude Code React hooks: usage rules and performance guidelines'
---

# React Hooks Rules

## 1. Performance Hooks

- NEVER use `useCallback` or `useMemo` unless strictly necessary:
  - ✅ Use ONLY when passing functions/objects to memoized children.

## 2. Effect Hook

- NEVER use `useEffect` except when syncing React state with external resources (APIs, localStorage, subscriptions).

✅ Correct:

```tsx
useEffect(() => {
  localStorage.setItem('theme', theme)
}, [theme])
```

❌ Incorrect:

```tsx
useEffect(() => {
  setValue(props.value)
}, [props.value])
```

- ALWAYS use `useSyncExternalStore` instead of `useEffect` for subscriptions.

## 3. State Management

- ALWAYS use `context` for prop drilling instead of passing deeply.
- ALWAYS use `useReducer` over `useState` for complex local state.
- ALWAYS use `createReducerContext` when possible.

## 4. Provider Patterns

- ALWAYS pass initial data directly to the provider as props instead of using initializer components or useEffect.

✅ Correct (passing data directly to provider):

```tsx
// context.tsx
const [ProviderBase, useState, useDispatch] = createReducerContext(reducer, initialState)

export function MyProvider({ children, initialData }: { children: React.ReactNode; initialData?: MyData[] }) {
  return <ProviderBase data={initialData}>{children}</ProviderBase>
}

// page.tsx (Server Component)
export default function MyPage() {
  const data = await getData()

  return (
    <MyProvider initialData={data}>
      <MyContent />
    </MyProvider>
  )
}
```

❌ Incorrect (using initializer components or useEffect):

```javascript
// DON'T DO THIS - using initializer component
;<MyProvider>
  <MyInitializer data={data} />
  <MyContent />
</MyProvider>

// DON'T DO THIS - using useEffect in provider
export function MyProvider({ children, data }: { children: React.ReactNode, data: MyData[] }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    setState((prev) => ({ ...prev, data }))
  }, [data])

  return <Context.Provider value={state}>{children}</Context.Provider>
}
```

## 5. Provider Reuse

- ALWAYS reuse existing providers when they serve the same internal state. DO NOT create separate providers for related functionality.

✅ Correct (reusing existing provider):

```tsx
// form-state.state.tsx
const initialState: FormState = {
  isSubmitting: false,
  error: null,
  fieldErrors: {},
  formRef: null,
  isConfirmDialogOpen: false,
}

const [FormProviderBase, useFormState, useFormDispatch] = createReducerContext(formReducer, initialState)

// Enhanced provider that includes formRef in state
export function FormProvider({
  formRef,
  children,
}: {
  formRef: React.RefObject<HTMLFormElement | null>
  children: React.ReactNode
}) {
  return <FormProviderBase formRef={formRef}>{children}</FormProviderBase>
}

// Hook to access formRef from state
export function useFormRef() {
  const state = useFormState()
  return state.formRef
}
```

## 6. Hook Dependencies

- Always include all dependencies in dependency arrays
- Use ESLint rules to catch missing dependencies
- Consider using `useCallback` and `useMemo` only when necessary for performance

✅ Correct:

```tsx
useEffect(() => {
  fetchData(userId, filters)
}, [userId, filters])
```

❌ Incorrect:

```tsx
useEffect(() => {
  fetchData(userId, filters)
}, [userId]) // Missing filters dependency
```
