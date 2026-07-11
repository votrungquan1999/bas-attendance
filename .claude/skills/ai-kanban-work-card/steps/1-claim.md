# Step 1: Claim the Card

Atomically take ownership of the card before doing anything else. The claim is a single server-side operation — exactly one session can win it.

## Action

Call the dispatch tool with the card id you were given:

```
claim_card(<id>)
```

## Interpret the result

- **Success** — the tool returns the card, now `in_progress`. It has been atomically flipped from `todo`; you are the one session working it. Continue to `steps/2-prepare-worktrees.md`.
- **Failure** — the tool returns a readable error result (not a crash). The card was **not** available: either it was already claimed by another session, or no card with that id exists (these are deliberately indistinguishable). **Stop here.** Do not create worktrees, do not change any status. Report to the user that the card could not be claimed (already taken or not found) and end.

Do not retry the claim in a loop — a failed claim means the card is not yours to work.
