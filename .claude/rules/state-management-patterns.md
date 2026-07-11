---
paths: ['**/*.tsx', '**/*.jsx']
description: 'Claude Code state management: patterns for context usage and state files'
---

# State Management Patterns

## 1. State Management File (`*.state.tsx`)

- MUST contain ALL state logic for the component
- MUST use `'use client'` directive
- SHOULD export custom hooks for state access
- SHOULD use `createReducerContext` when available

## 2. Example State File

✅ Example `user-profile.state.tsx`:

```tsx
'use client'

import { createReducerContext } from '...'
import type { UserProfileState, UserProfileAction } from './user-profile.type'

const initialState: UserProfileState = {
  isEditing: false,
  formData: null,
  errors: [],
}

function userProfileReducer(state: UserProfileState, action: UserProfileAction): UserProfileState {
  switch (action.type) {
    case 'START_EDIT':
      return { ...state, isEditing: true }
    case 'SAVE_PROFILE':
      return { ...state, isEditing: false, formData: action.payload }
    default:
      return state
  }
}

export const [UserProfileProvider, useUserProfileState, useUserProfileDispatch] = createReducerContext(
  userProfileReducer,
  initialState
)
```

## 3. Hook Transformation

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
