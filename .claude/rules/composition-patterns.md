---
paths: ['**/*.tsx', '**/*.jsx']
description: 'Claude Code React composition: server component composition patterns and examples'
---

# React Server Components Composition Patterns

## 1. Basic Composition Pattern

✅ Correct:

```tsx
// user-profile.tsx (Server Component)
import { UserProfileCard, UserProfileHeader, UserProfileBody } from './user-profile.ui'
import { UserProfileProvider } from './user-profile.state'

export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getUserById(userId)

  return (
    <UserProfileProvider>
      <UserProfileCard>
        <UserProfileHeader>
          <h1>{user.name}</h1>
          <span>{user.email}</span>
        </UserProfileHeader>
        <UserProfileBody>
          <p>{user.bio}</p>
          <EditProfileButton />
        </UserProfileBody>
      </UserProfileCard>
    </UserProfileProvider>
  )
}
```

```tsx
// user-profile.ui.tsx (Client Display Components)
'use client'

export function UserProfileCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn('bg-card text-card-foreground rounded-lg shadow-sm border', 'p-6 space-y-4')}>{children}</div>
  )
}

export function UserProfileHeader({ children }: { children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-between', 'pb-4 border-b border-border')}>{children}</div>
}

export function UserProfileBody({ children }: { children: React.ReactNode }) {
  return <div className='space-y-3'>{children}</div>
}
```

❌ Incorrect (putting content logic in client component):

```tsx
'use client'
export function UserProfileCard({ user, onEdit }) {
  return (
    <div className='bg-card rounded-lg p-6'>
      <div className='flex justify-between'>
        <h1>{user.name}</h1>
        <span>{user.email}</span>
      </div>
      <p>{user.bio}</p>
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  )
}
```

## 2. Interactive Component Pattern

✅ Correct (separating content from interaction):

```tsx
// dashboard.tsx (Server Component)
import { DashboardGrid, DashboardCard } from './dashboard.ui'
import { DashboardProvider } from './dashboard.state'

export default async function Dashboard() {
  const stats = await getStats()
  const notifications = await getNotifications()

  return (
    <DashboardProvider>
      <DashboardGrid>
        <DashboardCard>
          <h2>Revenue</h2>
          <p>${stats.revenue}</p>
        </DashboardCard>
        <DashboardCard>
          <h2>Notifications</h2>
          <NotificationsList>
            {notifications.map((n) => (
              <NotificationItem key={n.id}>{n.message}</NotificationItem>
            ))}
          </NotificationsList>
        </DashboardCard>
      </DashboardGrid>
    </DashboardProvider>
  )
}
```

```javascript
// dashboard.ui.tsx (Client Components)
'use client'

export function NotificationsList({ children }: { children: React.ReactNode }) {
  const { expandedItems, toggleItem } = useDashboardState()

  return (
    <div
      className='space-y-2'
      onClick={(e) => {
        const itemId = e.target.dataset.itemId
        if (itemId) toggleItem(itemId)
      }}
    >
      {children}
    </div>
  )
}
```

## 3. Client/Server Composition Pattern

Server components should handle content composition while client components focus only on interactive behavior. Pass complete elements as children to client components instead of recreating them.

✅ Correct (Server composes static content, client handles state):

```tsx
// mode-selection.tsx (Server Component)
import { TabsList, TabsTrigger, TabsContent } from 'src/components/ui/tabs'
import { TabsWrapper } from './component.ui'
import { CalculationMode } from './component.type'

export function ModeSelection() {
  return (
    <div className='space-y-2'>
      <TabsWrapper>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='1'>tab 1</TabsTrigger>
          <TabsTrigger value='2'>tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='1' className='mt-2'>
          <p className='text-sm text-muted-foreground'>tab 1 content</p>
        </TabsContent>
        <TabsContent value='2' className='mt-2'>
          <p className='text-sm text-muted-foreground'>tab 2 content</p>
        </TabsContent>
      </TabsWrapper>
    </div>
  )
}
```

```javascript
// component.ui.tsx (Client Component)
'use client'

import { Tabs } from 'src/components/ui/tabs'
import { useComponentState } from './component.state'
import { useComponentInput } from './hooks/component.input'

export function TabsWrapper({ children }: { children: React.ReactNode }) {
  const state = useComponentState()
  const { handleTabChange } = useComponentInput()

  return (
    <Tabs
      value="1"
      onValueChange={(value) => handleTabChange(value as string)}
      className='w-full'
    >
      {children}
    </Tabs>
  )
}
```

❌ Incorrect (Client component handling content composition):

```javascript
// mode-selection-with-state.tsx - DON'T DO THIS
'use client'

export function ModeSelectionWithState() {
  const state = useComponentState()
  const { handleTabChange } = useComponentInput()

  const tabs = [
    { value: '1', label: 'tab 1', description: 'tab 1 content' },
    { value: '2', label: 'tab 2', description: 'tab 2 content' },
  ]

  return (
    <Tabs value={state.tab} onValueChange={(value) => handleTabChange(value as string)}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={state.tab}>
        {/* Dynamic content based on state - DON'T DO THIS */}
        <p>{tabs.find((t) => t.value === state.tab)?.description}</p>
      </TabsContent>
    </Tabs>
  )
}
```
