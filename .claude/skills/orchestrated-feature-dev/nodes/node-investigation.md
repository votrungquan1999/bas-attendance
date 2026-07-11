# Node: Investigation

Deep-dive investigation of assigned plan steps. A few instances run in parallel — each assigned a **batch of related steps** (grouped by shared files/module) — each with full plan context.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## Input

- Read `<ws>/implementation-plan.md` for the **full plan** (all steps, technical design, architecture decisions) — read it ONCE and reuse it for all your assigned steps
- Read `<ws>/PLAN_STEPS.md` for the step list
- You are assigned **one or more steps** — investigate ONLY those, one at a time, but use the full plan to understand how each relates to other steps. Files shared between your assigned steps need to be read only once.

## Execution

**Run this procedure for EACH assigned step, one at a time:**

### 1. Understand Your Step in Context

Read the step's behavior description. Then use the full plan to understand:
- What other steps depend on this one
- What this step depends on
- How this step fits into the overall feature

### 2. Investigate Affected Files

Identify every file this step will touch or create:
- Search the codebase for existing files in the affected area
- Read each affected file thoroughly — understand current state, not just surface-level structure
- Check imports, exports, and downstream consumers of affected files
- Note any files that other plan steps also touch (shared mutation points)

### 3. Check if Already Implemented

Search for existing code that already satisfies this step's behavior:
- Grep for related function names, types, constants
- Check if tests already cover this behavior
- Look for partial implementations that might conflict

### 4. Check for Conflicts and Mismatches

Compare what the plan says against what the codebase actually has:
- Does the plan assume a type/interface that doesn't exist or has a different shape?
- Does the plan reference files or functions by wrong names?
- Are there naming conventions the plan violates?
- Does this step's approach conflict with another step's approach?
- Are there race conditions or ordering issues between steps?

### 5. Verify Dependencies

- Are the libraries/packages the plan relies on actually installed?
- Are the utilities/helpers the plan references actually available?
- If this step depends on another step's output, is that output format correct?

### 6. Identify Edge Cases and Risks

- What happens with empty/null/undefined inputs?
- Are there error paths the plan doesn't account for?
- Performance implications for the approach described?
- Security concerns?

## Output

For EACH assigned step N, write that step's findings to its own `<ws>/INVESTIGATION_STEP_[N].md` (one file per step — the implementation loop consumes them per step):

```markdown
# Investigation: Step [N] — [behavior description]

## Affected Files
| File | Current State | Planned Change | Also Touched By |
|------|--------------|----------------|-----------------|
| [path] | [what it does now] | [what the plan says to do] | [other step numbers, or "none"] |

## Already Implemented
- [ ] Not implemented
- [ ] Partially implemented: [details]
- [ ] Fully implemented: [details]

## Conflicts Found
- [Conflict description, or "None found"]

## Plan Mismatches
- [Mismatch between plan and actual codebase, or "None found"]

## Missing Dependencies
- [Missing dep, or "All dependencies available"]

## Edge Cases / Risks
- [Edge case or risk, or "None identified"]

## Suggested Plan Fixes
- [Specific fix to the plan, with reasoning]

## Verdict
- **Can proceed as planned**: yes | yes with fixes | needs rework
- **Blocking issues**: [list, or "none"]
```
