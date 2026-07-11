---
name: root-cause-analysis
description: Structured debugging by isolating root cause using falsifiable hypotheses and binary search. Strictly forbids fixing — output is a proof of bug. Use when debugging, investigating failures, or when user says "find the bug", "root cause", "why is this failing", or "debug this".
allowed-tools: Read, Grep, Glob, Bash, Write
context: fork
---

# Root Cause Analysis

A strictly investigative, scientific approach to identifying the root cause of a defect. Enforces disciplined debugging (Cause Elimination and Divide & Conquer) to prevent guesswork.

## Purpose

Systematically prove **why** something is broken down to the exact line of code, unhandled edge case, or missing configuration, **without attempting to fix it**.

## When to Use

- When a bug, error, or unexpected behavior is reported
- Before starting any bugfix to ensure you fix the actual root cause and not just the symptom
- When an existing test fails for unknown reasons

**CRITICAL RULE:** Do NOT implement fixes while using this skill. Your output is a "Proof of Bug", which is then handed off to execution skills like `@create-implementation-plan` or `@tdd-design`.

---

## Instructions

### Step 1: Reproduce & Observe

**Goal:** Establish facts without making assumptions or editing code.

1. Identify the exact steps, state, or input that causes the system to diverge from the expected behavior.
2. Gather the full stack trace, error logs, and system state details.
3. Read the relevant source code files surrounding the issue.
4. **Confirm the bug exists** (if applicable) using an existing test or a manual check.

### Step 2: Generate Hypotheses (Rubber Ducking)

**Goal:** Brainstorm potential causes logically before touching any code.

1. Think through the system flow out loud (Rubber Duck Debugging).
2. Formulate at least **3 distinct, falsifiable hypotheses** for why the failure occurs.
   - *Example:* "The database returns null because the query joins on the wrong ID."
   - *Example:* "The frontend crashes because `data.items` is undefined when the API responds with a 404."
3. Rank your hypotheses based on how easily and quickly they can be disproven.

### Step 3: Isolate & Falsify (Divide & Conquer)

**Goal:** Eliminate false hypotheses systematically.

1. Test your top hypothesis first.
2. Use **Divide and Conquer (Binary Search)**: Find the midpoint of the execution path and verify the state. Is the variable correct at step 5 of 10? If yes, the bug is in steps 6-10.
3. Add temporary debug logs (`console.log`, `print`, etc.) or run quick, isolated checks to gather data.
4. If the data disproves your hypothesis, discard it immediately and move to the next. Do not chase dead ends.

### Step 4: Pinpoint Root Cause (Proof of Bug)

**Goal:** Provide definitive proof of the defect.

Once you have isolated the bug, formulate a "Proof of Bug". Trace the issue down to the precise location.
Your proof must explain exactly:
- What the expected state was.
- What the actual state is.
- The exact line(s) of code, missing config, or assumption that caused the divergence.

### Step 5: Hand-off Summary

**Goal:** Prepare a clean state for the fixing phase.

1. Revert any temporary debug logs or experimental code added during Step 3.
2. Prepare a summary containing:
   - The precise location of the bug and the proven root cause.
   - Any constraints or edge cases discovered.
   - Context required to fix the issue.
3. Present the summary to the user and recommend invoking a development skill (like `@tdd-design` or `@create-implementation-plan`) to implement the fix.

---

## Best Practices

- Formulate hypotheses *before* adding logs or reading deep into unrelated code
- Use a binary search approach to split the problem space in half recursively
- Always provide a "Proof of Bug" that explains *why* the failure happens
- Do NOT fix the bug
- Do NOT guess or assume a component works correctly without verifying the facts
- Do NOT stop at the symptom; dig until you find the exact logic failure

## Output

Write your proof-of-bug summary to `./tmp/<identifier>/root-cause-analysis.md` — where `<identifier>` is the caller-provided workspace, or a short ticket-id/slug you derive for this task (create the folder if needed). **If it already holds artifacts from unrelated work, STOP and ask the user rather than overwriting.** Do this before finishing, so the caller and user can review the full findings.

## Related Skills

- `@create-implementation-plan` — Use after root cause analysis to plan a complex fix
- `@tdd-design` — Use to implement the fix starting with a failing test case
