---
description: 'Meta rules for Claude Code: rule application and code quality guidelines'
---

# Meta Rules

These rules MUST always be followed unless explicitly overridden.
For each task, Claude Code MUST double-check:

1. Which rules were applied.
2. Whether any relevant rules were missed.
3. If any rule conflicts exist, resolve them explicitly.

- ALWAYS check all applicable rules before making any changes.
- ALWAYS explain which rules were applied in the output.
- MUST keep file size small and reasonable for AI context management.
- NEVER require running/building the server to validate output.
- NEVER run `npm run build` or `npm run dev` after completing tasks, the user will handle this.
- ALWAYS use `npm install` to install packages. NEVER add packages directly to `package.json`.
- AI MAY replace entire components or structures if it improves clarity/compliance.
- For complex changes, AI MUST ask:
  - "Am I correct?"
  - "Which rules apply here?"
  - "Did I miss any relevant rules?"
- Apply the multi-shot method of prompt engineering: After editing around 5 files, should ask the user to review if the current direction is correct, then continue with the next 5 files. This iterative feedback approach helps ensure the AI stays aligned with user expectations and corrects course early if needed.

## Scope Management

- NEVER implement unused/future features not explicitly requested by the user.
- MUST ask 1-2 clarifying questions before implementing (or more if user explanation >100 characters).
- Focus on what exists in the system currently, not what could be extended unless explicitly requested by the user.
- When user provides long explanations (>100 characters), ask additional clarifying questions to verify scope and approach before proceeding.
- Only extract reusable components/functions when the same logic is repeated at least **3 times**. Two occurrences do not justify extraction — wait for the third to ensure a good abstraction emerges.

## Error Handling

- NEVER use try-catch blocks defensively around every operation.
- ONLY place try-catch blocks at intentional error boundaries where you want to catch all errors from lower-level code.

## Code Comments

- Write comments to be **skimmed**: short, scannable, and useful at a glance.
- Explain **WHY**, not WHAT — the code already shows what it does.
- Prefer one line, one idea. Lead with the key point; keep detail short and after it.
- NEVER write comments that restate the code or narrate obvious steps.
- For a complicated function, prefer short comments on each step over one long block at the top — they let a dev follow the logic as they read it.
- Match the surrounding code's comment density and style.

## Edit Verification and Retry Logic

- After EVERY file edit operation, MUST verify that the edit was successful.
- If an edit fails:
  1. Read the file again to understand the current state.
  2. Retry the edit with corrected parameters based on the actual file content.
  3. Repeat the verification process after each retry.
  4. **If the edit fails twice consecutively**, split it into multiple smaller, independent edits targeting smaller sections of the file. Large edits are prone to timeouts — smaller, focused edits are more reliable.
  5. Continue this cycle until the edit succeeds or determine that manual intervention is required.
- NEVER assume an edit succeeded without checking the tool's response.
- If multiple consecutive retries fail (> 3 attempts), explain the issue to the user and request guidance.

## Test-First Enforcement

- The test-run GATE applies to BOTH modes: BDD scenarios (outer, behavior-level loop) and TDD (inner, unit/algorithm-level loop). BDD is also test-first — test-first never conflicts with BDD.
- NEVER write behavior logic before running the test. Structural scaffolding (route, empty handler, field, empty function returning a default) MUST be in place before the run so the test can only fail behaviorally.
- A red run only counts when a behavior assertion fails. Structural failures (404 route not registered, missing field/column/import) are NOT valid reds — they validate nothing. Never manufacture one to follow ritual.
- If no meaningful red is possible (the minimal scaffolding to avoid structural failure already IS the implementation), write just enough code to pass first and expect green from the first run — state this explicitly.
- ONE at a time: one scenario (BDD) or one test (TDD). Run it. See the result. Then decide what comes next.
- The test run is a GATE — skipping it is a rule violation in either mode.

## Planning Mode

- When the user requests changes to an already-generated plan `.md`, modify that plan file in place to reflect the requested changes — keep one source-of-truth plan file rather than creating a new file per revision.
- Revise only the sections the request affects; preserve the rest of the plan's structure.
