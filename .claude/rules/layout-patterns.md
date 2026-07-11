---
paths: ['**/*.tsx', '**/*.jsx', '**/*.css']
description: 'Claude Code layout patterns: grid-based list views and responsive layout patterns'
---

# Layout Patterns

## 1. List View Grid Structure

- Root component MUST always use `grid`. Rows MUST use this template:

✅ Template:

```tsx
<div className='grid grid-cols-subgrid col-span-full'>{rowContent}</div>
```

## 2. List View Responsive Layout

- For responsiveness, ONLY change the root component's grid structure.
- For cell components, ALWAYS position with `col-start`, `col-end`, etc. NEVER reorder DOM for layout.

✅ Correct:

```tsx
<div className='col-start-2 col-end-4'>Cell</div>
```

❌ Incorrect:

```tsx
<div style={{ order: 2 }}>Cell</div>
```

## 3. Responsive Class Organization

- ALWAYS split semantic vs. layout classes into **separate strings**.
- ALWAYS group by category:
  - **Semantic**: typography, color, spacing
  - **Layout**: grid/flex positioning
  - **Breakpoints**: responsive overrides

✅ Correct:

```tsx
<div
  className={cn(
    'text-muted-foreground flex flex-col items-start px-4 py-2 whitespace-nowrap',
    'col-start-1 row-span-2 row-start-3',
    '@lg:col-start-4 @lg:row-span-2'
  )}
>
  {children}
</div>
```

❌ Incorrect:

```tsx
<div className='text-muted-foreground flex flex-col items-start px-4 py-2 whitespace-nowrap col-start-1 row-span-2 row-start-3 @lg:col-start-4 @lg:row-span-2'>
  {children}
</div>
```
