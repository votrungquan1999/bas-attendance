# Memory Guide

Memory is the always-on type. Unlike Question / TIL / Blueprint (retrieved on demand via
`npx @quanvo99/ai-rules@latest kb search`), an approved Memory is materialized on `npx @quanvo99/ai-rules@latest pull` into
`.claude/rules/kb-memory.md` and **loaded into every session** for the workspace. That means
it is paid in context on every turn — so the bar is high.

## What belongs in Memory

Only a **tiny, always-true project fact** the agent must know without being asked:

- A hard convention or constraint ("All DB document types use the `Document` suffix").
- A non-obvious gotcha that applies every session ("API server must be running before tests").
- A standing decision that silently changes how routine work is done.

If it's "look it up when relevant", it's a TIL or Blueprint — not a Memory.

## The caps (enforced by the CLI/server)

`npx @quanvo99/ai-rules@latest kb capture memory` — the command **rejects (exit non-zero)** a body that is:

- longer than **200 characters**, OR
- more than **2 lines**.

Keep each memory to 1–2 lines. `--title` is optional — when omitted, the title is derived
from the first line.

## When NOT to use Memory

- It only matters for one task or one area → use a TIL / Question / Blueprint instead.
- It's long, nuanced, or needs examples → it won't fit the cap and would bloat every session.
- It might change soon → always-on stale facts are worse than absent ones.
- It's not claude-code → Memory is **claude-code only**; other agents won't receive it.

## Remember: still a draft

Like every capture, `npx @quanvo99/ai-rules@latest kb capture memory` creates a **draft**. A reviewer must approve
it before it materializes on pull. Review for Memory is deliberately stricter because it costs
context every turn.
