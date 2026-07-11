---
name: commit-plan
description: Analyzes git changes and creates a semantic commit plan with grouped, well-described commits. Use when organizing uncommitted changes, planning commits, or when user says "commit plan", "plan commits", "organize my commits", or "group my changes".
allowed-tools: Read, Bash, Write
---

# Commit Plan

Create a well-structured commit plan by analyzing current git changes and grouping them into semantic commits with detailed descriptions.

## Step 0 — Work in the right repo

The repo being committed is often not the current dir — you might be in `~/git-repos/personal` while the work is in `quant-trading/`. Infer the repo from the conversation and the files being changed, and work from inside it; ask if the target repo is unclear. Then inspect the working tree with `git status --short` and `git diff --stat`.

## When to Use

- You have uncommitted changes and want clean commit history
- Multiple logical changes mixed together in working tree
- Before merging to organize work into reviewable commits

## Steps

1. **Understand Key Changes**: For important modified files, run `git diff --no-ext-diff <file>` to see actual changes
   - Focus on files central to understanding the scope of work
   - Read 2-3 key files to understand the nature of changes

2. **Read File Contents**: Use `Read` on modified files to understand full context
   - Important for writing accurate commit descriptions
   - Focus on new files and significantly modified files

3. **Group Changes**: Analyze all information and group related changes into logical commits:
   - **feat**: New feature or capability
   - **fix**: Bug fix
   - **docs**: Documentation changes
   - **style**: Formatting, missing semicolons, etc.
   - **refactor**: Code restructuring without behavior change
   - **test**: Adding or modifying tests
   - **chore**: Maintenance tasks (deps, config, tooling)

4. **Create Commit Plan**: For each group, create a commit with:
   - **Title**: Semantic prefix + scope (optional) + concise summary (50 chars or less)
   - **Description**: Explanation of what changed and why. Do NOT hard-wrap lines — let text flow naturally so it renders properly on git platforms (GitHub, GitLab, etc.)
   - **Files**: List of all files to include in this commit
   
   **CRITICAL**: Each file can only appear in ONE commit (no partial staging)

5. **Present Plan**: Show the complete commit plan to the user for review
   - Include both title and description for each commit
   - List all files clearly
   - Wait for user approval before proceeding

6. **Execute**: After approval, for each commit run:
   ```bash
   git add <file1> <file2> ... && git commit -m "<title>

   <description paragraph>

   - <bullet point 1>
   - <bullet point 2>"
   ```
   - Use `&&` to combine add and commit in one command
   - Use single `-m` with multi-line string (title + blank line + description + blank line + bullets)

## Example Output

```markdown
## Commit Plan

### Commit 1: feat(workflows): add workflows repository and infrastructure

**Description**: 
Implement workflows support infrastructure including repository layer, types, 
and database collection.

**Files**:
- src/server/types.ts
- src/server/workflows-repository.ts

### Commit 2: test(workflows): add comprehensive test coverage

**Description**:
Add unit and E2E tests for workflows functionality across all agents.

**Files**:
- tests/lib/workflows-repository.test.ts
- tests/e2e/antigravity-installation.test.ts
```

## Key Principles

- **Deep Understanding**: Actually read files and diffs, don't just skim filenames
- **One File, One Commit**: Each file appears in exactly one commit (no partial staging)
- **Multi-line Messages**: Always include both title and description
- **Atomic Commits**: Each commit should be a complete, logical unit of work
- **Review First**: NEVER commit without user approval
- **Conventional Format**: Follow semantic commit conventions strictly

## Notes

- Never commit artifacts, generated files, or `node_modules`
- Keep each commit focused on one logical change
- Title should be concise (≤50 chars), description can be detailed
- After approval, execute commands sequentially (one at a time)

## Output

Write your commit plan to `./tmp/<identifier>/commit-plan.md` — where `<identifier>` is the caller-provided workspace, or a short ticket-id/slug you derive for this task (create the folder if needed). **If it already holds artifacts from unrelated work, STOP and ask the user rather than overwriting.** Do this before finishing, so the caller and user can review the full plan before execution.

## Related Skills

- `@review-changes` — Run before creating a commit plan to catch issues early
