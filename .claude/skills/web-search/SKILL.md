---
name: web-search
description: Guides effective web search for researching solutions, finding documentation, and gathering external context. Use when researching errors, looking up documentation, comparing tools, finding best practices, or when user says "search for", "look up", "research this", or "find documentation".
allowed-tools: Read, WebSearch, WebFetch, Bash, Write
context: fork
model: sonnet
effort: low
---

# Web Search

Structured approach to searching the web for relevant information during development tasks.

## When to Use

- Researching error messages or stack traces
- Finding documentation for libraries or APIs
- Investigating best practices for a pattern or approach
- Comparing tools, libraries, or frameworks
- Looking up syntax or usage examples
- Answering questions that require current/external knowledge

## Instructions

### Step 1: Define the Search Goal

Before searching, clearly state:
- **What** you need to find (specific question or topic)
- **Why** you need it (what decision or task it supports)
- **What format** will be most useful (tutorial, API reference, example code, comparison)

### Step 2: Craft Effective Queries

Write focused search queries:
- ✅ Include the technology/language: `"TypeScript generics conditional types example"`
- ✅ Include error messages verbatim: `"Cannot find module 'x' error node"`
- ✅ Use domain-specific terms: `"postgresql upsert on conflict do update"`
- ❌ Avoid vague queries: `"how to fix database error"`

**For domain-specific searches**, use the `domain` parameter to prioritize authoritative sources:
- Official docs: `domain: "docs.python.org"`, `domain: "developer.mozilla.org"`
- Stack Overflow: `domain: "stackoverflow.com"`
- GitHub: `domain: "github.com"`

### Step 3: Search and Evaluate

1. Execute the search using `WebSearch` or equivalent tool
2. Read the results critically — prioritize:
   - Official documentation over blog posts
   - Recent content over old posts (check dates)
   - Answers with high community validation
   - Content that matches your specific version/stack
3. If the first search doesn't yield good results, **refine the query** and try again (max 2-3 attempts)

### Step 4: Read and Extract

When a search result looks promising:
1. Use `WebFetch` or `Bash(curl)` to read the full page content
2. Extract the specific information you need
3. Note the source URL for reference
4. Verify the information against your existing understanding

### Step 5: Apply and Cite

- Apply the findings to your current task
- When sharing findings with the user, include the source URL
- If multiple sources conflict, present both perspectives

---

## Search Patterns

### Error Investigation
```
1. Search the exact error message
2. Add the technology stack to narrow results
3. Look for GitHub issues if it's library-specific
4. Check Stack Overflow for community solutions
```

### Library/API Research
```
1. Search official docs first (use domain parameter)
2. Look for "getting started" or "quickstart" guides
3. Search for specific API methods or features
4. Find example repositories on GitHub
```

---

## Best Practices

- ✅ Prefer official documentation over third-party content
- ✅ Verify information is current and version-appropriate
- ✅ Use `@context7` skill for library-specific documentation when available
- ✅ Share sources with the user for transparency
- ❌ Don't trust a single source blindly
- ❌ Don't spend more than 2-3 search attempts on the same question
- ❌ Don't copy code without understanding it

## Output

Write your complete findings to `./tmp/<identifier>/web-search-results.md` — where `<identifier>` is the caller-provided workspace, or a short ticket-id/slug you derive for this task (create the folder if needed). **If it already holds artifacts from unrelated work, STOP and ask the user rather than overwriting.** Do this before finishing, so the caller and user can review the full results.

## Related Skills

- `@context7` - Use for library-specific documentation queries (faster and more accurate than general web search)
