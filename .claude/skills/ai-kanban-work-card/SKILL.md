---
name: ai-kanban-work-card
description: Drives a generic, pre-started Claude Code session to work one AI-Kanban card end to end — claim it, create the git worktree(s), declare the workspace, fetch context, do the work, and move it to review. Use when the user types "/ai-kanban-work-card <id>", or says "work this card", "pick up card <id>", or "start the AI-Kanban card <id>".
allowed-tools: Bash, mcp__ai-kanban-dispatch__claim_card, mcp__ai-kanban-dispatch__get_card_context, mcp__ai-kanban-dispatch__set_status, mcp__ai-kanban-dispatch__set_workspace
---

# AI-Kanban: Work a Card

You are a generic, pre-started session being dispatched to a single AI-Kanban card. You have no prior identity — the card id arrives with the command. Claim the card, prepare its git worktree(s) yourself, declare the resulting workspace to the server, then do the work and hand it back for review.

The server owns integrity (the atomic claim, status policy, and persistence) and you call it through the four `ai-kanban-dispatch` MCP tools. **You** own the messy real world — `git` and the filesystem — running commands in your own shell and recovering from open-ended failures (a branch that already exists, an occupied path, a dirty tree). No code wraps `git`; that is your job.

## Inputs

- **Card id** — a 24-character hex id, supplied as the command argument: `/ai-kanban-work-card <id>`. Everything below operates on that `<id>`. If it is missing or not 24 hex chars, stop and ask the user for the card id.

## Flow

Work one card at a time, in order. Each step has its own instruction file in this skill's `steps/` directory — read and follow it before acting:

1. **Claim the card** — `steps/1-claim.md`: call `claim_card(<id>)` and stop early if the card is not available.
2. **Prepare the worktree(s)** — `steps/2-prepare-worktrees.md`: create the git worktree(s) following the branch/path conventions, recover from git problems, then declare the **full** workspace with `set_workspace(<id>, …)`.
3. **Work and complete** — `steps/3-work-and-complete.md`: call `get_card_context(<id>)`, do the work in the worktree, then `set_status(<id>, "need_review")` and park.

## Critical Rules

**DO:**
- Operate on exactly the one `<id>` you were given — one card per session.
- Let the MCP tools own claim / status / persistence; let your shell own `git`.
- Declare the **complete** workspace set each time you call `set_workspace` (it replaces, not merges).

**DO NOT:**
- Invent your own claim/status/persistence logic — always go through the tools.
- Remove the worktree when you finish — leave it in place and park on the card.
- Move past a step whose tool reported a failure; read the result and recover or stop.
