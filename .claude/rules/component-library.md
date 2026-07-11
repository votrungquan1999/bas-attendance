---
paths: ['**/*.tsx', '**/*.jsx', '**/*.css']
description: 'Claude Code component library: shadcn/ui usage and best practices'
---

# Component Library

## 1. shadcn/ui Usage

- ALWAYS use shadcn/ui components unless explicitly told otherwise.
- NEVER create custom UI components when shadcn equivalents exist.
- ALWAYS install shadcn components using the CLI: `npx shadcn@latest add [component-name]`
- ALWAYS import shadcn components from `src/components/ui/`.
- If a component doesn't exist in shadcn, check the registry first before creating custom components.

✅ Correct:

```tsx
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'

export function LoginForm() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form className='space-y-4'>
          <Input placeholder='Email' />
          <Input type='password' placeholder='Password' />
          <Button type='submit'>Login</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

❌ Incorrect (creating custom components when shadcn exists):

```javascript
// DON'T DO THIS - use shadcn Button instead
function CustomButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md' onClick={onClick}>
      {children}
    </button>
  )
}

// DON'T DO THIS - use shadcn Dialog instead
function CustomModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean,
  onClose: () => void,
  children: React.ReactNode,
}) {
  return isOpen ? (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center'>
      <div className='bg-white p-6 rounded-lg'>{children}</div>
    </div>
  ) : null
}
```
