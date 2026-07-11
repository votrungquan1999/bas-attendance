---
paths: ['**/*.tsx', '**/*.jsx', '**/*.css']
description: 'Claude Code Tailwind CSS: core usage patterns, size utilities, positioning, and color tokens'
---

# Tailwind CSS Basics

## 1. Size Utilities

- ALWAYS use `size-x` instead of `w-x h-x`.

✅ Correct:

```tsx
<div className='size-4' />
```

❌ Incorrect:

```tsx
<div className='w-4 h-4' />
```

## 2. Positioning

- NEVER use `absolute` positioning. ALWAYS use `pile` class instead.

✅ Correct:

```tsx
<div className='pile' />
```

❌ Incorrect:

```tsx
<div className='absolute top-0 left-0' />
```

## 3. Layout System

- ALWAYS use `grid` for layout. ONLY use `flex` if grid cannot solve the layout requirement.

## 4. Color Tokens

- ALWAYS use tokenized color names (`bg-primary`, `text-muted`) instead of fixed palette values (`bg-blue-800`).

✅ Correct tokenized colors:

```tsx
<div className='bg-primary text-primary-foreground' />
<div className='bg-secondary text-secondary-foreground' />
<div className='text-muted-foreground border-border' />
<div className='bg-card text-card-foreground' />
<div className='bg-destructive text-destructive-foreground' />
```

❌ Incorrect fixed palette:

```tsx
<div className='bg-blue-600 text-white' />
<div className='bg-gray-100 text-gray-900' />
<div className='text-slate-600 border-gray-200' />
<div className='bg-red-500 text-white' />
```
