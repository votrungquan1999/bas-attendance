# Node: Behavior-Risk Catalog

Catalog edge-case **behaviors** that could break, derived from the requirement change and the existing system — **implementation-blind**. Runs in Phase 3b, parallel with investigation.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## The one rule that defines this node

You are **implementation-blind**. Derive risks from **what the feature is supposed to do** (the requirement) and **how the system behaves today** (existing code) — never from the new implementation. There is no new implementation yet, and even once there is, you must not reason from it. A catalog derived from the implementation only rediscovers the edge cases the implementation already anticipated; that is the exact bias this node exists to avoid.

Two more boundaries:
- **Behavior-level, not code-level.** Do NOT catalog null/boundary/concurrency/error-path mechanics. Catalog observable behaviors: "under the new requirement, when situation X arises, what should the system do?"
- **Read existing code only to learn current behavior/invariants** — the contracts, states, and guarantees the change might disturb. Do not design the change.

## Input

- Read `<ws>/implementation-plan.md` — the requirement change and its intended behaviors.
- Read the **existing** code paths the requirement touches, only to learn today's behavior and invariants.

## Execution

Work outward from the requirement and the existing system:

1. **Requirement boundaries.** For each behavior the plan introduces, ask what happens at the edges of its inputs, states, and preconditions — expressed as behavior, not code. (e.g. "requirement says a user can archive a card — what happens when they archive a card already in review?")
2. **Existing-invariant collisions.** What does the system guarantee today that this change could quietly violate? (e.g. "today every in_progress card has a sessionId — does the new flow preserve that?")
3. **Interaction edges.** Where the new behavior meets an existing behavior, which combinations are unspecified or contradictory?
4. **State/lifecycle transitions.** For each new or changed state, which transitions into/out of it does the requirement leave unaddressed?

For **each** risk, decide: does the requirement **imply** the expected behavior, or is it **silent**?

- **Requirement-implied** → record the expected behavior. This becomes a Phase 5b adversarial check.
- **Requirement-silent** → the requirement does not say what should happen. This is a product decision (a 2+ defensible-behaviors situation) for the orchestrator to escalate to the user **before** implementation.

## Output

Write the catalog to `<ws>/BEHAVIOR_RISKS.md`. It is **frozen** once written — do not revise it in any later phase.

```markdown
# Behavior-Risk Catalog — [feature]

> Implementation-blind. Derived from requirement + existing system. FROZEN.

## R1 — [short behavior-risk title]
- **Situation:** [the edge-case situation, in behavior terms]
- **Origin:** requirement-boundary | existing-invariant | interaction-edge | state-transition
- **Requirement verdict:** implied | silent
- **Expected behavior:** [what should happen — if implied] | [n/a — requirement silent]
- **If silent — the open question:** [the product decision to escalate; else "n/a"]

## R2 — ...
```

Report back to the orchestrator: total risks catalogued, and how many are **requirement-silent** (these need user decisions before Phase 4).
