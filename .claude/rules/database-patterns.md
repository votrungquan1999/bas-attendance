---
paths: ['**/*.ts', '**/database/**/*.ts', '**/server/**/*.ts']
description: 'Claude Code database patterns: typed collections, data conversion, and document types'
---

# Database Typing and Conversion

## 1. Typed Database Collections

- ALWAYS use typed database collections with proper document types.
- ALL database document types MUST have the "Document" suffix.
- ALWAYS separate database document types from client-facing interfaces.

✅ Correct:

```ts
// Database document type
export interface ProductDocument {
  _id?: unknown // MongoDB ObjectId
  id: string
  name: string
  // ... other database fields
}

// Client-facing interface
export interface Product {
  id: string
  name: string
  // ... clean interface for components
}

// Database access with proper typing
const db = await getDatabase()
const products = await db.collection<ProductDocument>('products').find({}).toArray()
```

❌ Incorrect:

```ts
// Missing Document suffix
export interface Product {
  _id?: any
  id: string
  name: string
}

// Untyped database access
const products = await db.collection('products').find({}).toArray()
```

## 2. Data Conversion

- ALWAYS convert database documents to client interfaces when returning data.
- NEVER expose raw database documents to client components.

✅ Correct:

```ts
export async function getAllProducts(): Promise<Product[]> {
  const db = await getDatabase()
  const documents = await db.collection<ProductDocument>('products').find({}).toArray()

  // Convert to client interface
  return documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    // ... map only needed fields
  }))
}
```

❌ Incorrect:

```ts
export async function getAllProducts(): Promise<ProductDocument[]> {
  const db = await getDatabase()
  return await db.collection<ProductDocument>('products').find({}).toArray()
}
```
