---
name: knowledge-base
description: Retrieve shared knowledge before doing non-trivial work and capture reusable knowledge after. Use before starting a non-obvious task (search the KB first), after solving a tricky problem, learning something surprising, or finding a reusable pattern, or when the user says "search the knowledge base", "capture this", "save this learning", or "remember this".
---

# Knowledge Base

A shared, scoped knowledge base reached through the `npx @quanvo99/ai-rules@latest kb` CLI command. Use it to avoid
re-solving solved problems and to bank reusable knowledge for your future self and teammates.

## The Loop

1. **Retrieve before acting.** Before any non-trivial task, run `npx @quanvo99/ai-rules@latest kb search "<query>"`.
   If a canonical entry answers the problem, `npx @quanvo99/ai-rules@latest kb get <id>`, apply it, and cite its id.
2. **Do the work.**
3. **Capture when it's worth keeping.** After solving a non-obvious problem, learning a
   surprising fact, or building a reusable pattern, draft a note with the right command.
   Dedup-check (search) before writing. Skip trivial / one-off things.

## The Four Capture Types

| Type | Command | Use for |
|---|---|---|
| Question | `npx @quanvo99/ai-rules@latest kb capture question` | a solved problem (problem + how it was resolved) |
| TIL | `npx @quanvo99/ai-rules@latest kb capture til` | a surprising fact or learning worth remembering |
| Blueprint | `npx @quanvo99/ai-rules@latest kb capture blueprint` | a reusable pattern, template, or recipe |
| Memory | `npx @quanvo99/ai-rules@latest kb capture memory` | a tiny always-true project fact (loaded every session) |

Use **Memory** sparingly — it is paid in context on every turn. It is claude-code only,
materializes on `npx @quanvo99/ai-rules@latest pull` into `.claude/rules/kb-memory.md`, and the command rejects
a body over 200 characters or 2 lines.

## Passing note bodies

For anything multi-line (a Question's problem/resolution, a Blueprint body), **write the
content to a temp file and pass it with `--file` / `--problem-file` / `--resolution-file`** —
quoting multi-line markdown on the shell is fragile. Short, single-line bodies can use the
inline `--body` / `--problem` / `--resolution` flags, or pipe via stdin.

## Drafts Need Approval

**Every capture creates a DRAFT.** A human reviewer must approve it before it surfaces in
`npx @quanvo99/ai-rules@latest kb search` or on pull. Never treat what you just captured as canonical or assume it
is live.

## Reference

- [retrieving.md](./reference/retrieving.md) — phrasing `kb search`, applying and citing a found entry
- [capturing.md](./reference/capturing.md) — dedup-check first, choosing the right type, draft != canonical
- [type-guides.md](./reference/type-guides.md) — body structure for Question / TIL / Blueprint
- [memory-guide.md](./reference/memory-guide.md) — what belongs in Memory, the caps, when NOT to use it

## Setup

Invoke the CLI as `npx @quanvo99/ai-rules@latest …` (pins the latest published version, no global install needed). `AI_RULES_SECRET` must be set in the environment (optionally
`AI_RULES_API_URL`). For search and pull, scope is read from the project's `.ai-rules.json` automatically. For **capture**, scope is now explicit and required: pass `--scope <csv>` to tag the entry to specific workspaces, or `--global` to make it a **global entry** (empty scope — visible to every workspace). Omitting both flags on a capture command is an error.
