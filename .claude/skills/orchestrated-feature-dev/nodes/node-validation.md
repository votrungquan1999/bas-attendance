# Node: Validation

Post-implementation validation of assigned plan steps. A few instances run in parallel — each assigned a **batch of related steps** (grouped by shared files) — each with the plan and implementation context it needs.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## Input

- Read `<ws>/implementation-plan.md` and `<ws>/PLAN_STEPS.md`, focusing on the sections relevant to your assigned steps — read them ONCE and reuse for all your steps
- In `<ws>/IMPLEMENTATION_PROGRESS.md`, read your assigned steps' entries plus the entries of steps that share the same files (needed for cross-step checks) — not the whole file
- You are assigned **one or more steps** — validate ONLY those, one at a time. Files shared between your assigned steps need to be read only once.

## Execution

**Run this procedure for EACH assigned step, one at a time:**

### 1. Verify Implementation Matches Plan

Read the files changed for the step (listed in `<ws>/IMPLEMENTATION_PROGRESS.md`):
- Does the implementation actually deliver the planned behavior?
- Are there deviations from the plan that weren't documented?
- Was the technical approach from the plan followed?

### 2. Verify Test Coverage & Meaningfulness

Find and read the test(s) written for this step:
- **Coverage is good**: are all aspects of the planned behavior exercised — happy path plus the relevant edge/error cases and boundaries? Note any part of the behavior left untested.
- **Tests are meaningful** (apply the 4 Pillars, especially Validity & Sensitivity): does each test have a valid, sensitive assertion that would FAIL if the behavior were wrong? Reject hollow/tautological tests, over-mocking that bypasses the code under test, and assertions too loose to catch a real defect.
- Does the test actually assert the planned behavior?
- Run the test in isolation — does it pass?
- Could the test pass even if the implementation were wrong (false positive)?
- **Skipped tests**: if the step is marked `done (test skipped — no meaningful test possible, user approved)`, confirm the skip was user-approved and record the behavior as implementation-only (untested) in the verdict. Do NOT flag it as a coverage gap to fix unless the original reason no longer holds (a fixture/seam now exists that makes a meaningful test possible).

### 3. Check for Regressions Against Other Steps

- Read the implementation of adjacent steps (those that touch shared files)
- Are there conflicts introduced by this step's changes?
- Did this step accidentally overwrite or break another step's work?

### 4. Run Related Tests

Run tests related to this step's affected area:
- The step's own test(s)
- Tests for features that share the same files
- Report any failures

### 5. Check Code Quality

Quick review of the implementation:
- Does it follow the codebase's existing patterns?
- Any obvious bugs, missing error handling at system boundaries, or type issues?
- Any leftover debug code or TODOs?

## Output

For EACH assigned step N, write that step's findings to its own `<ws>/VALIDATION_STEP_[N].md` (one file per step):

```markdown
# Validation: Step [N] — [behavior description]

## Implementation vs Plan
- **Matches plan**: yes | partial | no
- **Deviations**: [list, or "none"]

## Test Coverage & Meaningfulness
- **Test file**: [path, or "none — test skipped (user approved): reason"]
- **Coverage adequate**: yes | partial — [what aspect/edge case is untested]
- **Tests meaningful**: yes | no — [4 Pillars: valid + sensitive assertion? hollow/over-mocked?]
- **Assertions valid**: yes | no — [details]
- **Test passes**: yes | no
- **False positive risk**: low | medium | high — [why]

## Cross-Step Consistency
- **Shared files checked**: [list]
- **Conflicts with other steps**: [list, or "none"]

## Test Results
- **Step test**: ✅ pass | ❌ fail
- **Related tests**: ✅ all pass | ❌ [failures]

## Issues Found
- [Issue description and severity, or "None"]

## Verdict
- **Step valid**: yes | yes with caveats | no
- **Action needed**: none | [specific fix required]
```
