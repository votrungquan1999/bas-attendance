---
name: feature-development-workflow
description: Guides feature implementation using incremental development with planning, behavior-driven approach, and progress tracking. Use when implementing features, building functionality, starting new development tasks, or when user says "implement feature", "build this", or "develop this functionality".
---

# Feature Development Workflow

This Skill provides a structured approach for implementing features and tasks incrementally with behavior-driven development and progress tracking.

## Core Principles

1. **Understand Context First** - Read as many relevant files as possible to understand the codebase before planning
2. **Plan High-Level** - Define steps and acceptance criteria, not implementation details
3. **Test During Implementation** - Define test scenarios when implementing each step, not during planning
4. **Track Progress** - Write progress to a file for context switching and interruptions
5. **Incremental Progress** - Complete one step fully before moving to the next
6. **Test Each Step** - Prove each step works before building on top of it
7. **One Test at a Time** - Write exactly one test, run it, see a meaningful result, make it pass, then move to the next test. This ensures incremental validation and prevents skipping test coverage.
8. **Meaningful Red** - A red run only counts when a behavior assertion fails. Structural failures (404 route not registered, missing field/import) validate nothing — scaffold structure before running, or expect green from the start when no real red is possible.

---

## Phase 1: Planning

**Goal:** Break down work into implementable steps with clear acceptance criteria.

**Step 0: Establish the Task Workspace**

**Before writing any notes, the plan, or the progress file**, establish where artifacts go:

- **If a caller gave you a working directory** (e.g. the orchestrator passes `<ws>` = `./tmp/<identifier>/`), use it.
- **Otherwise**, ask the user for a **task identifier** — a ticket id (e.g. `JIRA-123`) or any short label. If they have none, **derive a short kebab-case slug** from the request and **confirm it**. Then use `<ws>` = `./tmp/<identifier>/` and create that directory.

Throughout this skill, `<ws>` refers to that working directory. Scoping artifacts under `./tmp/<identifier>/` lets multiple tasks run in parallel without their plan/progress files colliding.

**Before creating `<ws>` or writing anything, check whether it already holds artifacts from unrelated work.** If it does, **STOP and ask the user** how to proceed — never overwrite another task's artifacts.

**Step 1: Understand the Context**

Before creating your plan, read as many relevant files as possible to understand:

- Existing patterns and conventions in the codebase
- Related features or components that might be affected
- Architecture and structure of the area you'll be modifying
- Testing patterns and utilities already in place
- Types, interfaces, and data models

This context-gathering phase helps you create a more accurate plan and avoid surprises during implementation.

**Critical: Requirement Clarification First.** If anything is unclear or ambiguous, ask the user clarifying questions. Do not assume implementation details, architectural decisions, or requirements. You must proactively ask requirement-focused questions instead of assuming details.

**Mandatory Checkpoint Before Step 2:** Report how many files you read and ask the user whether to read more files, ask more questions, or continue. Do not create a plan until the user explicitly says "continue"; otherwise, follow their instructions and ask again.

**Step 2: Create the Plan**

Create plan based on the gathered information. MUST pause for user review and wait for user to say "implement it" before starting implementation phase.

**What to include:**

- List of implementation steps in logical order
- Acceptance criteria for each step (what "done" looks like)
- Test type for each step (unit, integration, e2e, etc.) - ONLY the test type, not test cases yet
- Dependencies between steps
- Any known blockers or risks

**What NOT to include:**

- Specific test scenarios or test code
- Detailed implementation approaches
- Exact function signatures or component structure
- Database schema details

**Example Plan:**

```markdown
## Task: [Task name]

### Step 1: [High-level description]

**AC:** [What must be true when this step is done]

**Test Type:** unit

### Step 2: [High-level description]

**AC:** [What must be true when this step is done]

**Test Type:** integration
```

**Create Progress File:**
Create the progress file at `<ws>/IMPLEMENTATION_PROGRESS.md` (the task workspace from Step 0) to track completed steps. Add steps ONLY as you work on them, not in advance.

```markdown
# Implementation Progress: [Task Name]

### Step 1: [Description]

**Status:** ✅ Done

**E2E Tests Written (2 tests, all passing ✅):**

1. ✅ Popover open/close behavior
2. ✅ Form inputs render correctly

**Notes:** Created form components, added client-side validation
```

---

## Phase 2: Implement Each Step

