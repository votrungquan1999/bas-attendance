---
paths: ['**/*.ts', '**/*.tsx']
description: 'Claude Code TypeScript conventions: interfaces, JSDoc, enums, and type patterns'
---

# TypeScript Conventions

## 1. Type and Interface Hoisting

- ALWAYS hoist `type` aliases and `interface` definitions to the top of the file.
- ALWAYS use `interface` instead of `type`, EXCEPT when:

  - You need a union type (`type A = B | C`).
  - You need mapped/conditional types.

## 2. JSDoc Requirements

- EVERY function MUST have a JSDoc block describing its purpose.
- WHENEVER function logic changes, JSDoc and inline comments MUST be updated accordingly.

✅ Example:

```ts
/**
 * Returns a user by ID from the database.
 * @param id - The unique identifier of the user
 * @returns Promise that resolves to the user object or null if not found
 */
async function getUserById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } })
}
```

❌ Incorrect (missing JSDoc or incomplete documentation):

```ts
// Missing JSDoc
function getUserById(id: string): Promise<User> {
  return db.user.findUnique({ where: { id } })
}

// Incomplete JSDoc
/**
 * Gets user
 */
function getUserById(id: string): Promise<User> {
  return db.user.findUnique({ where: { id } })
}
```

## 3. Import Statements

- NEVER use inline imports like `import("path/to/module").TypeName`. ALWAYS use proper import statements.

✅ Correct:

```ts
import type { UserData } from 'src/lib/user-types'

interface ApiResponse {
  data: UserData
  status: string
}
```

❌ Incorrect:

```ts
interface ApiResponse {
  data: import('src/lib/user-types').UserData
  status: string
}
```

## 4. Enum Usage

- ALWAYS use `enum` instead of string literal union types for fixed sets of values.

✅ Correct:

```ts
export enum ContributionPeriod {
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  SemiAnnually = 'semi-annually',
  Annually = 'annually',
}
```

❌ Incorrect:

```ts
type ContributionPeriod = 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually'
```

## 5. Type Separation for Different Purposes

- ALWAYS create separate types for different purposes, even if they appear identical.
- NEVER reuse types across different contexts (client display vs API input vs database vs internal functions).
- Each purpose should have its own dedicated type to prevent coupling and maintain clear boundaries.

✅ Correct:

```ts
// Client display type
export interface UserDisplay {
  name: string
  email: string
}

// API request type
export interface CreateUserRequest {
  name: string
  email: string
}
```

❌ Incorrect:

```ts
// DON'T reuse the same type for both client display and API input
export interface User {
  name: string
  email: string
}
```
