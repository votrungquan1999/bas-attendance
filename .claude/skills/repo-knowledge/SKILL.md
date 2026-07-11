---
name: repo-knowledge
description: Generates comprehensive repository knowledge base documentation by analyzing codebase patterns, architecture, and flows. Use when onboarding to a repo, creating documentation, or when user says "analyze this repo", "create repo docs", "repo knowledge", or "document this codebase".
allowed-tools: Read, Grep, Glob, Bash, Write, Agent
context: fork
---

# Repository Knowledge

Creates a comprehensive knowledge base for a repository by analyzing the codebase and documenting meaningful patterns, architecture, and flows.

## Repository Context

!`ls -d */ 2>/dev/null | head -30`
!`cat package.json 2>/dev/null | head -20 || cat requirements.txt 2>/dev/null | head -15 || cat go.mod 2>/dev/null | head -10 || echo "No standard dependency file found"`

## When to Use

- Starting work on a new codebase
- Creating onboarding documentation
- Planning major architectural changes
- Setting up agent context for a repository

## Steps

1. **Create Repository Knowledge Folder**:
   ```bash
   mkdir -p repo_knowledge
   ```

2. **Analyze High-Level Structure**:
   - Analyze directory layout, main modules/packages, and entry files
   - Review dependency files for key dependencies
   - **Review `package.json` scripts** (or equivalent) to understand existing dev commands (build, test, lint, dev server, etc.) — document these so agents use project-defined commands
   - Read `README.md` and agent rules (`.cursor/rules/`, `.claude/`, `.github/copilot-instructions.md`)
   - **Extract only meaningful, non-generic content** — don't copy entire files

3. **Deep-Dive Analysis**:
   - Map detailed module organization, key abstractions, and utilities
   - Identify state management, testing patterns, and conventions
   - Map critical user flows, data flows, and API structure
   - Document component hierarchy (frontend) or database schema (backend) as applicable

4. **Analyze Local Development & Workflow**:
   - Prerequisites, env config, install & dev server commands, Docker setups, seed/migration steps
   - Order of operations to get running locally
   - Branching strategy, build/test/lint commands, CI/CD pipeline, pre-commit hooks
   - Deployment process and code generation steps (if applicable)

5. **Create Interconnected Knowledge Files**:
   
   Create focused markdown files in `repo_knowledge/`. **Determine the right set of files based on what's actually relevant to this repo.** Don't create files for trivial or non-existent areas.
   
   Example files (use as inspiration, not a checklist):
   - `overview.md` — Project description, tech stack, key goals
   - `architecture.md` — System design with mermaid diagrams
   - `patterns.md` — Code patterns and conventions unique to this repo
   - `flows.md` — Key user/data flows
   - `local-development.md` — Setup and running locally
   - `development-workflow.md` — Branching, testing, CI/CD, deployment
   - `testing.md` — Testing strategy and patterns
   - `data-models.md` — Database schema and relationships
   - `api.md` — API endpoints and contracts
   
   **Cross-reference between files** to reduce duplication:
   ```markdown
   See [architecture.md](./architecture.md#database-layer) for database details.
   ```

6. **Update Root Agent Files**:
   
   If root-level agent files exist (e.g., `CLAUDE.md`, `.cursorrules`), add references to all created knowledge files:
   ```markdown
   ## Repository Knowledge
   For comprehensive understanding, refer to `repo_knowledge/`:
   - [Overview](./repo_knowledge/overview.md)
   - [Architecture](./repo_knowledge/architecture.md)
   - ... (list all created files)
   ```

## Guidelines

**DO:**
- Focus on **non-obvious** patterns unique to this repo
- Document meaningful architectural decisions with reasoning
- Include specific examples with file references
- Use mermaid diagrams for complex architectures or flows
- Cross-reference between files to avoid duplication

**DO NOT:**
- Include generic practices ("Use meaningful variable names", "Write unit tests")
- List every component or file (discoverable through exploration)
- Copy sensitive information (API keys, tokens, credentials)
- Make up filler sections unless explicitly documented elsewhere
- Repeat information across knowledge files

## Example Structure

```
repo_knowledge/
├── overview.md              # What it does, tech stack, key goals
├── architecture.md          # System design, component relationships
├── patterns.md              # Coding patterns, naming conventions
├── local-development.md     # Prerequisites, env setup, running locally
├── development-workflow.md  # Branching, CI/CD, testing, deployment
└── ...                      # Any other relevant topics
```

## Notes

- Keep knowledge files **concise** — quality over quantity
- Update as the codebase evolves
- Link to specific files using relative paths
- Use mermaid diagrams for complex relationships
