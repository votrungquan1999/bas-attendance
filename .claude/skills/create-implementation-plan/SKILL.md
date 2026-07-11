---
name: create-implementation-plan
description: Creates a focused implementation plan with technical design decisions and behavior-based test scenarios before execution. Use when planning features, designing changes, creating technical specs, or when user says "create a plan", "plan this feature", "design the approach", or "implementation plan".
allowed-tools: Read, Grep, Glob, Bash, Write, Agent
---

# Create Implementation Plan

Structured approach to creating a focused implementation plan before execution. The plan captures **what matters most**: significant design decisions and the observable behaviors to test — nothing else.

## Purpose

Ensures significant changes are well-thought-out and reviewed before implementation begins. Prevents wasted effort from poor planning.

## When to Use This Skill

- Implementing a new feature or significant change
- Planning a refactor or architectural update
- Working on changes that span multiple files or components
- Need to communicate your approach to stakeholders

## Instructions

### Step 0: Establish the Task Workspace

**Before writing any notes or the plan document**, decide where artifacts go:

- **If a caller gave you a working directory** (e.g. the orchestrator passes `<ws>` = `./tmp/<identifier>/`), use it as-is — write the plan there and skip the rest of this step.
- **Otherwise**, ask the user for a **task identifier** — a ticket id (e.g. `JIRA-123`) or any short label. If they have none, **derive a short kebab-case slug** from the request and **confirm it**. Then use `<ws>` = `./tmp/<identifier>/` and create that directory.

Throughout this skill, `<ws>` refers to that working directory. Scoping artifacts under `./tmp/<identifier>/` lets multiple planning tasks coexist without overwriting each other.

**Before creating `<ws>` or writing anything, check whether it already holds artifacts from unrelated work** (a different ticket/slug, or a stray flat file). If it does, **STOP and ask the user** how to proceed — never overwrite another task's artifacts.

### Step 1: Research the Codebase

**Goal:** Understand the existing implementation before planning.

Read as many relevant files as possible to understand:
- Existing patterns and conventions in the codebase
- Related features or components that might be affected
- Architecture and structure of the area you'll be modifying
- Testing patterns and utilities already in place
- Types, interfaces, and data models

**Critical: Requirement Clarification First.** If anything is unclear or ambiguous, ask the user clarifying questions. Do not assume implementation details, architectural decisions, or requirements.

When researching external libraries or APIs, use `@context7` for documentation queries and `@web-search` for broader research.

**Mandatory Checkpoint:** Report how many files you read and ask the user whether to:
- Read more files
- Ask more questions
- Continue to planning

**CRITICAL: You MUST stop execution here and wait.** Do not proceed to Step 2 or start writing the plan until the user explicitly says "continue with implementation plan" or "continue". Answer any user questions during this pause.

### Step 2: Analyze Requirements

