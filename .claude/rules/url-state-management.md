---
paths: ['**/app/**/*', '**/page.tsx', '**/page.ts', '**/route.ts']
description: 'Claude Code URL state management: server-side parameter handling and state synchronization'
---

# URL State Management Patterns

## 1. Server-Side URL Parameter Handling

For pages that need URL state management, ALWAYS handle URL parameters on the server side and pass them as initial state to client components.

✅ Correct:

```tsx
// page.tsx (Server Component)
interface InvestmentPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function convertSearchParamsToFormState(urlSearchParams: URLSearchParams): FormState {
  // Implementation here
}

export default async function InvestmentPage({ searchParams }: InvestmentPageProps) {
  const params = await searchParams
  const urlSearchParams = new URLSearchParams(params as Record<string, string>)
  const initialFormState = convertSearchParamsToFormState(urlSearchParams)

  return (
    <CalculatorSuspenseWrapper>
      <InvestmentCalculator initialFormState={initialFormState} />
    </CalculatorSuspenseWrapper>
  )
}
```

❌ Incorrect (handling URL state on client):

```tsx
// page.tsx - DON'T DO THIS
'use client'

export default function InvestmentPage() {
  const searchParams = useSearchParams()

  // ... URL state handling using useSearchParams must not be used unless absolutely necessary
}
```

## 2. URL Parameter Conversion

- Convert URL parameters to typed form state on the server
- Handle type conversion and validation
- Provide sensible defaults for missing parameters

✅ Correct:

```tsx
function convertSearchParamsToFormState(urlSearchParams: URLSearchParams): FormState {
  return {
    initialAmount: urlSearchParams.get('amount') ? Number(urlSearchParams.get('amount')) : undefined,
    period: (urlSearchParams.get('period') as ContributionPeriod) || ContributionPeriod.Monthly,
    rate: urlSearchParams.get('rate') ? Number(urlSearchParams.get('rate')) : undefined,
  }
}
```

## 3. URL State Synchronization

- Use server-side URL handling for initial state
- Use client-side state management for form interactions
- Write state back to the URL from the change handler with `router.replace` — never mirror state to the URL via `useEffect`
- Read the current params with `useSearchParams` so writes preserve unrelated keys

✅ Correct:

```tsx
// client component
'use client'

export function InvestmentCalculator({ initialFormState }: { initialFormState: FormState }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formState, setFormState] = useState(initialFormState)

  // Write to the URL in the event handler, not in an effect — the change IS the trigger
  function handleChange(newState: FormState) {
    setFormState(newState)

    const params = new URLSearchParams(searchParams)
    if (newState.initialAmount) params.set('amount', newState.initialAmount.toString())
    if (newState.period) params.set('period', newState.period)
    if (newState.rate) params.set('rate', newState.rate.toString())

    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    // Form JSX calls handleChange on input changes
  )
}
```

❌ Incorrect (mirroring state to the URL with an effect):

```tsx
// Anti-pattern: useEffect + useCallback just to keep the URL in sync
const updateURL = useCallback((newState: FormState) => { /* ... */ }, [router])
useEffect(() => {
  updateURL(formState)
}, [formState, updateURL])
```

## 4. URL State Best Practices

- Keep URL state minimal - only include essential parameters
- Use meaningful parameter names
- Handle edge cases (invalid values, missing parameters)
- Consider URL length limits
- Use `router.replace` for internal state updates, `router.push` for navigation

✅ Correct:

```tsx
// Good URL state management
const updateFilters = (filters: FilterState) => {
  const params = new URLSearchParams()

  // Only add non-default values to URL
  if (filters.category !== 'all') params.set('category', filters.category)
  if (filters.priceRange.min > 0) params.set('minPrice', filters.priceRange.min.toString())
  if (filters.priceRange.max < 1000) params.set('maxPrice', filters.priceRange.max.toString())

  router.replace(`/products?${params.toString()}`, { scroll: false })
}
```

❌ Incorrect:

```tsx
// Bad URL state management
const updateFilters = (filters: FilterState) => {
  const params = new URLSearchParams()

  // Adding all values, including defaults
  params.set('category', filters.category)
  params.set('minPrice', filters.priceRange.min.toString())
  params.set('maxPrice', filters.priceRange.max.toString())
  params.set('sort', filters.sort)
  params.set('page', filters.page.toString())

  router.push(`/products?${params.toString()}`)
}
```
