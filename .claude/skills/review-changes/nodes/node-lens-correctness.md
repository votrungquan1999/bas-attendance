# Node: Correctness Lens

Find logic bugs and behavioral defects in the diff. Read `lens-common.md` for shared rules and `HOLISTIC.md` for framing.

## Focus

1. **Logic & correctness**
   - Does the code do what the intended approach (from HOLISTIC.md) says it should?
   - Off-by-one errors, inverted conditions, wrong operators, incorrect control flow
   - State mutated incorrectly, stale reads, ordering assumptions

2. **Edge cases & error handling**
   - Null/undefined/empty inputs, empty collections, boundary values
   - Are failure paths handled, or do they fall through silently?
   - Concurrency / race conditions / async ordering where relevant

3. **Performance regressions** (only if introduced by the change)
   - Obviously inefficient algorithms, N+1 queries, work inside hot loops

Stay in the diff. A correctness claim about unchanged code is out of scope.

## Output

Write `./tmp/review-changes/LENS_correctness.md` using the format in `lens-common.md`.
