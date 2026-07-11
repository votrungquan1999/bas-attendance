---
name: pr-comment-triage
description: Pull unresolved comments from a PR (or MR), classify each thread as VALID or INVALID, and for VALID issues state the precise fail condition — the exact preconditions under which the bug manifests in production. Use when the user pastes a PR URL with phrasing like "pull the comments and tell me which are valid", "review feedback on this PR", "are these review comments real issues", "help me triage PR comments", or asks for a verdict on a bot review.
---

# PR Comment Triage

Cut through reviewer noise (especially AI-bot reviews) by classifying each thread as VALID or INVALID, and for the VALID ones, pinning down the exact runtime preconditions that would actually make the bug fire. Reviewer comments often inflate hypothetical risks; the fail-condition framing forces both you and the user to judge severity from facts, not vibes.

## When to Use

The user pastes a PR URL or thread link and asks any of:

- "Pull the comments / pull the unresolved comments / help me pull them"
- "Are these review comments valid"
- "Tell me which are valid and the failure condition"
- "Triage / classify these comments"
- "Is this finding a real bug"

For a single named comment, applying the fail-condition lens to that one is fine. For an inline ask of "should I fix this comment?" without a URL, skip this skill and answer directly.

## The Output Shape

For each thread, produce **one short block**:

```
### Thread N — <one-line summary>
**File:** path:line
**Verdict:** VALID  |  INVALID  |  RESOLVED-BY-OTHER
**Fail condition** (only if VALID and the comment claims a bug):
  <precondition A> AND <precondition B> AND <precondition C> → <observed failure>
**Reason:** one or two sentences — why VALID/INVALID, drawn from the actual code, not from the comment's framing.
```

At the end, a one-line **Suggested action** per thread (`fix`, `won't fix`, `invalid`) so the user can rubber-stamp the triage with a single message.

Do NOT render as a wide markdown table — they misalign in the terminal. Use the block format above or a tight bullet list.

## Workflow

### 1. Fetch all threads

Use whatever PR CLI is available locally to fetch every discussion thread with its replies and resolved state. Detect the platform from the URL.

### 2. Filter to actionable threads

Keep only threads where:

- the first note is **not** a system event (push notifications, branch updates, "approved" auto-messages)
- the **last** note's resolved flag is `false` or `null`

**Common gotcha:** to detect "still unresolved," check the **last** note's resolved flag, not the first. Adding a reply to a resolved thread re-opens it; the first note's flag is stale.

Capture for each thread: the thread id, author, `file:line`, full body. Keep the id — needed for reply/resolve.

### 3. Classify each thread

For each unresolved thread, answer two questions before writing anything:

**a) Does this describe code actually present in the current diff?** Open the file, find the line. If the comment is responding to code that no longer exists, it's `RESOLVED-BY-OTHER` and skip the fail-condition analysis.

**b) If the comment claims a bug or regression, can I write a sequence of preconditions that triggers it in production?** Not "could break," not "fragile." The exact runtime state that produces the observed failure.

- If yes → **VALID**. Write the fail condition as concrete preconditions joined by AND, ending with `→ <observed failure>`. Use actual variable names from the code so the user can grep for them.
- If no — the precondition requires a producer that doesn't exist, a config that isn't set, a hypothetical future scheme, etc. → **INVALID** (defensive future-proofing). State which precondition can't currently be satisfied.

For non-bug comments (test gaps, nits, style suggestions):

- **VALID** if there's a real coverage hole or maintainability issue **and** the project's rules support acting on it (e.g. project says "extract at 3 occurrences"; comment flags 2-occurrence duplication → INVALID).
- Cite the rule when invoking it.

### 4. Calibration — when to push back on the reviewer

AI review bots routinely flag:

- **"Magic literal X should be extracted"** with only 1–2 occurrences → INVALID under a rule-of-3 convention.
- **"Type cast `as X` is unsafe"** for cast patterns that already exist in the codebase → INVALID unless a new failure mode was introduced.
- **"Add tests for this conditional"** with no behavior change → often INVALID; tests should follow real risk, not coverage targets.
- **"Could silently break if a future producer …"** with no current producer that triggers it → INVALID (defensive future-proofing).
- **"Hardcoded count in test breaks if fixture changes"** when the count is the assertion's point → INVALID (the literal IS the sensitivity).
- **"Component-level test missing — only integration covers this"** when an integration test already exercises the path → usually INVALID.

Conversely, treat these as default-VALID:

- A condition change that silently drops behavior for some inputs (regression).
- A new code path with no test that's not covered by any sibling test.
- A real semantic divergence between producer and consumer (registry key mismatch, etc.).

### 5. Present

Output each thread block, then close with:

```
**Suggested action:** Thread 1 fix · Thread 2 won't fix · Thread 3 fix · …
```

So the user can reply with a single line ("do 1 and 3, won't fix the rest") and you proceed to the apply/reply/resolve phase.

## Reply + Resolve Phase (after user verdicts)

The user typically follows up with:

> Fix N and M. For the rest reply only "fixed", "won't fix", or "invalid" then resolve.

Loop through the threads — one reply + one resolve per thread — using the same CLI you fetched with. Confirm at the end with a tally (`X replied 'fixed', Y replied 'won't fix', Z replied 'invalid', all resolved`).

**Reply text must be EXACTLY** what the user instructed — usually a single word (`fixed`, `won't fix`, `invalid`). Do not add explanations, sub-bullets, or "thanks for the feedback" prefaces.

## Anti-patterns

- ❌ Outputting a wide table — wraps and misaligns in the terminal.
- ❌ Filtering only the first note's resolved flag — misses threads with replies on top.
- ❌ Saying "VALID — could potentially break" without writing the actual fail condition. If you can't write it, it's not VALID.
- ❌ Auto-fixing accepted comments before the user gives verdicts. Triage first, ask, then act.
- ❌ Posting verdict replies with extra text beyond the user's exact instruction.
- ❌ Resolving without replying.
