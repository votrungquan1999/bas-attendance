# Step 2: Track Progress

As the work advances, leave a short trail on the card so anyone (including a future resumed session) can see where things stand.

## When to append a note

Append at **meaningful checkpoints**, not on every action — e.g. a step finished, a decision made, a blocker hit, a plan changed. A good rule of thumb: if you'd mention it in a standup, it's worth a note.

Do **not** append a note for every tool call or edit. A card with fifty micro-notes is as useless as one with none.

## Action

```
append_progress(<id>, <note>)
```

Each call adds one timestamped note to the card's history (earlier notes are preserved) and bumps the card's `updatedAt` — which also keeps the card from being auto-parked as stale.

If an `append_progress` call fails, tell the user and keep working — tracking is a side channel, never a blocker for the actual task.

## Writing a good note

- **One line, state-bearing.** What changed and where — e.g. `Staled reconcile service done + wired into board read; UI next.`
- **Carry state forward.** Write what a resumed session would need to know to continue, not a narrative of what you did.
- **No secrets, no noise.** Skip transcripts, raw logs, and obvious restatements of the title.

## Keeping the card warm

An `in_progress` card untouched for 3 hours is auto-parked into **Staled** on the next board view. A genuine progress note resets that clock. If you resume a parked (Staled) card, move it back with `set_status(<id>, "in_progress")` before continuing, then keep appending notes.

When the work is complete (or you're parking it for review), continue to `steps/3-hand-off.md`.
