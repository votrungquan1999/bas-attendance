# Node: Adversarial Revalidation

Check the **actual implemented code** against the frozen behavior-risk catalog. Runs in Phase 5b, in parallel with conformance validation (5a). A few instances run at once, each assigned a group of catalog entries.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## What makes this different from conformance validation

Conformance validation (5a) asks "did each step match the plan?" — it trusts the plan as the spec. **You do the opposite:** you take the frozen `<ws>/BEHAVIOR_RISKS.md` as the source of truth for *expected* behavior on paths the plan never specified, and you probe whether the real implementation actually survives them.

The catalog is **frozen** and **implementation-blind by construction** (written before the code existed). Treat it as ground truth. **Never edit it** — not even to fix a wrong-looking entry; if an entry seems wrong, say so in your finding and let the orchestrator judge.

## Input

- Read your assigned entries from `<ws>/BEHAVIOR_RISKS.md` (the risk ids in your prompt) — read only those plus any they cross-reference.
- Read the **actual implemented code** for the paths those risks touch (from `<ws>/IMPLEMENTATION_PROGRESS.md` file lists and the plan).

## Execution

**For EACH assigned risk entry, one at a time:**

1. **Locate the path in the real code.** Find where the catalogued situation would be handled (or where the code assumes it can't happen).
2. **Determine actual behavior.** Reason through what the implementation does when that situation arises. Where reasoning is not conclusive, write a **scratch probe** (a throwaway test or script) to observe the real behavior — the probe confirms behavior; the catalog remains the source of truth for what behavior *should* be.
3. **Compare to expected.**
   - For a **requirement-implied** entry: does actual behavior match the catalog's expected behavior?
   - For an entry the catalog marked **silent but since resolved** (the orchestrator folded a user decision into the plan): check against that resolution.
4. **Classify:**
   - **survives** — behaves acceptably on this path.
   - **breaks** — crashes, errors, or produces a clearly wrong result.
   - **silent-misbehavior** — no error, but wrong/lossy/inconsistent outcome (the dangerous class).
   - **unclear** — could not determine; note what is needed.
5. **Severity** for anything not `survives`: low | medium | high (impact × likelihood of the situation).

Do **not** fix anything. This node reports; the orchestrator triages fixes with the user.

## Output

Append each finding to `<ws>/ADVERSARIAL_REVALIDATION.md` (one section per risk):

```markdown
# Adversarial Revalidation

## R[id] — [behavior-risk title]
- **Expected (from frozen catalog):** [expected behavior]
- **Actual behavior:** [what the code does]
- **How observed:** reasoning | scratch probe ([what the probe did])
- **Verdict:** survives | breaks | silent-misbehavior | unclear
- **Severity:** low | medium | high | n/a (survives)
- **Where:** [file:line]
- **Note:** [anything the orchestrator needs — incl. "catalog entry looks wrong because…" if so]
```

Report back to the orchestrator: per-risk verdicts with severity, and a count of non-`survives` findings.
