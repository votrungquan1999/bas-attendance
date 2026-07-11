---
paths: ['**/*.ts', '**/*.tsx']
description: 'Claude Code TypeScript imports/exports: patterns and organization rules'
---

# TypeScript Imports and Exports

## 1. Export Statements

- NEVER use multi-export statements like `export { A, B, C }` or `export type { X, Y, Z }`. ALWAYS use individual export statements for better traceability.
- NEVER re-export types from shared locations. Each file should only export its own specific types and import shared types directly.
- ALWAYS keep types with their related functionality. For example, S3UploadResult should be in the S3 file, not in product types.

✅ Correct:

```ts
export interface User {
  id: string
  name: string
}

export interface Product {
  id: string
  title: string
}

export enum UserRole {
  Admin = 'admin',
  Member = 'member',
}

export enum ProductStatus {
  Active = 'active',
  Archived = 'archived',
}
```

❌ Incorrect:

```ts
interface User {
  id: string
  name: string
}

interface Product {
  id: string
  title: string
}

export type { User, Product }
export { UserRole, ProductStatus }
```
