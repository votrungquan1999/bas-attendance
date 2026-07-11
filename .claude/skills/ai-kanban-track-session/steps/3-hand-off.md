# Step 3: Hand Off for Review

When the work is finished — or you're stopping and want a human to look — move the card to review and leave it there.

## Action

Optionally append a closing progress note summarising the outcome, then:

```
set_status(<id>, "need_review")
```

`need_review` is a legal agent edge **from `in_progress`**. There is no direct `staled → need_review` edge: if the card was auto-parked into **Staled**, first resume it with `set_status(<id>, "in_progress")`, then move it to `need_review`. The tool enforces the board's transition policy, so an illegal move returns a readable error rather than corrupting state.

If the `set_status` call fails, report it and stop — don't loop. Tracking is a side channel; the actual work is already done.

## Interpret the result

- **Success** — the card now sits in **Need Review**. Stop tracking; the work is in a human's hands. Do not move it further yourself.
- **Failure** — report the error to the user. Don't loop on it; the work itself is already done.

## Don't

- Don't move the card to a terminal/done status yourself — review is a human step.
- Don't delete or archive the card.