**For each step in your plan:**

1. **Add step to progress file** - When starting a new step, add it with 🔄 In Progress status
2. **Define test scenarios** - NOW figure out what tests are needed for THIS step (you can define empty test scenarios first)

**Then, for EACH test scenario, follow this iterative process:**

3. **Write ONE test** - Write exactly 1 test at a time (you can start with an empty test that just has a description). **CRITICAL: NEVER write multiple tests at once.**
4. **Scaffold structure** - Put in place whatever structure the test touches (route, empty handler, field, empty function returning a default) so the run can only fail on the behavior assertion. Scaffolding contains no behavior logic.
5. **Run the test** - **Check `package.json` scripts** first for an existing test command (e.g., `npm test`, `npm run test:unit`). Use the project's defined command. Expect a **meaningful failure** — the behavior assertion fails. A structural error (404, missing field, import error) is NOT a valid red; fix the scaffolding and run again. If no meaningful red is possible (the scaffolding IS the implementation), write just enough code to pass first and expect green from the first run — note this explicitly.
6. **Implement code** - Write the minimum code needed to make this ONE test pass
7. **Run the test again** - Verify the test now passes
8. **Repeat** - If more test scenarios remain, go back to step 3 for the next test. Continue until all test scenarios are written and passing.

**After all tests are passing:**

9. **Run linting** - Check for code quality issues and fix any problems
10. **Verify** - All tests pass, acceptance criteria met
11. **Mark step as complete** - Update progress file with ✅ Done, test list, and notes
12. **Move to next step** - Only after current step is complete

### When Writing Tests

**IMPORTANT:** Before writing any tests, locate the "4 Pillars of Testing" document in the project (usually in `.cursor/rules/`, `docs/`, or `repo_knowledge/`). Use it to guide your test writing.

**If you cannot find the 4 Pillars document:** STOP and ask the user where it is located.

Follow the guidelines in the 4 Pillars document when defining test scenarios and writing tests.

**Key BDD Principle:** Always write ONE test at a time, run it, see a meaningful result (real red on a behavior assertion, or expected green when no real red is possible), make/keep it passing, then move to the next test. This ensures you're building incrementally and each test is actually validating behavior.

---

## Progress Tracking Format

```markdown
# Implementation Progress: [Task Name]

### Step 1: [Description]

**Status:** ✅ Done

**Tests Written (2 tests, all passing ✅):**

1. ✅ Test description
2. ✅ Test description

**Notes:** Brief summary of what was accomplished

### Step 2: [Description]

**Status:** 🔄 In Progress

**Tests Written (1 of 3 tests passing ✅):**

1. ✅ Test passing
2. ⏳ Test not written yet
3. ⏳ Test failing

**Notes:** Current work in progress
```

**Status indicators:**

- ✅ Done - Step complete, tests passing, AC met
- 🔄 In Progress - Currently working on this step

**Test indicators:**

- ✅ Test passing
- ⏳ Test not written yet or failing

**Update frequency:**

- Add step to progress file when you start working on it (🔄 In Progress)
- Update tests list as you write them (⏳ → ✅)
- Mark step complete when done (🔄 In Progress → ✅ Done)
- Add notes about what was accomplished or issues encountered

**Important:** Don't pre-create steps in the progress file. The plan file already has all steps defined. Only add a step to progress when you actually start working on it.

### What to Avoid During Implementation

- ❌ Skipping tests for any step
- ❌ Moving to next step with failing tests
- ❌ Not updating progress file
- ❌ Writing tests without consulting project testing guidelines
- ❌ Pre-creating steps in progress file (only add when working on them)

### Quality Checkpoints

**Every 2-3 completed steps**, pause to review quality:
- Use `@test-quality-reviewer` to check recent test quality against the 4 Pillars
- Use `@code-refactoring` to identify cleanup opportunities in recent implementation
- Fix any issues before continuing to the next step

## Related Skills

- `@bdd-design` - Core BDD scenario methodology used during implementation
- `@tdd-design` - Inner-loop helper for unit/algorithm-level tests within a scenario step
- `@test-quality-reviewer` - Review test quality during quality checkpoints
- `@code-refactoring` - Apply refactoring patterns during quality checkpoints
- `@create-implementation-plan` - Use for more detailed planning with design decisions
- `@orchestrated-feature-dev` - Premium version with automated quality gates and sub-agent phases
