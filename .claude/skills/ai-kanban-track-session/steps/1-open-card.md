# Step 1: Open the Card

Create the card that tracks this work and announce it.

## Gather the inputs

1. **Tags** — if you're working in a repo with an `.ai-rules.json` at its root, its `scope` array is a good default for tags. If that's not available (no such file, no `scope` key, or you're not operating in a repo at all), **ask the user** which tags to use and proceed with their answer.
2. **Session id** — optional. If you're running as a session that has an id (e.g. a Claude Code session's `$CLAUDE_CODE_SESSION_ID`), include it — `create_card` accepts it as a bonus reference. If there is no session id (a different kind of agent, or a human), omit the field entirely; do not stop or ask the user for one.
3. **Task name** — infer a short title from the work (a few words, imperative — e.g. "Add staled-card auto-park").

## Action

Call the dispatch tool:

```
create_card({
  title: <task name>,
  description: <one-sentence summary of the goal, optional>,
  tags: <the tags gathered above>,
  sessionId: <session id, only if one exists — omit the key otherwise>,
})
```

The card is created **directly in `in_progress`** — there is no separate claim step. The tool returns the created card, including its number (`#N`) and id; keep the id for the rest of the session.

## Announce it

Tell the user in **one line**, e.g. `Tracking this as card #N.` Then continue the actual work. Don't over-explain.

## Interpret the result

- **Success** — you have a card id and number. Continue to `steps/2-track-progress.md`.
- **Failure** — the tool returns a readable error result. Card creation is the **critical** step of this flow, so **stop and surface it to the user** — report the error and let them decide (retry, fix the board, or explicitly proceed without tracking). Do not silently continue untracked.
