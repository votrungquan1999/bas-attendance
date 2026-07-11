---
description: 'Knowledge Base: retrieve before non-trivial work and capture worthwhile knowledge after'
---

# Knowledge Base

- **Retrieve first.** Before non-trivial work, run `npx @quanvo99/ai-rules@latest kb search "<query>"`. If a
  canonical entry answers the problem, `npx @quanvo99/ai-rules@latest kb get <id>`, apply it, and cite its id.
- **Capture when it's worth keeping.** After solving a non-obvious problem, finding a
  reusable pattern, or learning a surprising fact, draft a note with the matching command:
  `npx @quanvo99/ai-rules@latest kb capture question` / `til` / `blueprint` — always pass `--scope <tags>` or `--global` (global = empty scope, visible to every workspace). Do NOT capture trivial or
  one-off things — they only add review noise.
- **Memory is for always-true project facts only.** Use `npx @quanvo99/ai-rules@latest kb capture memory --scope <tags>` (or `--global`) sparingly
  for conventions/constraints that must always be known here. Keep each to 1–2 lines.
- **Drafts are not canonical.** Everything you capture is a draft pending human review;
  never assume it's live.
