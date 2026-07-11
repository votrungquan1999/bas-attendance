---
paths: ['**/*.tsx', '**/*.jsx']
description: 'Claude Code React Server Components: core rules and usage patterns'
---

# React Server Components Rules

## 1. Server vs Client Component Usage

- ALWAYS use server components for:
  1. Text, copy, translations
  2. Database access
  3. Authentication & authorization
  4. Environment variables
  5. Server-to-server communication
- ONLY use client components when interactivity/hooks are required.

## 2. Styling and Layout

- NEVER put styling/layout code directly in server components. Extract to `*.ui.tsx`.

## 3. URL Generation

- ALWAYS generate `href` values with a factory function in `href.ts`, colocated with the relevant layout.

## 4. Data Fetching

- ALWAYS fetch data in the component that directly uses it.
- If multiple children need the same data, DO NOT fetch in the parent. Instead, use a shared loader or fetch independently in each child.

## 5. Extract Display Components Checklist

When extracting into `*.ui.tsx` (client display components), ensure ALL checks pass:

- [ ] Does the component exist only to handle display/content (icons, text, numbers)?
- [ ] Does it accept `children` as the main way of passing content?
- [ ] If it has multiple content props, can it be broken into smaller components?
- [ ] Is the component name reflective of its usage?
- [ ] Is composition handled by the server, not the display component?

## 6. Server Component Best Practices

✅ Correct (Server Component with data fetching):

```tsx
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUserById(userId)

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

❌ Incorrect (Client-side data fetching in Server Component):

```tsx
// DON'T DO THIS - Using useEffect in Server Component
async function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser)
  }, [userId])

  if (!user) return <div>Loading...</div>

  return <div>{user.name}</div>
}
```

## 7. Performance Considerations

- Server Components reduce client-side JavaScript bundle size
- Use Server Components for static content and data fetching
- Only use Client Components when you need browser APIs or interactivity
- Consider the trade-off between server and client rendering based on your use case
