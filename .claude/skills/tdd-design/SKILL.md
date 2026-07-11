---
name: tdd-design
description: Inner-loop helper for unit/algorithm-level test-driven development using the red-green-refactor cycle. Invoked WITHIN a single BDD scenario step to drive internal logic, utilities, or algorithms test-first — not the feature workflow's default loop (use @bdd-design for the outer, behavior-level loop). Use when writing unit tests before code, refactoring a unit with a test safety net, reproducing a bug at the unit level, or when user says "use TDD", "test-driven", "write a unit test first", or "red-green-refactor".
---

# TDD Design

Test-Driven Development: write tests before implementation, one test at a time.

## Core Principles

1. **Test First** - Always write and run the test before behavior logic (structural scaffolding comes first so the run can fail meaningfully)
2. **One Test at a Time** - Write one test → run it → implement → run again → next test
3. **Meaningful Red** - A red run only counts when a behavior assertion fails; structural failures (missing export, import error, undefined function) validate nothing
4. **Minimum Implementation** - Only write code needed to make the current test pass
5. **Test Quality** - Follow 4 Pillars of Testing (Reliability, Validity, Sensitivity, Resilience)

---

## Test-First Loop

**Follow this loop for EVERY test case. Do NOT batch tests or skip steps.**

### Step 1: Write ONE Test

1. Write exactly ONE test describing desired behavior
2. Use descriptive test names
3. Follow Arrange-Act-Assert structure
4. Scaffold the structure the test touches (empty function/class returning a default, exported stub) so the run can only fail on the behavior assertion — scaffolding contains no behavior logic

### 🚫 Step 2: GATE — Run the Test (Before Behavior Logic)

1. **Check `package.json` scripts** first for an existing test command (e.g., `npm test`, `npm run test:unit`). Use the project's defined command instead of crafting your own.
2. Run the new test BEFORE writing any behavior logic
3. If it **fails on the behavior assertion** → real red, proceed to Step 3 (implement)
4. If it **fails structurally** (import error, undefined function, missing export) → that red validates nothing; fix the scaffolding and run again
5. If it **already passes** → behavior is already covered, skip Step 3, go back to Step 1

**When no meaningful red is possible** — the minimal scaffolding needed to avoid a structural failure already IS the implementation (trivial pass-through, static value) — write just enough code to pass first and expect **green from the first run**. State this explicitly. Do NOT manufacture a useless red just to follow the ritual.

**This gate is NON-NEGOTIABLE. Writing behavior logic before running the test = violation.**

### Step 3: Minimum Implementation

1. Write the **minimum** code needed to make this test pass
2. Focus on correctness, not elegance or optimization

### 🚫 Step 4: GATE — Verify

1. Run the test again (using the project's test command from `package.json`)
2. If it **passes** → go back to Step 1 for the next test
3. If it **fails** → go back to Step 3 and fix the implementation

**Do NOT write a second test before completing this gate.**

---

## Test Quality Checklist

**4 Pillars:**

- **Reliability** - Consistent results, no flaky tests, mock external dependencies
- **Validity** - Verify intended behavior, specific assertions, all execute
- **Sensitivity** - Detect defects, specific assertions, test edge cases
- **Resilience** - Survive refactoring, test through public interfaces

**Code Quality:**

- ✅ All tests pass
- ✅ Linting passes
- ✅ Follows conventions

---

## TDD Rules

**Never:**

- ❌ Write behavior logic before running the test (even "obvious" code) — scaffolding is the only exception
- ❌ Treat a structural failure (import error, undefined function, missing export) as a valid red
- ❌ Write a second test before the current cycle completes
- ❌ Skip a test run because you "know" the result
- ❌ Batch multiple tests then implement them all at once

## Related Skills

- `@bdd-design` - Use BDD for behavior-level/acceptance testing alongside TDD for unit-level testing
- `@test-quality-reviewer` - Review test quality using the 4 Pillars framework after writing tests
- `@code-refactoring` - Apply refactoring patterns to improve code quality
