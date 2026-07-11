---
name: validate-pr-comments
description: Fetches all comments on a GitHub PR or GitLab MR, checks out the branch in a git worktree, and classifies each comment as VALID, INVALID, OUTDATED, or PARTIAL against the current code with explanations and recommended fixes. Use when the user says "validate PR comments", "check PR feedback", "are these review comments still valid", "review the comments on PR #N", or asks to triage reviewer feedback against actual code.
allowed-tools: Read, Grep, Glob, Bash, Write
context: fork
---

# Validate PR Comments

You are an autonomous reviewer-of-reviewers. For a given PR/MR, fetch every comment, inspect the actual code on the branch, and decide whether each comment is technically correct, already addressed, or off-base.

## When to Use

- A reviewer left many comments and the author wants to triage them
- A PR has been updated since comments were posted and some may be stale
- The author disagrees with feedback and wants a second opinion grounded in the code
- Pre-merge sanity check that all blocking comments are resolved

## Inputs

Required from the user (ask if missing):

- PR/MR identifier — URL, or `<number>` plus repo if not running inside the target repo
- Platform — auto-detect from `git remote get-url origin` (`github.com` → `gh`, `gitlab` → `glab`); confirm if ambiguous

## Steps

### 1. Detect Platform and Verify CLI

```bash
git remote get-url origin
gh --version  || echo "gh missing"
glab --version || echo "glab missing"
```

- If the required CLI is missing, stop and tell the user to install it (`brew install gh` / `brew install glab`) and authenticate (`gh auth status` / `glab auth status`).

### 2. Fetch All Comments

Fetch **all three categories** and tag each with its type so the report can apply the right validation rigor.

**GitHub (`gh`):**

```bash
# Inline review comments (line-anchored, strictest validation)
gh api "repos/{owner}/{repo}/pulls/{num}/comments" --paginate

# Review summaries (top-level review bodies, advisory)
gh api "repos/{owner}/{repo}/pulls/{num}/reviews" --paginate

# Issue-style PR comments (general discussion, advisory)
gh api "repos/{owner}/{repo}/issues/{num}/comments" --paginate

# Metadata: head branch, head SHA, base
gh pr view {num} --json headRefName,headRefOid,baseRefName,title,url
```

**GitLab (`glab`):**

```bash
# All notes (inline + general); inline notes have a `position` object
glab api "projects/:id/merge_requests/{iid}/notes" --paginate

# Discussions (groups inline threads)
glab api "projects/:id/merge_requests/{iid}/discussions" --paginate

# Metadata
glab mr view {iid} --output json
```

For each comment capture: id, author, body, created_at, file path + line (if inline), original commit SHA (if available), resolved/outdated flag.

### 3. Create the Worktree

```bash
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
WORKTREE_PATH="../${REPO_NAME}-pr-{num}"
git fetch origin {head_branch}
git worktree add "$WORKTREE_PATH" "origin/{head_branch}"
```

- Leave the worktree in place after the run — do **not** remove it.
- Note the path in the final report so the user can `cd` in or remove it later with `git worktree remove <path>`.
- All subsequent file reads and greps in steps 4–5 must operate inside `$WORKTREE_PATH`, not the current working directory.

### 4. Validate Each Comment

Apply rules per comment type:

**Inline review comments** (strictest — they point at specific lines):

1. Does the file still exist at the path the comment references?
2. Does the referenced line still exist? Compare the comment's `original_commit_id` (or `position.base_sha`) with the current branch HEAD using `git diff <original_sha>..HEAD -- <file>`. If the line was changed or removed → likely **OUTDATED**.
3. If the line still exists, read enough surrounding context (≥10 lines) to judge the claim.
4. Decide: is the technical claim correct against the *current* code?

**Review summaries and general PR comments** (advisory):

1. Read the body and extract the concrete claim(s). Skip pure approvals/LGTM.
2. Try to locate the code area being discussed (file/function/feature mentioned).
3. Judge whether the claim still applies to the branch as it is now.

For every comment, assign one classification:

- **VALID** — claim is technically correct and the issue is still present in the code
- **OUTDATED** — claim was once valid but has since been fixed/refactored/removed on this branch
- **INVALID** — claim is technically wrong, based on a misreading, or the suggested change would regress behavior
- **PARTIAL** — part of the claim holds (e.g. naming nit is fair) but the main critique does not, or vice versa

Also record:

- **Confidence**: HIGH / MEDIUM / LOW (use LOW when the comment is vague or you couldn't locate the code)
- **Evidence**: file:line references in the worktree that justify the call

### 5. Write the Report

Write the report to `./tmp/<identifier>/validate-pr-comments.md` in the **original repo** (not the worktree) — `<identifier>` is the PR/MR number (or a short slug). Create the folder if missing; **if it already holds artifacts from unrelated work, STOP and ask the user rather than overwriting.**

```markdown
## PR/MR
[Title] — [URL]
Branch: `<head>` → `<base>` @ `<head_sha_short>`
Worktree: `<absolute path>` (remove with `git worktree remove <path>` when done)

## Summary
- Total comments processed: N (inline: X, review summaries: Y, general: Z)
- VALID: A · OUTDATED: B · INVALID: C · PARTIAL: D · Skipped (LGTM/empty): E

## Findings

### [VALID] <one-line summary>
- **Comment**: <author> on `path/to/file.ts:42` — "<quoted body, trimmed>"
- **Current code**: `path/to/file.ts:42` (in worktree)
- **Why valid**: <what's actually wrong, grounded in the code>
- **Recommendation**: <concrete fix; code snippet only if it clarifies>
- **Confidence**: HIGH

### [OUTDATED] <summary>
- **Comment**: ...
- **Why outdated**: Line X was rewritten in commit `<sha>` — original concern no longer applies.
- **Action**: Reply to reviewer noting the fix; mark resolved.

### [INVALID] <summary>
- **Comment**: ...
- **Why invalid**: <reason — misreading, false premise, would regress>
- **Action**: Reply to reviewer with the counter-argument below.
- **Suggested reply**: "<draft a short, respectful response grounded in the code>"

### [PARTIAL] <summary>
- **Comment**: ...
- **Valid part**: ...
- **Invalid part**: ...
- **Recommendation**: Address the valid part only.

## Recommended Actions (ordered)
1. Fix VALID items (highest impact first).
2. Mark OUTDATED items resolved with a one-line reply pointing at the fix commit.
3. Reply to INVALID items using the suggested replies above.
4. For PARTIAL, address the valid sub-point.

## Skipped
- LGTM / approval-only / empty comments: <count> (ids listed if user wants)
```

## Critical Rules

**DO:**
- Read code from the worktree, not the current branch — the user may be on a different branch.
- Quote only the relevant fragment of long comments; never dump the full thread.
- Cite `file:line` for every VALID/PARTIAL finding.
- Use the comment's original commit SHA (when available) to detect OUTDATED comments precisely.
- Treat resolved/outdated flags from the platform as a strong hint, but still verify against code.

**DO NOT:**
- Auto-resolve, auto-reply, or push commits — this skill is read-only.
- Remove the worktree at the end; leave it for the user.
- Re-review the whole PR — only judge the comments. For broad review use `@review-changes`.
- Output the raw API JSON to the user.

## Output

Write the full report to `./tmp/<identifier>/validate-pr-comments.md` (the PR/MR-scoped folder from Step 5) before finishing. End your chat reply with the worktree path and the counts line so the user sees the headline result without opening the file.

## Related Skills

- `@review-changes` — full senior-engineer review of the diff (use when there are no comments yet)
- `@create-pr` — generate PR title/description before requesting review