- Clarify the goal and success criteria
- Identify edge cases and constraints
- Determine scope boundaries (what's in/out of scope)
- List assumptions and unknowns
- Identify dependencies (external APIs, libraries, other features)

### Step 3: Design the Approach

Focus only on **significant** design decisions — things that are non-obvious, introduce new concepts, or require deliberate choices. Skip general implementation details that follow naturally from existing patterns.

Document:
- Key architectural decisions and why (e.g., new data models, significant new fields, API contract changes, strategy choices)
- Trade-offs considered for non-trivial decisions
- Breaking changes (API, config, behavior)
- Areas of uncertainty or risk

For complex designs, consider using the `@structured-brainstorming` workflow to explore alternatives.

**Do NOT list every file that will change or describe every function.** Only capture decisions that a reviewer needs to understand the approach.

### Step 4: Define Observable Behaviors & Test Cases

**Identify the client first.** Before listing any behavior, name the client/stakeholder of the feature. By DEFAULT this is a business or end-user stakeholder. Frame every behavior as an outcome that stakeholder would recognize and care about, in their words — business/end-user language is the default. ONLY when the user explicitly states the client is a developer or an internal/consuming system (e.g. a library/API contract) may you phrase behaviors in developer terms.

List the behaviors the system should exhibit, ordered by implementation priority. Each behavior becomes one BDD scenario step — a strictly isolated test-first cycle.

**CRITICAL: ONE TEST AT A TIME**
Never batch behaviors or write multiple tests at once. Each step must be exactly one behavior, which translates to exactly one test, followed immediately by its implementation.

Each behavior must be:
- **Observable** — something a user or system can verify externally
- **In the client's language** — describe the outcome the stakeholder sees, never implementation mechanics (schemas, fields, tables, queries, error codes, function/method/class names, the linter, CI, HTTP status, etc.)

**Litmus test:** Read the behavior aloud to the stakeholder. Would they recognize it as something they asked for and care about? If it mentions code or internal mechanics, it FAILS — rewrite before proceeding.

> ✅ `User sees trending markets at the top of the list`
> ✅ `Valid inputs are persisted to the standard settings`
> ✅ `Markets with score below threshold are excluded from trending`
> ✅ `A user is never shown a corrupted card — a damaged card is blocked and surfaced as an error instead of displayed` (client: end-user)
> ✅ `A user sees their tasks listed in the expected order` (client: end-user)
> ✅ `Code that doesn't meet the team's quality bar is caught automatically before it can merge` (client: the team)
> ❌ `Add isTrending field to Market model`
> ❌ `Add StandardSettings interface to types file`
> ❌ `Write SQL query for trending markets`
> ❌ `Reading a card whose stored shape violates the schema throws ERR_SCHEMA_DRIFT and logs the drift`
> ❌ `Migrate listTasks onto findManyZ and assert parsed shape and order`
> ❌ `Running the linter reports no violations on a clean repo`

For each behavior, plan the test-first cycle:
```markdown
### [Observable behavior]
- [ ] Write test
- [ ] Run test
- [ ] Implement (if needed)
- [ ] Run test (if implemented)
```

Group quality checkpoints after every 2-3 behaviors:
```markdown
### Quality Checkpoint
- [ ] Review test quality
- [ ] Review code for refactoring
```

### Step 5: Write the Plan Document

Write the plan to `<ws>/implementation-plan.md` (the task workspace from Step 0) using this format:

```markdown
# [Goal Description]

Brief description of the problem and what the change accomplishes.

## User Review Required

> [!IMPORTANT]
> [Critical decision or breaking change that needs approval]

## Technical Design

[Only significant decisions. e.g.:]
- **New `score` field on `Market`**: Stored as float, computed at read time from engagement stats. Not persisted — avoids write amplification.
- **Trending threshold**: Configured via env var `TRENDING_MIN_SCORE` (default: 0.7) rather than hardcoded, to allow tuning without deploy.

## Behaviors to Implement

### Step 1: [Observable behavior]
- [ ] Write test
- [ ] Run test
- [ ] Implement (if needed)
- [ ] Run test (if implemented)

### Quality Checkpoint (after every 2-3 steps)
- [ ] Review test quality
- [ ] Review code for refactoring
```

### Step 6: Request Review

**MUST pause for user review.** Present the implementation plan document (`<ws>/implementation-plan.md`) — the rich plan with Technical Design + Behaviors — and wait for approval before any implementation begins.

**NEVER present a steps file for review.** A derived steps file (e.g. `<ws>/PLAN_STEPS.md`) is workflow-state for the BDD scenario loop, not the artifact the user reviews. Write it only AFTER the plan is approved, and do not ask the user to review it.

---

## Best Practices

- ✅ Capture decisions that require deliberate thought or trade-offs
- ✅ Write behaviors as observable outcomes, not code tasks
- ✅ Highlight breaking changes and decisions needing user input
- ❌ Don't list every file that will be touched
- ❌ Don't describe implementation details that follow obviously from existing patterns
- ❌ Don't add a verification plan — test-first development verifies as you go
- ❌ Don't skip the research phase

## Related Skills

- `@structured-brainstorming` - Use for complex design decisions during Step 3
