---
name: orchestrated-feature-dev
description: Orchestrated multi-phase feature development — sub-agent phases (research, plan, investigation, implementation-blind behavior-risk catalog, batched BDD, conformance + adversarial verification) with quality-gate and human-approval loops. Use for large or high-stakes features where the full rigor is wanted: explicit planning, test-first BDD, and adversarial verification of the un-specified space. Trigger on "orchestrated development", "structured/deep feature build", "full development pipeline", or when asked to build a complex feature end-to-end with tests and review gates. Do NOT use for quick edits or single-step changes — the gated pipeline is overkill there.
---

# Orchestrated Feature Development

The main session is an **orchestrator**: it spawns a sub-agent for every working phase (it does none of the work itself), passes data between phases through state files in a per-task workspace, and routes based on what each sub-agent returns. Each node file under `nodes/` holds the *how* for one phase; this file holds only *what to spawn, what to pass, and how to route*.

Pipeline: research → plan → (investigation ∥ behavior-risk catalog) → BDD-batch ↔ quality-gate → (conformance ∥ adversarial verification) → summary.

## Orchestrator Rules

- **Delegate everything.** Never research, plan, investigate, catalog, implement, or verify in the main session — spawn the node sub-agent. Delegation (not model choice) is what keeps the orchestrator a lean router.
- **Batch to the cap.** For investigation, BDD, and verification, put **as many related steps as possible into one sub-agent, capped at 4** (group by shared files/module) — one agent amortizes the shared-context read across its steps, but beyond ~4 its context congests and quality drops. Spawn a phase's batches in a single message so they run in parallel.
- **Route on returns.** Read state files to make decisions and relay sub-agent outputs to the user. Do not re-analyze findings in your own words.
- **Freeze `BEHAVIOR_RISKS.md`** once Phase 3b writes it — the adversarial phase checks against it; never edit it to match what was built.
- **Log decisions.** Whenever any phase or the orchestrator faces **2+ viable options and picks one** (including choices the user resolved), append to `<ws>/DECISIONS.md`: chosen option, alternative(s), one-line why. Skip forced moves.

**Spawn pattern** — keep the prompt minimal; the node carries the instructions:

```
Agent(
  description: "[phase] [assignment]",
  model: [see lever],
  prompt: "Read [skill dir]/nodes/node-X.md and execute it. Workspace <ws> (./tmp/<identifier>/).
    [Assignment: which steps/risks, which state files to focus on.]
    Report back: [what the orchestrator needs to route]."
)
```

**Model lever** (per-call `model`: `"haiku"|"sonnet"|"opus"`; `"sonnet"` = current Sonnet 5). `CLAUDE_CODE_SUBAGENT_MODEL` overrides all.
- Orchestrator, research, plan, quality-gate, **behavior-risk catalog** → default (Opus) — full/adversarial judgment.
- Investigation, BDD, both verification passes → `"sonnet"` (Sonnet 5 is strong enough; keeps the main session lean).
- Summary → `"haiku"`.

## Task Workspace & State Files

Every run is scoped to a **task identifier** (a ticket id, or a confirmed kebab-case slug). All state lives in `<ws>` = `./tmp/<identifier>/`, so parallel tasks never collide. Establish it in Phase 0 and pass its path into every sub-agent. `./tmp/` is gitignored; delete the folder when done.

- `RESEARCH_OUTPUT.md` — research findings (+ `RESEARCH_FOLLOWUP_[id].md`, folded back in)
- `implementation-plan.md` — the plan the user reviews (Technical Design + Behaviors)
- `PLAN_STEPS.md` — step list with files/deps; workflow state, **not** for user review
- `INVESTIGATION_STEP_[N].md` — per-step investigation context
- `BEHAVIOR_RISKS.md` — implementation-blind behavior-risk catalog (Phase 3b); **frozen** after
- `IMPLEMENTATION_PROGRESS.md` — per-step results + red/green audit trail
- `VALIDATION_STEP_[N].md` — conformance results (5a); `ADVERSARIAL_REVALIDATION.md` — adversarial findings (5b)
- `DECISIONS.md` — running decision log

---

## Phase 0: Establish Workspace

Ask for a task identifier (or derive a kebab-case slug from the request and confirm it). Create `./tmp/<identifier>/`. **Gate:** do not proceed until it exists. **Before creating it, check whether `./tmp/<identifier>/` already holds artifacts from unrelated work — if so, STOP and ask the user** rather than overwriting another task's run.

## Phase 1: Research (convergence loop)

