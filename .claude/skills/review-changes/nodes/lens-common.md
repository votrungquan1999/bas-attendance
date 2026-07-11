# Shared Lens Rules

Rules every review lens follows. Your specific focus is in your own `node-lens-*.md` file; this file is the common discipline.

## Scope

- Review **ONLY the code shown in the current diff**. Do not comment on unchanged code or pre-existing issues on lines the diff didn't touch.
- Read `./tmp/review-changes/HOLISTIC.md` first for shared framing: the intended approach, constraints, and the root cause being solved. Judge the change against that intent.
- Assume intent is correct unless there is clear risk. Prefer concrete, actionable suggestions and explain the "why".
- Judging the diff sometimes depends on code **outside** it — a callee, a caller, a type, a config, a runtime assumption — that you haven't read. Don't guess and don't stay silent: mark the finding `Needs verification: yes` and name what to check (see [Flag findings that need a code-level check](#flag-findings-that-need-a-code-level-check) below).

## What NOT to flag (false positives)

- Pre-existing issues, or anything on lines the diff did not modify
- Anything a linter / typechecker / compiler would catch (missing imports, type errors, formatting) — assume CI runs these
- Pedantic nitpicks a senior engineer wouldn't raise
- Changes that are clearly intentional and part of the broader change

Do NOT run the build or typecheck — that is CI's job.

## Severity

- **MUST FIX** — could cause bugs, security vulnerabilities, or data loss
- **SHOULD FIX** — important for maintainability, performance, or best practices
- **NIT** — minor style/consistency

## Failure mode (must be meaningful)

For each finding, give the **failure mode**: the concrete sequence that turns the issue into a real bad outcome — **trigger → what the code does → the harm**. It must describe something that actually happens at runtime, not a restated worry.

- Be **concrete and specific to THIS code**: name the trigger (a user action, an input value, a timing/concurrency window, a second tab or request), trace what the code actually does step by step, and end at the observable harm (wrong data, a race, a crash, a leak, a user locked out). Reference bar for the level of detail: *"user updates a field → mutation returns task IDs → FE polls → user refreshes → FE returns empty pending IDs while the BE task is still IN_PROGRESS → user edits assignees and races the worker."*
- A vague restatement — "this could cause bugs", "may break", "is risky" — is **NOT** a failure mode; it just repeats the description. **Never write a hollow one to fill the field.**
- If you cannot construct a concrete runtime failure (the finding is a pure maintainability / readability / style concern), **omit it and say so**: `No distinct failure mode — <maintainability/readability> concern`.

## Flag findings that need a code-level check

Most findings you can confirm from what you've read — report those as settled facts. But when a finding **rests on something you could not confirm from the code you saw** — the behavior of a function outside the diff, what a caller actually passes, a runtime/ordering assumption, whether a guard exists elsewhere — mark it `Needs verification: yes` and say exactly what to check. If you fully confirmed the finding yourself, mark `Needs verification: no`. Only the `yes` findings get a verification pass; everything else is trusted as-is, so do not flag a finding you are already sure of.

## Output

Write findings to the `./tmp/review-changes/LENS_<name>.md` path named in your prompt:

```markdown
# Lens: <name>

## Findings

### [Issue Title]
- **Severity**: MUST FIX / SHOULD FIX / NIT
- **File**: [path:line]
- **Description**: [What's wrong]
- **Failure mode**: [Concrete trigger → behavior → harm, OR "No distinct failure mode — <maintainability/readability> concern". Never a vague restatement — see the rules above.]
- **Why it matters**: [Impact/risk — the magnitude, given the failure mode above]
- **Needs verification**: yes — [what to check, and where] / no
- **Suggested fix**: [Concrete suggestion; code snippet only if helpful]

## Notes
[Anything good worth calling out, or "no issues found in this lens"]
```

If you find no issues, write the file with an empty Findings section and say so explicitly. Then report back to the orchestrator: number of findings and the highest severity.
