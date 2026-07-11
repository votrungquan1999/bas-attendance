---
name: bdd-design
description: Guides Behavior-Driven Development using behavior scenarios with a test-first approach. Use when implementing features with BDD, writing acceptance tests, defining user behavior scenarios, or when user says "use BDD", "behavior-driven", "write scenarios first", or "acceptance tests".
---

# BDD Design

Behavior-Driven Development: define behavior through scenarios first, then implement to make them pass.

## Core Principles

1. **Scenarios First** - Write behavior scenarios before any implementation
2. **One Scenario at a Time** - Write one scenario → run to see result → implement → verify → next
3. **Meaningful Red** - A red run only counts when a behavior assertion fails; structural failures (404, missing route/field) validate nothing — scaffold first, or expect green from the start when no real red is possible
4. **Client's Language First** - Identify the client/stakeholder first (business/end-user by default), then write each behavior in their language and value — never implementation mechanics (see [Write Behaviors in the Client's Language](#write-behaviors-in-the-clients-language))
5. **Living Documentation** - Scenarios serve as both tests and documentation
6. **Ubiquitous Language** - Use domain language that stakeholders understand

---

## Phase 1: Define Feature and Scenarios

### Step 1: Describe the Feature

Write a feature description that captures the business value:

- **Feature**: [Feature Name]
- **As a**: [role/persona]
- **I want**: [capability]
- **So that**: [business value]

### Step 2: Write Scenarios

Write scenarios describing behavior using three stages:

- **Scenario**: [Descriptive scenario name]
  - **Setup**: [initial context/preconditions]
  - **Action**: [what the user/system does]
  - **Assert**: [expected outcome]

**Guidelines for good scenarios:**
- Each scenario tests ONE specific behavior
- Scenario names should be descriptive and readable
- Use concrete examples, not abstract descriptions
- Cover happy path first, then edge cases and error cases

### Step 3: Review Scenarios Before Implementation

**MUST pause and verify scenarios are complete:**
- Happy path covered?
- Key edge cases identified?
- Error/failure scenarios included?
- Scenarios use domain language, not implementation language?
- Does every scenario read in the client's language (no code/internals)?

---

## Write Behaviors in the Client's Language

**Identify the client first.** Before listing any behavior, name the client/stakeholder of the feature. By DEFAULT this is a business or end-user stakeholder.

**Business/end-user language is the default.** Frame every behavior as an outcome that stakeholder would recognize and care about, in their words. Tie behaviors to value via "As a [stakeholder], I want [capability], So that [value]".

**No implementation mechanics in a behavior.** A behavior must NOT name code artifacts or internals: schemas, fields, tables, queries, error codes, function/method/class names, the linter, CI, HTTP status, etc. If it does, it is written at the wrong altitude — rewrite it as the outcome the stakeholder sees.

**Litmus test:** Read the behavior aloud to the stakeholder. Would they recognize it as something they asked for and care about? If it mentions code or internal mechanics, it FAILS — rewrite before proceeding.

**Escape hatch:** ONLY when the user explicitly states the client is a developer or an internal/consuming system (e.g. a library/API contract) may you phrase behaviors in developer terms. Otherwise, always trace to business/end-user value.

**Reframing examples** (client shown in parentheses):
- ❌ "Reading a card whose stored shape violates the schema throws ERR_SCHEMA_DRIFT and logs the drift"
  ✅ "A user is never shown a corrupted card — a damaged card is blocked and surfaced as an error instead of displayed" (client: end-user)
- ❌ "Migrate listTasks onto findManyZ and assert parsed shape and order"
  ✅ "A user sees their tasks listed in the expected order" (client: end-user)
- ❌ "Running the linter reports no violations on a clean repo"
  ✅ "Code that doesn't meet the team's quality bar is caught automatically before it can merge" (client: the team)
- ❌ "Add isTrending field to the Market model"
  ✅ "A trader sees trending markets at the top of the list" (client: trader)

---

## Phase 2: Implement Scenarios (Test-First)

**For EACH scenario, follow this loop. Do NOT batch scenarios or skip steps.**

**CRITICAL: ONE TEST AT A TIME**
Never batch behaviors or write multiple tests at once. Each step must be exactly one behavior, which translates to exactly one test, followed immediately by its implementation.

### Step 1: Write ONE Scenario Test

1. Write the test for ONE scenario
2. Use the Setup/Action/Assert (Given/When/Then) structure in your test:
   ```typescript
   describe("[Feature name]", () => {
     it("should [expected behavior]", async () => {
       // Setup
       const context = setupContext();

       // Action
       const result = performAction(context);

       // Assert
       expect(result).toEqual(expectedOutcome);
     });

     it("should [another behavior] when [condition]", async () => {
       // Setup / Action / Assert
     });

     // Use nested describe only to group tests under a shared condition:
     describe("when [specific condition]", () => {
       it("should [outcome A]", ...);
       it("should [outcome B]", ...);
     });
   });
   ```

**`describe` is for grouping related tests — not for labeling a single test.** Never wrap a single `it()` in its own `describe` just to add a prefix.

### 🚫 Step 2: GATE — Run the Test (Before Behavior Logic)

1. **Check `package.json` scripts** first to see if there's an existing command for running tests (e.g., `npm test`, `npm run test:unit`). Use the project's defined command instead of crafting your own.
2. **Scaffold the structure the test touches first** (register the route, add the field, create the empty handler returning a default) so the run can only fail on the behavior assertion. Scaffolding contains no behavior logic.
3. Run the new scenario test BEFORE writing any behavior logic
4. If it **fails on the behavior assertion** → real red, proceed to Step 3 (implement)
5. If it **fails structurally** (404 route not registered, missing field/column, import error) → that red validates nothing; fix the scaffolding and run again
6. If it **already passes** → behavior is already covered, skip Step 3, go back to Step 1

**When no meaningful red is possible** — the minimal scaffolding needed to avoid a structural failure already IS the implementation (e.g., a field that just renders, a trivial pass-through endpoint) — write just enough code to pass first and expect **green from the first run**. State this explicitly. Do NOT manufacture a useless red (asserting against a 404 or a missing field) just to follow the ritual.

**This gate is NON-NEGOTIABLE. Writing behavior logic before running the test = violation.**

### Step 3: Minimum Implementation

1. Write the **minimum** code needed to make this ONE scenario pass
2. Focus on correctness, not elegance

### 🚫 Step 4: GATE — Verify

1. Run the test again
2. If it **passes** → also run all previous scenario tests, then go back to Step 1
3. If it **fails** → go back to Step 3 and fix the implementation

**Do NOT write a second test before completing this gate.**

---

## Phase 3: Verify Complete Behavior

After all scenarios pass:

1. Run the full test suite
2. Review scenarios as living documentation — do they clearly describe the feature?
3. Run linting
4. Verify all acceptance criteria are covered by scenarios

---

## Scenario Patterns

### Happy Path
- **Scenario**: User successfully creates an account
  - **Setup**: User is on the registration page
  - **Action**: Fill in valid registration details and submit
  - **Assert**: Account is created, user is redirected to dashboard

### Edge Case
- **Scenario**: User tries to register with existing email
  - **Setup**: A user with email "test@example.com" already exists
  - **Action**: Try to register with email "test@example.com"
  - **Assert**: Error "Email already registered" shown, no new account created

### Error Handling
- **Scenario**: User submits form with missing required fields
  - **Setup**: User is on the registration page
  - **Action**: Submit the form without filling in the email
  - **Assert**: Validation error shown for email field, form is not submitted

---

## Best Practices

- ✅ Write scenarios in domain language, not code language
- ✅ One scenario = one behavior = one `it()` block
- ✅ Use `describe` to group related tests, not to label a single test
- ✅ Run the test after writing it, BEFORE writing implementation
- ✅ Keep scenarios independent — no test ordering dependencies
- ✅ Use descriptive `it()` names that read like sentences
- ❌ Don't wrap a single `it()` in its own `describe` just to add a label prefix
- ❌ Don't write implementation-specific scenarios ("When the database query returns...")
- ❌ Don't write multiple scenarios before implementing any
- ❌ Don't skip the test run — always run the test before implementing
- ❌ Don't write behavior logic before seeing the test result (structural scaffolding is allowed and encouraged)
- ❌ Don't treat a structural failure (404, missing route/field) as a valid red — only a failing behavior assertion validates anything

---

## BDD vs TDD: When to Use Which

| Aspect | BDD | TDD |
|--------|-----|-----|
| **Focus** | User behavior & acceptance criteria | Code units & implementation |
| **Language** | Domain/business language | Technical/code language |
| **Scope** | Feature-level, integration, E2E | Function-level, unit |
| **Best for** | User-facing features, API contracts | Algorithms, utilities, business logic |

**Use BDD when:** Implementing user stories, defining API behavior, writing acceptance tests.
**Use TDD when:** Implementing internal logic, algorithms, utilities, data transformations.
**Use both together:** BDD for outer loop (feature behavior), TDD for inner loop (implementation details).

## Related Skills

- `@tdd-design` - Use for inner-loop unit-level testing alongside BDD
- `@test-quality-reviewer` - Review BDD test quality using the 4 Pillars framework
- `@code-refactoring` - Refactor implementation code after scenarios pass
