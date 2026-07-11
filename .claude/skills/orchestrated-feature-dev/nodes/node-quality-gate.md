# Node: Quality Gate

Periodic quality check that reviews recent tests and implementation for issues.

> **Task workspace:** State files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt.

## Input

Read `<ws>/PLAN_STEPS.md` to identify which steps were completed since the last quality check.

## Execution

### 1. Test Quality Review

Use `@test-quality-reviewer` to review the tests written in the most recent 2-3 steps.

Focus on:
- Are tests reliable (no flakiness)?
- Are assertions valid (actually proving correctness)?
- Are tests sensitive (would catch real bugs)?

### 2. Code Refactoring Review

Use `@code-refactoring` to review the implementation from recent steps.

Focus on:
- Any duplication introduced across recent steps?
- Naming clarity?
- Unnecessary complexity?

**If `@code-refactoring` reports missing test coverage → skip the refactoring review** rather than blocking. The tests exist from the BDD scenario steps.

### 3. Apply Fixes

If issues are found:
1. Fix them immediately
2. Run all tests to confirm nothing broke
3. Note what was fixed

## Output

Report the quality gate result:

```markdown
## Quality Gate: After steps [X-Y]

### Test Quality
- **Score**: [Excellent / Good / Needs Improvement]
- **Issues Found**: [count]
- **Issues Fixed**: [count]
- **Details**: [brief list]

### Code Quality
- **Refactoring Applied**: [yes/no]
- **Changes Made**: [brief list, or "none needed"]

### Overall
- **Quality**: pass | needs-fixes
- **Notes**: [anything the orchestrator needs to know]
```
