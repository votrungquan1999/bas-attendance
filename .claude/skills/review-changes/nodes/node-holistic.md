# Node: Holistic

Run by the orchestrator inline, on the strong model. Produces the shared framing every lens depends on. Covers eligibility, the changes summary, and the approach evaluation (steps 1–4 of a classic senior review).

## Execution

### 1. Execute git diff

Work from inside the repo the orchestrator resolved in Step 0 (the repo the conversation is about, not the launch pwd), against the fresh `$BASE` it fetched (not a stale local `main`). Run `git diff "$BASE"` (fall back to `HEAD~1` only if no base branch exists).
- **Do NOT output the raw diff to the user.**

### 2. Eligibility check (gate)

Stop early — do not fan out — when the review adds no value:
- **No changes** → state that clearly and stop.
- **Trivial diff** (a handful of lines, generated files, pure formatting, version bumps) → do a single inline review and skip the lens fan-out. Note that you took the fast path.

Only proceed to the lens fan-out when the diff is **non-trivial** (real logic, multiple files, or anything touching data/auth/security).

### 3. Understand the problem

Before judging the code:
- Read the PR/commit description, linked issues, or ask the user for context.
- Identify the **root cause** being solved — not just the symptom.
- Note the **constraints** (backward compatibility, performance, existing patterns).
- Form your own mental model: "If I were solving this from scratch, how would I approach it?"

### 4. Changes summary

A high-level functional summary (not line-by-line):
- **Added** — new functions/features and where
- **Modified** — functional changes to existing code
- **Removed** — deleted functions/features
- **User-flow impact** — how behavior/UX changes
- **Overall purpose** — what problem this solves
- **Business impact** — what this means in business/stakeholder terms (value delivered, risk reduced, who it affects) — plain language, no jargon

### 5. Approach evaluation

Compare the change against your mental model:
- Does it fix the **root cause** or just a symptom?
- Is this the right **layer/level** to fix at?
- Are there **simpler or more robust alternatives** the author missed?
- Does it introduce **unnecessary complexity** or over-engineering?
- What **trade-offs** should the author be aware of?
- If the approach differs from yours, is the author's still valid?

This evaluation is holistic and is NOT repeated by any lens — it lives only here.

## Output

Write `./tmp/review-changes/HOLISTIC.md`:

```markdown
# Holistic

## Eligibility
[proceed-with-fan-out | single-inline-pass | stop] — [reason]

## Root Cause & Constraints
[The problem being solved and the constraints around it]

## Intended Approach (mental model)
[How a correct fix looks, for lenses to judge against]

## Changes Summary
- Added: ...
- Modified: ...
- Removed: ...
- User-flow impact: ...
- Overall purpose: ...
- Business impact: ...

## Approach Evaluation
[Root cause vs symptom, layer, alternatives, complexity, trade-offs, verdict]

## Overall Risk Level
[low | medium | high] — [one line]
```
