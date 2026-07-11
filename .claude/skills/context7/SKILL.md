---
name: context7
description: Queries up-to-date library documentation and code examples via Context7 MCP server. Use when looking up API docs, finding code examples, checking framework patterns, or when user says "look up docs", "check documentation", or "how does this library work".
allowed-tools: Read, mcp__context7__resolve-library-id, mcp__context7__query-docs, Write
context: fork
model: sonnet
effort: low
---

# Context7

Query up-to-date documentation and code examples for any programming library or framework using the Context7 MCP server.

## When to Use

- Looking up API documentation for a specific library
- Finding code examples and usage patterns
- Checking framework-specific patterns and conventions
- Comparing approaches within a library's ecosystem
- Verifying correct usage of library features
- **Prefer this over `@web-search`** when the question is about a specific library or framework

## When NOT to Use

- General programming questions not tied to a specific library
- Searching for blog posts, tutorials, or opinions
- Questions about your own codebase (use file reading tools instead)

## Instructions

### Step 1: Resolve the Library ID

**Always resolve the library ID first** to get the correct Context7-compatible library ID.

```
Tool: mcp__context7__resolve-library-id
Args:
  libraryName: "react"    # The library name
  query: "how to use useEffect cleanup"  # What you're trying to accomplish
```

**Selection criteria** when multiple results are returned:
1. Exact name match (prioritize)
2. Higher Code Snippet count (more examples available)
3. Source reputation: High > Medium > Low
4. Higher Benchmark Score

### Step 2: Query the Documentation

Use the resolved library ID to query specific documentation:

```
Tool: mcp__context7__query-docs
Args:
  libraryId: "/vercel/next.js"  # From Step 1
  query: "how to set up server-side rendering with app router"  # Be specific
```

**Query tips:**
- ✅ Be specific: `"how to use useEffect cleanup function"` 
- ✅ Include context: `"authentication with JWT in Express.js middleware"`
- ❌ Too vague: `"hooks"` or `"auth"`

### Step 3: Apply the Results

1. Read the returned documentation and code examples
2. Adapt examples to fit your project's patterns and conventions
3. Don't blindly copy — adjust for your specific use case
4. If the results aren't helpful, refine your query and try again

---

## Limits

- **Max 3 calls per question** — if you can't find what you need after 3 Context7 queries, fall back to `@web-search`
- **Max 3 resolve-library-id calls per question** — use the best match available

## Best Practices

- ✅ Always resolve the library ID first before querying
- ✅ Write specific, detailed queries
- ✅ Check the library version matches your project's version
- ✅ Combine multiple query results for comprehensive understanding
- ✅ Fall back to `@web-search` if Context7 doesn't have the library
- ❌ Don't query without resolving the library ID first
- ❌ Don't exceed the per-question call limits
- ❌ Don't include sensitive information (API keys, credentials) in queries

## Output

Write your complete findings to `./tmp/<identifier>/docs-lookup.md` — where `<identifier>` is the caller-provided workspace, or a short ticket-id/slug you derive for this task (create the folder if needed). **If it already holds artifacts from unrelated work, STOP and ask the user rather than overwriting.** Do this before finishing, so the caller and user can review the full results.

## Related Skills

- `@web-search` - Fall back to web search when Context7 doesn't have the library or for non-library questions
- `@create-implementation-plan` - Use during the research phase of planning
