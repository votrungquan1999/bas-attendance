# Retrieving

How to find and apply existing knowledge before doing work.

## When to search

Search **before** any non-trivial task: a tricky bug, an unfamiliar area, a decision that
might already be settled, a pattern you suspect exists. Skip it only for truly trivial edits.

## Phrasing the search

`npx @quanvo99/ai-rules@latest kb search "<query>" [--type <type>]` ranks canonical entries whose scope intersects
the workspace, plus **global** entries (those captured with no scope), which surface in every workspace.

- **Query with the problem's nouns and symptoms**, not a full sentence. Good:
  `npx @quanvo99/ai-rules@latest kb search "flaky e2e mongo connection reset"`. Weak: `"how do I fix my test"`.
- Search is keyword/relevance ranked — include the specific error text, API name, or
  domain term you actually care about.
- **Narrow by `--type`** when you know the shape you want:
  `--type blueprint` for a reusable recipe, `--type question` for a solved problem,
  `--type til` for a fact, `--type memory` for an always-on fact.
- If the first query returns nothing useful, **re-query with different terms** (synonyms,
  the underlying cause instead of the symptom) before concluding the KB has nothing.

## Reading a hit

`npx @quanvo99/ai-rules@latest kb search` prints ranked hits, one per line, each starting with the entry's id. To
read the full body, run `npx @quanvo99/ai-rules@latest kb get <id>`.

## Applying and citing

When a canonical entry answers the problem:

1. Apply its guidance to the work.
2. **Cite the id** in your explanation, e.g. "Applying KB entry `<id>` (Blueprint: …)".
   Citing makes it traceable and signals the KB is being used, so stale or wrong entries
   get noticed and fixed.

Only canonical entries are ever returned — drafts are invisible until a reviewer approves them.