Spawn `node-research.md` as the INITIAL agent → writes `RESEARCH_OUTPUT.md`. While its "Follow-up Investigations Needed" is non-empty, spawn one follow-up agent per item (parallel), fold each `RESEARCH_FOLLOWUP_[id].md` back into `RESEARCH_OUTPUT.md`, and rebuild the list from new threads. Stop when empty or after **3 rounds**. Then present findings + only the genuine Open Questions.

**Gate:** ask "continue to planning, or investigate more?" and wait for explicit continue.

## Phase 2: Plan

Spawn `node-plan.md` (reads `RESEARCH_OUTPUT.md`, uses `@create-implementation-plan`) → writes `implementation-plan.md` + `PLAN_STEPS.md`. Present `implementation-plan.md` (never `PLAN_STEPS.md`) for review.

**Gate:** do not proceed until the user approves the plan.

## Phase 3: Investigation (batched parallel)

Spawn `node-investigation.md`, one sub-agent per batch (batch to the cap), each assigned its steps → writes `INVESTIGATION_STEP_[N].md` per step. On return, **fix the plan yourself** (`PLAN_STEPS.md` + `implementation-plan.md`): drop already-done steps, fix wrong paths/types, reorder for deps, add gaps, resolve conflicts. Present problems (grouped) + fixes + updated plan.

**Gate:** wait for approval of the updated plan.

## Phase 3b: Behavior-Risk Catalog (implementation-blind, parallel with Phase 3)

Spawn `node-behavior-risk.md` (may go in the same message as the investigation batches). It catalogs edge-case **behaviors** from the requirement + existing system only — **never** the new implementation — into `BEHAVIOR_RISKS.md`. On return:

1. **Escalate requirement-silent entries now** — each is a 2+ defensible-behaviors product decision, cheaper to resolve before implementation. Fold each resolution into `implementation-plan.md` (+ a `PLAN_STEPS.md` step if it adds behavior); log to `DECISIONS.md`.
2. **Freeze the catalog** — requirement-implied entries become the Phase 5b checks; `BEHAVIOR_RISKS.md` is now immutable.

**Gate:** if there were silent entries, wait for the user's decisions.

## Phase 4: Implementation Loop

Batched BDD sub-agents alternate with quality gates.

**4a. BDD batch** — spawn `node-bdd-step.md` per batch (batch to the cap; same grouping as investigation). It runs its steps one-test-at-a-time with meaningful-red discipline and **bubbles up** on any gate. Route on its return:
- **Done, no gate** → quality gate (4b), then next batch.
- **Stopped at a gate** (untestable behavior / 2+ defensible behaviors / unresolved failure) → escalate to the user, log to `DECISIONS.md`, then spawn a **new** sub-agent to resume that batch with the decision baked in.

Verify discipline via the red/green trail in `IMPLEMENTATION_PROGRESS.md`, not the prose summary.

**4b. Quality gate** — every **2-3 completed steps**, spawn `node-quality-gate.md`. `pass` → next batch; `needs-fixes` → spawn a fix sub-agent, re-check (**max 2** re-checks per checkpoint).

**Terminate** when all planned behaviors are done, the user says stop, or step count exceeds 20.

## Phase 5: Verification (batched parallel)

Two independent axes, spawned together so all run in parallel:

**5a. Conformance Validation** — "did each step match the plan?" Spawn `node-validation.md` per step-batch (to the cap) → `VALIDATION_STEP_[N].md`.

**5b. Adversarial Revalidation** — "does the code survive the frozen catalog?" Spawn `node-adversarial-revalidation.md` per risk-group (related risks together) → `ADVERSARIAL_REVALIDATION.md`.

On return:
- **Conformance (5a):** invalid steps → one fix sub-agent for all of them, then re-validate only those.
- **Adversarial (5b): report + triage.** Present each break/silent-misbehavior with severity; the user decides **new step** (→ Phase 4) or **accepted/out-of-scope**. No auto-loop; log each to `DECISIONS.md`.

Present combined results.

## Phase 6: Summary

Spawn `node-summary.md` (reads the state files, runs the full suite + lint) → complete summary with steps, quality gates, conformance + adversarial results, tests, files changed, key decisions. Present it.

## Error Handling

- Sub-agent fails → report and ask how to proceed.
- User skips a phase → mark skipped, proceed.
- Keep `IMPLEMENTATION_PROGRESS.md` current so work survives interruptions.
- Phase context too large → split into more sub-agents.

## Related Skills

`@create-implementation-plan` (Phase 2) · `@bdd-design` (Phase 4) · `@test-quality-reviewer` + `@code-refactoring` (quality gate) · `@context7` + `@web-search` (research).
