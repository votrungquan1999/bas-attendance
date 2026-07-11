# Node: Tests Lens

Review the quality of tests included in the diff. Only runs when the diff adds or modifies test files. Read `lens-common.md` for shared rules and `HOLISTIC.md` for framing.

## Focus

- **Coverage of the change** — do the tests exercise the main functionality added/modified in this diff?
- **Edge cases** — are boundary and failure conditions tested, not just the happy path?
- **Sensitivity** — would the tests actually fail if the code were broken? Flag tests that pass regardless (no meaningful assertion, over-mocked, asserting on mocks).
- **Validity** — do assertions check the real behavior, or something incidental?
- **Resilience** — tests go through public interfaces, not brittle internals.

For a deep test-quality pass, defer to the `@test-quality-reviewer` skill (4 Pillars: Reliability, Validity, Sensitivity, Resilience) — reference it in your findings rather than duplicating its full analysis.

## Output

Write `./tmp/review-changes/LENS_tests.md` using the format in `lens-common.md`.
