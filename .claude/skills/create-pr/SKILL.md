---
name: create-pr
description: Generates a PR title and description by analyzing the branch diff against the base branch. Use when creating a pull request, generating PR description, or when user says "create PR", "generate PR", "draft PR", or "prepare PR".
allowed-tools: Read, Grep, Glob, Bash
---

# Generate PR Title & Description

Analyze the current branch changes and produce a concise PR title and description for review.

## Current Branch Context

Branch: !`git branch --show-current`
Commits: !`git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null || echo HEAD~5)..HEAD 2>/dev/null || echo "Could not determine commits"`

## When to Use

- When asked to generate or draft a PR title and description
- Before pushing a branch for review

## Instructions

### Step 1: Identify the Ticket

- Look for a ticket identifier in the branch name (e.g., `PROJ-123`, `feat/PROJ-123-add-login`)
- If no ticket in branch name, ask the user for the ticket number

### Step 2: Gather Changes

1. Run `git log --oneline $(git merge-base HEAD main)..HEAD` to see commits
2. Run `git diff --stat $(git merge-base HEAD main)..HEAD` to see changed files
3. Read key diffs to understand what actually changed and why

### Step 3: Create the PR Title

Format: `[TICKET] Short description`

- Keep it short — under 60 characters
- Imperative mood ("Add", "Fix", not "Added", "Fixes")
- Describe the outcome, not the implementation

### Step 4: Write the PR Description

Think about what a reviewer needs to understand this PR in 30-60 seconds. There is no fixed template — adapt the structure to fit the changes:

- **Small fix?** A sentence or two is enough
- **Feature work?** Explain what it does and why, summarize the key changes
- **Refactor?** Explain the motivation and what improved
- **Multiple concerns?** Group them logically

The goal is to answer: *"What changed and why should I care?"* — not to document every file touched.

**Recommended sections** (use what fits, skip what doesn't):
- **What** — brief summary of the change and its purpose
- **Why** — motivation or context if not obvious from the title
- **Changes** — high-level summary of key changes by area
- **Testing** — how it was verified, what tests were added/changed
- **Notes** — anything the reviewer should watch out for (risks, breaking changes, follow-ups)

**Guidelines:**
- Be concise and high-level — a reviewer should finish reading in under a minute
- Focus on what matters for review, skip the obvious
- Call out anything risky, breaking, or surprising
- Don't repeat commit messages or list every file
- NEVER include internal tool references (e.g., `cci:1://file:///Users/...`, `file:///absolute/path/...`) in the description. When referencing files, use the file name only (e.g., `config.ts`). Use short relative paths only when multiple files share the same name

### Step 5: Present to User

Show the title and description for review before creating the PR.

**Format for easy copying:** Present the PR title and description each inside a markdown code block so the user can copy-paste them directly into GitHub without formatting issues.

Example:

````
**Title:**
```
[TICKET-123] Add user authentication flow
```

**Description:**
```markdown
## What
Add JWT-based authentication...
```
````
