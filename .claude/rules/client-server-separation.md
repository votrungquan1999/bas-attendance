---
paths: ['**/*.tsx', '**/*.jsx']
description: 'Claude Code client/server separation: component separation patterns and best practices'
---

# Client/Server Component Separation

## 1. Navigation Pattern

✅ Correct (Server composes content, client handles interaction):

```tsx
// navigation.tsx (Server Component)
export function Navigation() {
  return (
    <ActiveMenuButton href='/dashboard' tooltip='Dashboard'>
      <Link href='/dashboard'>
        <Home className='size-4' />
        <span>Dashboard</span>
      </Link>
    </ActiveMenuButton>
  )
}

// navigation.ui.tsx (Client Component)
export function ActiveMenuButton({
  children,
  href,
  tooltip,
}: {
  children: React.ReactNode
  href: string
  tooltip?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <SidebarMenuButton isActive={isActive} tooltip={tooltip}>
      {children}
    </SidebarMenuButton>
  )
}
```

❌ Incorrect (Client component handling content composition):

```tsx
// navigation.ui.tsx (Client Component) - DON'T DO THIS
export function ActiveMenuButton({
  href,
  icon: Icon,
  title,
}: {
  href: string
  icon: React.ComponentType
  title: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <SidebarMenuButton isActive={isActive}>
      {/* Content composition should be in server */}
      <Link href={href}>
        <Icon className='size-4' />
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  )
}
```

## 2. Form Field Pattern

✅ Correct:

```tsx
// initial-amount-field.tsx (Server Component)
import { Label } from 'src/components/ui/label'
import { SavedValuesPopoverWithState } from '../../components/saved-values-popover-with-state'
import { FormFieldWrapper } from '../../investment-calculator.ui'
import { InitialAmountFieldWithState } from './initial-amount-field-with-state'

export function InitialAmountField() {
  return (
    <FormFieldWrapper>
      <Label htmlFor='initialAmount'>Initial Investment</Label>
      <div className='flex gap-2'>
        <InitialAmountFieldWithState />
        <SavedValuesPopoverWithState fieldId='initialAmount' fieldType='number' />
      </div>
      <p className='text-sm text-muted-foreground'>
        One-time initial investment amount (leave empty to solve for this)
      </p>
    </FormFieldWrapper>
  )
}
```

```javascript
// initial-amount-field-with-state.tsx (Client Component)
'use client'

import { Input } from 'src/components/ui/input'
import { useInputHandlers } from '../../hooks/investment-calculator.input'
import { useInvestmentCalculatorState } from '../../investment-calculator.state'

export function InitialAmountFieldWithState() {
  const state = useInvestmentCalculatorState()
  const { handleInputChange } = useInputHandlers()

  return (
    <>
      <Input
      // input props here that need client state
      />
      {state.formState.formErrors.initialAmount && (
        <p className='text-sm text-destructive'>{state.formState.formErrors.initialAmount}</p>
      )}
    </>
  )
}
```

❌ Incorrect (mixing server and client concerns):

```javascript
// initial-amount-field.tsx - DON'T DO THIS
'use client'

export function InitialAmountField() {
  const state = useInvestmentCalculatorState()
  const { handleInputChange } = useInputHandlers()

  return (
    <div className='space-y-2'>
      <Label htmlFor='initialAmount'>Initial Investment</Label>
      <Input
      // input props here that need client state
      />
      <p className='text-sm text-muted-foreground'>One-time initial investment amount</p>
    </div>
  )
}
```

## 3. Data Display Pattern

✅ Correct (Server handles data, client handles interaction):

```tsx
// user-list.tsx (Server Component)
export async function UserList() {
  const users = await getUsers()

  return (
    <div className='space-y-4'>
      {users.map((user) => (
        <UserCard key={user.id} user={user}>
          <UserActions userId={user.id} />
        </UserCard>
      ))}
    </div>
  )
}

// user-card.ui.tsx (Client Component)
;('use client')
export function UserCard({ user, children }: { user: User; children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className='border rounded-lg p-4'>
      <div className='flex justify-between items-center'>
        <h3>{user.name}</h3>
        <button onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? 'Collapse' : 'Expand'}</button>
      </div>
      {isExpanded && (
        <div className='mt-2'>
          <p>{user.email}</p>
          {children}
        </div>
      )}
    </div>
  )
}
```

## 4. Key Principles

1. **Server Components**: Handle data fetching, static content, and composition
2. **Client Components**: Handle interactivity, state, and browser APIs
3. **Composition**: Pass complete elements as children, don't recreate them in client components
4. **Separation**: Keep concerns separate - don't mix data fetching with interactivity
5. **Performance**: Minimize client-side JavaScript by keeping as much as possible on the server
