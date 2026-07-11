# Node: Research

Focused context-gathering phase. Read the codebase to understand patterns, architecture, and affected areas.

> **Task workspace:** All state files live in the task working directory `<ws>` (`./tmp/<identifier>/`) given in your prompt. Every state-file path below is relative to `<ws>`.

## Input

Read the user's feature request from the conversation context.

## Execution

1. **Identify the feature area** — what part of the codebase is affected?

2. **Read broadly first:**
   - Entry points and main files for the affected area
   - Related tests to understand existing behavior
   - Types, interfaces, and data models
   - Configuration files if relevant

3. **Read deeply second:**
   - Implementation details in the core affected files
   - Patterns used in similar features (if any exist)
   - Utility functions and shared helpers that might be reused

4. **Research the standard approach:**
   - Use `@web-search` to find the standard/best/recommended way to implement this type of feature
   - Look for established patterns, common pitfalls, and industry best practices
   - Compare what you find externally with the patterns already in the codebase

5. When researching external libraries or APIs, use `@context7` for documentation queries and `@web-search` for broader research.

6. **Count what you read** — track the number of files examined.

7. **Resolve code-answerable questions yourself — do not defer them.**
   If something can be answered by reading the code (how a function behaves, where a type is defined, whether a pattern already exists, how an existing flow works), keep reading until you have the answer. Do NOT write "this needs further investigation" or "the code should be checked to understand X" for anything you could resolve by reading more files.

   A thread belongs in **Follow-up Investigations Needed** ONLY when it is code-answerable but you genuinely could not finish chasing it in this pass — e.g. the scope is too large for one agent, it branches into a separate subsystem, or you discovered it late. Each such item must be a concrete, self-contained investigation target the next agent can pick up cold (a specific question + where to look), NOT a vague "look into this more."

   A thread belongs in **Open Questions for the User** ONLY when it is a product/requirement decision the code cannot answer (desired behavior, scope boundary, business rule).

## Output

Write findings to `<ws>/RESEARCH_OUTPUT.md`.

If you were spawned as a **targeted follow-up agent** (you were given a specific investigation item), instead write to the `<ws>/RESEARCH_FOLLOWUP_[id].md` file named in your prompt, using the same section structure below. Resolve your assigned item fully; if it uncovers further code-answerable threads, list them under "Follow-up Investigations Needed" so the orchestrator can spawn another round.

```markdown
# Research Output

## Files Read: [count]

## Feature Area
[Brief description of what area of the codebase is affected]

## Key Patterns Found
- [Pattern 1]: [Where it's used and how]
- [Pattern 2]: [Where it's used and how]

## Existing Related Code
- [File/function]: [What it does and how it relates]

## Affected Areas
- [Area 1]: [How it's affected]
- [Area 2]: [How it's affected]

## Testing Patterns
- [How tests are organized in this part of the codebase]
- [Testing utilities available]

## Follow-up Investigations Needed
<!-- Code-answerable threads you could not finish this pass. The orchestrator will spawn a targeted sub-agent per item. Leave empty if research is complete. -->
- [Concrete question]: [Exact files/dirs/symbols the next agent should start from]

## Open Questions for the User
<!-- Product/requirement decisions only — NOT things the code can answer. -->
- [Decision the user must make]
```

**CRITICAL — pausing depends on who you are:**
- If you are a **targeted follow-up agent**, do NOT pause for the user. Write your findings file and return a brief summary to the orchestrator (what you resolved, any new follow-up items).
- If you are the **initial research agent**, write the output. The orchestrator decides whether to spawn follow-up agents or pause for the user — see the skill's Phase 1. Do not invent a user pause yourself; report back to the orchestrator with whether "Follow-up Investigations Needed" is empty.
