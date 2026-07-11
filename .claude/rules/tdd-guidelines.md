---
description: 'TDD guidelines: red-green-refactor cycle, test-first approach, and quality assurance for AI agents'
---

# TDD Guidelines

Test-Driven Development: write tests before implementation using red-green-refactor cycle.

## Core Principles

1. **Red-Green-Refactor** - Write failing test (Red), make it pass (Green), improve code (Refactor)
2. **Test First** - Always write the test before behavior logic (structural scaffolding may come first — see Meaningful Red)
3. **One Test at a Time** - One test → MUST run it and see the result → make it pass → next test
4. **Meaningful Red** - A red run only counts when the test fails on a behavior assertion; structural failures (404, missing route/field/import) validate nothing
5. **Minimum Implementation** - Only code needed to make test pass
6. **Test Quality** - Follow 4 Pillars of Testing (Reliability, Validity, Sensitivity, Resilience)

---

## Red-Green-Refactor Cycle

### Red: Write Failing Test

1. Write ONE test describing desired behavior
2. Use descriptive test names
3. Follow Arrange-Act-Assert structure
4. Scaffold the structure the test touches (route, empty handler, field, empty function returning a default) so the only possible failure is behavioral — scaffolding contains no behavior logic
5. MUST run the test — expect a **meaningful failure**: the behavior assertion fails. A structural error (404 route not registered, missing field/column/export, import error) is NOT a valid red; fix the scaffolding and run again

**When no meaningful red is possible** — the minimal scaffolding needed to avoid a structural failure already IS the implementation (trivial pass-through, static field, simple wiring) — write just enough code to pass first and expect **green from the first run**. State explicitly that the test started green and why no meaningful red exists. Do NOT manufacture a useless red (asserting against a 404 or a missing field) just to follow the ritual.

### Green: Make Test Pass

1. Write minimum code to make test pass
2. Don't optimize yet - focus on correctness
3. Run test to verify it passes

### Refactor: Improve Code

1. Ensure all tests pass before refactoring
2. Improve quality (remove duplication, better naming, extract functions)
3. Run tests again to verify nothing broke

**Important:** Only refactor when all tests are passing.

### Repeat

Continue cycle for each test scenario until all implemented and passing.

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

- ❌ Write multiple tests before implementing
- ❌ Write behavior logic before the test exists (structural scaffolding is allowed and encouraged)
- ❌ Consider test passed when the test not actually run
- ❌ Treat a structural failure (404, missing route/field/import) as a valid red — it validates nothing

---

## TDD vs BDD — when to use which

- **BDD = outer loop.** User-facing feature behavior, expressed as scenarios with Given/When/Then. This is the default framing for feature development.
- **TDD = inner loop.** Internal logic, algorithms, and utilities driven test-first within a single BDD scenario step.

Both share the same discipline:

- **Test-run GATE** — write the test and run it before writing behavior logic (BDD is also test-first; the two never conflict).
- **One at a time** — one scenario (BDD) or one test (TDD), run it, see a meaningful result (real red, or expected green when no real red is possible), then move to the next.
