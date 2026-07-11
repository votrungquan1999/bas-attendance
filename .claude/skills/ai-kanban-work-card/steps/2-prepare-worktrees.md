# Step 2: Prepare the Worktree(s)

You now own the card. Create the git worktree(s) it needs **yourself**, in your own shell. No server code does this — failure modes here are open-ended, and you are better at reading the actual error and recovering than any fixed script. When the workspace is ready, declare the full result to the server.

## Conventions

- **Branch:** `aikanban/card-<N>` — where `<N>` is the card's human-readable number (from the claim result / card context). One branch per card.
- **Worktree path:** `workspaces/card-<N>/<repo>` — one directory per repo the card touches, under the card's workspace folder. `workspaces/` is git-ignored, so these never get committed to the parent repo.

## Procedure (per repo the card needs)

```bash
git fetch origin
git worktree add "workspaces/card-<N>/<repo>" -b "aikanban/card-<N>" origin/main
```

Adjust the base ref if the card calls for a different starting point.

## Recovery — handle these, don't give up

- **Branch already exists** (`fatal: a branch named 'aikanban/card-<N>' already exists`): attach the worktree to the existing branch instead of creating it — drop `-b` and use `git worktree add "workspaces/card-<N>/<repo>" "aikanban/card-<N>"`. If the branch is stale and clearly abandoned, you may reset it to `origin/main` first; otherwise keep its work.
- **Path already occupied** (the worktree directory exists): if it is a valid existing worktree for this card, reuse it (`git -C "workspaces/card-<N>/<repo>" status`); if it is junk, remove it (`git worktree remove --force` or `rm -rf` for a non-worktree dir) and recreate.
- **Dirty tree / locked worktree:** inspect with `git worktree list` and `git status`; prune dead entries with `git worktree prune`, then retry.

Read the real error message and choose the smallest recovery that preserves real work. Re-run `git worktree list` to confirm the final state.

## Declare the workspace

Once the worktree(s) exist, tell the server the resulting state:

```
set_workspace(<id>, {
  workspacePath: "workspaces/card-<N>",
  repos: [
    { repo: "<repo>", branch: "aikanban/card-<N>", worktreePath: "workspaces/card-<N>/<repo>" }
  ]
})
```

**Send the FULL set of repos every time.** `set_workspace` **replaces** the card's recorded workspace — it does not merge — so omitting a repo wipes it. List every worktree you created. Because it replaces, re-declaring the same state is safe and idempotent; if you add a repo later, re-send the complete list.

When the declaration succeeds, continue to `steps/3-work-and-complete.md`.
