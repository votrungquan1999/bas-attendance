#!/usr/bin/env node
// Claude Code UserPromptSubmit hook for AI-Kanban tracking. Reads the hook JSON on
// stdin, injects a card-status reminder via additionalContext, and best-effort POSTs
// the prompt to the active card. Always exits 0 — exit 2 would erase the user's prompt.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const NO_POINTER_REMINDER =
  "No AI-Kanban card is active for this session. If this prompt starts substantive, multi-step work, open a card to track it.";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

// Pointer written by the model right after create_card; absent = no active card.
function readPointer(sessionId) {
  if (!sessionId) return null;
  try {
    const path = join(homedir(), ".claude", "kanban-session-state", `${sessionId}.json`);
    const pointer = JSON.parse(readFileSync(path, "utf8"));
    const hasRequiredFields =
      typeof pointer.cardId === "string" &&
      typeof pointer.cardNumber === "number" &&
      typeof pointer.summary === "string";
    return hasRequiredFields ? pointer : null;
  } catch {
    return null;
  }
}

function buildReminder(pointer) {
  if (!pointer) return NO_POINTER_REMINDER;
  return `Active AI-Kanban card #${pointer.cardNumber} (${pointer.summary}). ` +
    "If this prompt diverges into a new task, open a NEW card; otherwise append progress to this card.";
}

function isValidMcpEntry(entry) {
  return !!entry && typeof entry.url === "string" && typeof entry.headers?.Authorization === "string";
}

// Kanban URL + Basic auth live in ~/.claude.json. Precedence: a project-scoped
// override (projects[cwd].mcpServers) wins, else fall back to the top-level
// global entry. Missing/unparseable config is the expected common case, not an error.
function readKanbanConfig(cwd) {
  try {
    const path = join(homedir(), ".claude.json");
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    const projectEntry = parsed.projects?.[cwd]?.mcpServers?.["ai-kanban-dispatch"];
    if (isValidMcpEntry(projectEntry)) return projectEntry;
    const globalEntry = parsed.mcpServers?.["ai-kanban-dispatch"];
    return isValidMcpEntry(globalEntry) ? globalEntry : null;
  } catch {
    return null;
  }
}

const FETCH_TIMEOUT_MS = 5000; // well under the 30s UserPromptSubmit hook budget

// Best-effort: never let a POST failure block or crash the hook.
async function postProgress(pointer, prompt, cwd) {
  if (!pointer || !prompt) return;
  const config = readKanbanConfig(cwd);
  if (!config) return;

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "append_progress",
      arguments: { id: pointer.cardId, note: prompt },
    },
  });

  try {
    await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: config.headers.Authorization,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    // unreachable/refused/slow endpoint — swallow, the prompt must still go through
  }
}

function emit(additionalContext) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext,
    },
  }));
}

async function main() {
  let input = {};
  try {
    input = JSON.parse(await readStdin());
  } catch {
    input = {};
  }

  const pointer = readPointer(input.session_id);
  emit(buildReminder(pointer));
  await postProgress(pointer, input.prompt, input.cwd);
  process.exit(0);
}

// Belt-and-suspenders: an unexpected error must never crash the hook or exit non-zero
// (exit 2 erases the user's prompt) — per-function try/catches already cover the known
// failure modes; this is the final backstop.
main().catch(() => process.exit(0));
