# Type Guides

Body structure for the three retrievable types. Write a clear, searchable `--title` for each —
it carries the most ranking weight. (Memory is covered in [memory-guide.md](./memory-guide.md).)

## Question — `npx @quanvo99/ai-rules@latest kb capture question`

For a problem that was solved in a non-obvious way. The command composes the body itself as:

```
## Problem
{problem}

## Resolution
{resolution}
```

So pass them separately (inline `--problem` / `--resolution`, or `--problem-file` /
`--resolution-file` for multi-line content):
- `problem` — the symptom and context: what was observed, the error, the conditions under
  which it happens. Enough that a future searcher recognizes their situation.
- `resolution` — the fix and **why** it works. Include the concrete change (command, config,
  code) and the root cause, not just "restarted it".

## TIL — `npx @quanvo99/ai-rules@latest kb capture til`

For a surprising fact or gotcha. Keep the body short and focused on the single insight:

```
{The fact, stated plainly.}

Why it matters / where it bit: {context}.
```

Avoid padding — a TIL is one learning, not an essay.

## Blueprint — `npx @quanvo99/ai-rules@latest kb capture blueprint`

For a reusable pattern, template, or recipe. Make the body something you could follow
step by step later:

```
When to use: {trigger / situation}.

Steps:
1. ...
2. ...

Example / template:
{code or config snippet}

Pitfalls: {what to watch out for}.
```

The goal is that future-you can apply it without re-deriving it. Pass these multi-line bodies
with `--file <path>` (write the markdown to a temp file first) rather than inline.
