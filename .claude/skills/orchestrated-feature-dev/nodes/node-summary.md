# Node: Summary

Generate a final summary of the entire orchestrated workflow execution.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## Input

Read all workflow state files:
- `<ws>/RESEARCH_OUTPUT.md`
- `<ws>/PLAN_STEPS.md`
- `<ws>/IMPLEMENTATION_PROGRESS.md`
- `<ws>/DECISIONS.md` (if present — the decision log)

## Execution

1. **Count completed steps** from `<ws>/PLAN_STEPS.md` (all with status `done`)
2. **Gather quality gate results** from all quality checkpoints
3. **List all files changed** across all steps
4. **Run the full test suite** one final time to confirm everything passes
5. **Run linting** to check for any remaining issues

## Output

Present to the user:

```markdown
# Feature Development Complete

## Summary
[One-paragraph description of what was built]

## Steps Completed: [X/Y]
| Step | Behavior | Result |
|------|----------|--------|
| 1 | [behavior] | ✅ done |
| 2 | [behavior] | ✅ done (already covered) |
| ... | ... | ... |

## Quality Gates: [X] checkpoints passed
- Checkpoint 1 (after steps 1-3): [pass/fixed N issues]
- Checkpoint 2 (after steps 4-6): [pass/fixed N issues]

## Key Decisions
[From `<ws>/DECISIONS.md` — each point where 2+ viable options existed and one was chosen. Omit this section only if the decision log is empty.]
- [choice]: chose [option] over [alternative(s)] — [why]

## Test Results
- Total tests: [count]
- All passing: [yes/no]

## Files Changed
- [file1]: [brief description]
- [file2]: [brief description]

## Notes
- [Any caveats, follow-ups, or things to watch out for]
```

## Cleanup

After presenting the summary, remind the user that the entire task workspace `<ws>` (`./tmp/<identifier>/`) can be cleaned up once the feature is complete — it contains `RESEARCH_OUTPUT.md`, `PLAN_STEPS.md`, `implementation-plan.md`, `IMPLEMENTATION_PROGRESS.md`, and the per-step investigation/validation files.

`./tmp/` should be in `.gitignore`; delete `<ws>` once the feature is merged.
