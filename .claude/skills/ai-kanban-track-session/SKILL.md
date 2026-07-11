---
name: ai-kanban-track-session
description: Auto-tracks the current operator's (coding agent, non-coding agent, or human) substantive, multi-step work as a self-owned AI-Kanban card — create the card in progress (tagged from whatever scope is available, session id included only when one exists), append concise progress notes as the work advances, and hand it to review when done. Trigger automatically at the start of any substantive multi-step task, or when the user types "/ai-kanban-track-session", says "track this on the board", or "open a card for this work".
allowed-tools: Bash, mcp__ai-kanban-dispatch__create_card, mcp__ai-kanban-dispatch__append_progress, mcp__ai-kanban-dispatch__set_status, mcp__ai-kanban-dispatch__get_card_context
---

# AI-Kanban: Track This Session

You are an operator — a coding agent, a non-coding agent, or a human — who has just taken on a piece of real work. Unlike `ai-kanban-work-card` (where a card id is handed to you), **no card exists yet** — you create one to track your own work, drive it through the board, and hand it off for review when you finish.

The server owns the card's integrity and persistence; you reach it through the `ai-kanban-dispatch` MCP tools. **You** own judgment: deciding the work is worth tracking, naming it, choosing its tags, and writing progress notes a human can skim later.

## When to track (and when not to)

Open a card **automatically, without asking**, when the work is **substantive and multi-step** — a feature, a refactor, a bug investigation, a migration: anything that will span several actions and that you'd want a record of.

**Skip tracking** for trivial or one-off requests — a single question, a one-line edit, a quick lookup, reformatting. Tracking those is noise. When in doubt and the task is small, don't track.

You decide silently. Do **not** ask the user "should I track this?" — either track it and announce, or skip it.

## Inputs (gather these yourself)

- **Tags** — if you're working in a repo with an `.ai-rules.json` at its root, its `scope` array is one source for tags. Otherwise, or if tags aren't available another way, **ask the user** what tags to use.
- **Session id** — optional. If you're running as a session that has an id (e.g. a Claude Code session's `$CLAUDE_CODE_SESSION_ID`), include it. If not, omit it — the card is created without one.
- **Task name** — a short, human title you infer from the work (e.g. "Add staled-card auto-park"). Used as the card title.

## Flow

Each step has its own instruction file in this skill's `steps/` directory — read and follow it:

1. **Open the card** — `steps/1-open-card.md`: gather tags (+ session id if one exists), infer a name, `create_card(...)` (it starts directly `in_progress`), and announce it in one line.
2. **Track progress** — `steps/2-track-progress.md`: as the work reaches meaningful checkpoints, `append_progress(<id>, <note>)` with one concise note each. Don't narrate every keystroke.
3. **Hand off** — `steps/3-hand-off.md`: when the work is done (or you're parking it), `set_status(<id>, "need_review")`.

## Critical Rules

**DO:**
- Track exactly one card per unit of work — the work you're currently doing.
- Let the dispatch tools own card creation, status, and persistence.
- Keep progress notes short and state-bearing — what changed and where, not a transcript.
- Announce the card once, briefly (e.g. "Tracking this as card #N."), then get back to the work.

**DO NOT:**
- Ask the user for permission to track — decide silently per the rules above.
- Track trivial / one-off requests.
- Invent your own status values — move only along the board's legal agent edges (the tool enforces this).
- Silently continue untracked when the **critical** step fails — if `create_card` fails, **stop and tell the user**; card creation is not a fire-and-forget side channel.
- Conversely, block the actual work on a **non-critical** tracking failure — if `append_progress` or `set_status` fails, tell the user and keep working; those are the side channel, not the task.
