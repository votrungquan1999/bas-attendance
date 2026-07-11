# Node: Plan

Create a focused implementation plan using research output as context.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## Input

Read the `<ws>/RESEARCH_OUTPUT.md` file for context about the codebase.

## Execution

1. **Read the research output** to understand patterns, affected areas, and existing code.

2. **Use `@create-implementation-plan`** to create the plan, telling it to write the plan to `<ws>/implementation-plan.md`. When the skill asks you to research, point it to the research output file instead of re-reading the codebase — the research is already done. The review it performs is on `<ws>/implementation-plan.md` (the rich plan with Technical Design + Behaviors) — never on the steps file.

3. **Ensure the plan has the two key sections:**
   - **Technical Design**: Only significant decisions (new fields, API changes, strategy choices). Skip anything obvious. **For each significant decision where 2+ viable options existed and you picked one, append an entry to `<ws>/DECISIONS.md`** (create it if absent) with the chosen option, the alternative(s) rejected, and a one-line rationale — the summary phase reports these.
   - **Behaviors to Implement**: First name the client/stakeholder (business/end-user by default); write each behavior in their language and value, and reject implementation mechanics (schemas, fields, queries, error codes, function/class names, the linter, CI, HTTP status). **Litmus test:** if a stakeholder reading the behavior aloud wouldn't recognize it as something they asked for — or it mentions code/internals — it FAILS; rewrite it.
     - ✅ `A trader sees trending markets at the top of the list` (client: trader)
     - ✅ `A user is never shown a corrupted card — a damaged card is blocked and surfaced as an error instead of displayed` (client: end-user)
     - ✅ `A user sees their tasks listed in the expected order` (client: end-user)
     - ✅ `Code that doesn't meet the team's quality bar is caught automatically before it can merge` (client: the team)
     - ❌ `Add isTrending field to the Market model`
     - ❌ `Reading a card whose stored shape violates the schema throws ERR_SCHEMA_DRIFT and logs the drift`
     - ❌ `Migrate listTasks onto findManyZ and assert parsed shape and order`
     - ❌ `Running the linter reports no violations on a clean repo`

4. **Flag testability up front.** For each behavior, sanity-check that a *meaningful* test could plausibly be written and set up for it (a valid, sensitive assertion + reachable fixtures/environment). If a behavior looks like it has **no meaningful way to be tested** — non-deterministic output, an external system that can't be mocked/seeded, no available harness — do NOT silently plan around it. Mark the step `Testability: uncertain (reason)` so the BDD loop escalates to the user at implementation time instead of writing a hollow test. Do not invent test cases now (test scenarios are designed per-step during implementation) — only flag the risk.

5. **Write the step list** to the workflow state file for the BDD scenario loop to consume.

## Output

After the plan is approved, write the step list to `<ws>/PLAN_STEPS.md`. This file is internal loop state derived from the approved plan — the BDD scenario loop consumes it. It is NOT presented to the user for review; the user reviews `<ws>/implementation-plan.md`.

```markdown
# Planned Steps

## Step 1: [Observable behavior]
- Status: pending
- Affected files: [file1, file2, ...]
- Dependencies: none | [step numbers this depends on]
- Testability: standard | uncertain (reason — escalate to user before writing the test)

## Step 2: [Observable behavior]
- Status: pending
- Affected files: [file1, file3, ...]
- Dependencies: none | Step 1
- Testability: standard | uncertain (reason — escalate to user before writing the test)

## Step 3: [Observable behavior]
- Status: pending
- Affected files: [file2, file4, ...]
- Dependencies: none | Step 1, Step 2

## Quality Checkpoint (after steps 1-3)
- Status: pending

## Step 4: [Observable behavior]
- Status: pending
- Affected files: [file5, ...]
- Dependencies: none | Step 2

...
```

Each step MUST include:
- **Affected files** — every file that will be created, modified, or read during implementation
- **Dependencies** — which other steps must complete first (or "none")
- **Testability** — `standard`, or `uncertain (reason)` when no meaningful test is foreseeable (signals the BDD loop to escalate to the user)

The implementation plan itself is written to `<ws>/implementation-plan.md` per the `@create-implementation-plan` skill convention.
