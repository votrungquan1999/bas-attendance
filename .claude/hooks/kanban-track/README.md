# AI-Kanban tracking hook

A `UserPromptSubmit` hook that keeps AI-Kanban tracking deterministic: every prompt is
re-evaluated by the harness (not the model's memory), and each prompt on an active card
is auto-logged to the kanban over HTTP.

## Install (manual drop-in)

1. Copy `kanban-track.mjs` into the target project's `.claude/hooks/kanban-track.mjs`.
2. Deep-merge the contents of `settings-fragment.json` into the project's
   `.claude/settings.json` under the `hooks` key (append to `hooks.UserPromptSubmit`,
   don't overwrite an existing array — preserve any hand-written hooks already there).
3. No other configuration is required — the hook reads the kanban URL and Basic-auth
   credentials from `~/.claude.json`'s `mcpServers["ai-kanban-dispatch"]` entry
   (project-scoped override first, falling back to the global entry).

## Runtime convention: the session pointer

The hook reads a per-session pointer file to know which AI-Kanban card is currently
active for the session:

```
~/.claude/kanban-session-state/<session_id>.json
```

```json
{ "cardNumber": 42, "cardId": "<24-hex ObjectId>", "summary": "short card summary" }
```

- Written by the model right after `create_card` (and overwritten whenever the model
  opens a new card because the task diverged).
- `cardNumber` + `summary` are shown to the user in the hook's reminder text.
- `cardId` is the 24-hex Mongo ObjectId used to POST progress notes via
  `append_progress` — never shown to the user.
- No pointer for the session = no active card; the hook reminds the model to open one
  if the prompt looks substantive.

## Behavior per prompt

1. Read stdin (`session_id`, `prompt`, `cwd`).
2. Look up the pointer for `session_id`.
   - No pointer → emit an "open a card if substantive" reminder.
   - Pointer present → emit the active card # + summary + "new card if diverged, else
     append" guidance.
3. If a pointer is present, POST the prompt to the kanban as a progress note
   (`append_progress`, best-effort — a missing config or unreachable endpoint never
   blocks the prompt; the hook always exits 0).
