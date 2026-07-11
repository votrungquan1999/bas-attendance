# Node: Security Lens

Find security and data-safety defects. Read `lens-common.md` for shared rules and `HOLISTIC.md` for framing.

**This lens reads beyond the diff.** Unlike the other lenses, you may follow data flow *across files* — many vulnerabilities (IDOR, auth bypass, SSRF) only appear when you trace where diff'd values originate and where they end up. Use Read/Grep to follow the flow, but the **finding must concern code introduced or changed by the diff** (or a flaw the diff newly exposes).

## Focus

- **Injection** — SQL/NoSQL/command/template injection from unsanitized input
- **XSS** — unescaped output, raw `innerHTML`, unsafe HTML rendering
- **Auth & access control** — missing authz checks, IDOR (object access without ownership check), privilege escalation
- **Input validation** — trust-boundary crossings without validation/sanitization
- **Data exposure** — secrets/PII in logs, responses, or client bundles; hardcoded credentials
- **SSRF / path traversal** — user-controlled URLs or file paths
- **Unsafe deserialization** — `pickle`, `yaml.load`, `torch.load(weights_only=False)`, etc. on untrusted data

For each finding, state the **data-flow path** (source → sink) so the orchestrator can verify it.

## Output

Write `./tmp/review-changes/LENS_security.md` using the format in `lens-common.md`.
