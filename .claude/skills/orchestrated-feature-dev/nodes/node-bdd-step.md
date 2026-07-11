# Node: BDD Scenario Step

Execute one BDD scenario (test-first) for a single observable behavior.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

> **You run inside a batch sub-agent.** Your prompt assigns you a batch of related steps. Do them one at a time (this node = one step). You cannot talk to the user — so wherever this node says "escalate to the user," it means **BUBBLE UP**: stop, write your progress, and return control to the orchestrator with the gate details. The orchestrator escalates and re-spawns you to resume. Never guess past a gate.

## Input

Work through the steps assigned in your prompt, one at a time, in `<ws>/PLAN_STEPS.md` order. For each, treat the first `pending` assigned step as your current target.

## Execution

### 1. Identify the Behavior

Find the first step with `Status: pending` in `<ws>/PLAN_STEPS.md`. This is your target behavior.

### 2. Write the Test

Use BDD-style Given/When/Then structure:

```typescript
describe('[Feature/Scenario name]', () => {
  it('should [expected outcome]', async () => {
    // Given
    // When
    // Then
  })

  // Use nested describe only to group multiple related tests:
  // describe("when [specific condition]", () => {
  //   it("should [outcome A]", ...);
  //   it("should [outcome B]", ...);
  // });
})
```

### 2b. One Test Per Step

**IMPORTANT:** Write exactly **one test** (one `it()` block) per BDD scenario step. Do NOT batch multiple behaviors into the same step. Each step = one observable behavior = one test = one implementation cycle.

### 2c. Scaffold Structure

Put in place whatever structure the test touches — register the route, add the field, create the empty handler returning a default — so the test run can only fail on the behavior assertion. Scaffolding contains **no behavior logic**.

**If no meaningful red is possible** (the minimal scaffolding to avoid a structural failure already IS the implementation — e.g., a trivial pass-through or a field that just renders), write just enough code to pass first and expect **green from the first run**. Record `green from start (no meaningful red possible)` in the Output.

### 2d. 🚫 GATE: Meaningful Test Possible? (escalate if not)

Before running, confirm a **meaningful** test can actually be written AND set up for this behavior. A meaningful test (per the 4 Pillars) has a **valid, sensitive assertion** — it would fail if the behavior were wrong — and its preconditions/fixtures/environment can be set up reliably.

This is NOT the same as "no meaningful red" (2c): there, a real, asserting test exists and simply passes from the first run. Here, you **cannot construct a meaningful test at all** — e.g., no way to assert the real outcome, output is non-deterministic and can't be made stable, or the behavior depends on an external system/environment you can't mock, seed, or stand up.

When you hit this, do NOT write a hollow test (one that asserts nothing real or passes regardless) just to satisfy the ritual, and do NOT silently skip it. Instead **BUBBLE UP** (stop and return control to the orchestrator, which escalates to the user):

- Report the behavior, what you tried, and exactly what blocks a meaningful assertion or test setup.
- The options the orchestrator will offer the user: **skip the test** for this behavior (still implement it), **defer** the behavior, or **provide a way to make it testable** (a fixture, seam, or mock).
- Do not proceed on this step until the orchestrator re-spawns you with the decision.

When re-spawned: if the decision is skip, implement the behavior (step 4) then record it as `test skipped (no meaningful test possible — user approved: [reason])` in the Output; if it was made testable, return to step 2 and write the test.

**Other bubble-up triggers (same protocol):** 2+ defensible implementation behaviors for the step, or an unexpected failure you cannot resolve with minimum code. Stop, write progress, return control.

### 3. 🚫 GATE: Run the Test

**Before running**, check `package.json` for the project's existing test command (e.g., `npm test`, `npm run test:unit`). Use that command instead of hardcoding `npx vitest run`. Pass the specific test file path to scope the run.

Run the test. You **MUST** see the result before writing ANY behavior logic.

- **If it fails on the behavior assertion** → real red, proceed to step 4
- **If it fails structurally** (404 route not registered, missing field, import error) → that red validates nothing; fix the scaffolding (step 2c) and run again
- **If it passes** → either the behavior is already covered, or this is the expected green-from-start case. Update `<ws>/PLAN_STEPS.md` accordingly. Skip to Output.

### 4. Implement

Write the **minimum code** to make the test pass. Nothing more.

### 5. Run the Test Again

Confirm it passes. Also run any related previous tests to check for regressions.

- **If all pass** → proceed to Output
- **If regression** → fix the regression, run tests again

### 6. Quick Refactor (Optional)

Only if there's an obvious improvement. Keep it small. Run tests again.

## Output

Update `<ws>/PLAN_STEPS.md`:
- Change the completed step's status to `done` (or `done (already covered)`, or `done (test skipped — no meaningful test possible, user approved)`)

Update `<ws>/IMPLEMENTATION_PROGRESS.md` with the step result:

```markdown
### Step [number]: [behavior]

**Status:** ✅ Done
**Test Result:** red → green | green from start (no meaningful red possible) | test skipped (no meaningful test possible — user approved: [reason]) | already covered

**Files Changed:**
- [file1]: [what changed]
- [file2]: [what changed]

**Regressions:** none | [list]
**Notes:** [anything worth mentioning]
```

**Log any decision.** If this step involved a choice between **2+ viable implementation approaches** and you committed to one — including an approved test-skip at the 2d gate (skip vs defer vs make-testable) — append an entry to `<ws>/DECISIONS.md` (create it if absent): the option chosen, the alternative(s), and a one-line why (note "user chose" when it came from an escalation). The summary phase reports these.
