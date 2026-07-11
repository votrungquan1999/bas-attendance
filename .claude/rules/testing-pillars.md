---
paths: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx']
description: 'Claude Code testing: The 4 Pillars of Good Tests framework (Reliability, Validity, Sensitivity, Resilience)'
---

# The 4 Pillars of Good Tests

All tests should CONSIDER these four pillars, applying them based on test type and context. Different test levels (unit, integration, E2E) will emphasize different pillars.

| Pillar | Core Question | Failure Mode |
|--------|--------------|--------------|
| **Reliability** | "Will this test give consistent results?" | Flaky tests, false failures |
| **Validity** | "Does this test actually prove correctness?" | Tests passed but does not verify the real flow |
| **Sensitivity** | "Will this test fail if there are bugs?" | Tests that pass despite defects |
| **Resilience** | "Will this test survive legitimate refactoring?" | Brittle tests that break on every change |

**Trade-offs**: Unit tests may need to test implementation details (lower resilience), while E2E tests should focus on user behavior (high resilience). Balance these pillars based on your testing goals.

## 1. Reliability (Consistency)

**Priority**: Critical for ALL test types

Tests should produce identical, reproducible results under the same conditions.

**Common Causes of Unreliable Tests:**
- Race conditions and async timing issues
- Shared mutable state between tests
- Dependencies on external systems
- Hardcoded timeouts instead of condition-based waits
- Tests that depend on execution order

**Examples:**
```typescript
// ❌ Bad - hardcoded sleep
await new Promise((resolve) => setTimeout(resolve, 2000));

// ✅ Good - wait for specific condition
await waitFor(() => expect(element).toBeVisible());

// ❌ Bad - tests share state
let sharedCounter = 0;
it("test 1", () => { sharedCounter++; });
it("test 2", () => { expect(sharedCounter).toBe(0); }); // Fails!

// ✅ Good - each test sets up its own state
it("test 1", () => { const counter = 0; /* ... */ });
it("test 2", () => { const counter = 0; /* ... */ });
```

## 2. Validity (Accuracy)

**Priority**: Critical for ALL test types

Tests should actually verify what they claim to verify. Assertions must always run and accurately reflect intended behavior.

**Key Practices:**
- Avoid conditional assertions that may be silently skipped
- Use specific assertions, not generic "truthy" checks
- Every expected behavior should be asserted
- A passing test must definitively fail when code is incorrect

**Examples:**
```typescript
// ❌ Bad - conditional assertions can be silently skipped
if ("error" in result) {
  expect(result.error.message).toBe("Failed");
}

// ✅ Good - all assertions will run
expect(result).toEqual(
  expect.objectContaining({
    error: expect.objectContaining({ message: "Failed" }),
  })
);

// ❌ Bad - assertion may never run if array is empty
results.forEach((result) => {
  expect(result.status).toBe("success");
});

// ✅ Good - explicitly verify array has items
expect(results).toHaveLength(3);
results.forEach((result) => {
  expect(result.status).toBe("success");
});
```

## 3. Sensitivity (Responsiveness)

**Priority**: High for unit tests, moderate for integration/E2E

Tests should detect actual defects when they exist. Balance with resilience based on test type.

**Key Practices:**
- Use static, literal values in assertions rather than implementation constants
- Write specific assertions rather than overly permissive ones
- Verify complete behavior including edge cases and error conditions
- Avoid over-mocking that bypasses the code you're testing

**Examples:**
```typescript
// ❌ Bad - won't catch if constant value changes incorrectly
expect(result.message).toBe(ERROR_MESSAGES.INVALID);

// ✅ Good - catches any deviation from expected value
expect(result.message).toBe("Invalid input provided");

// ❌ Bad - overly loose assertion
expect(result).toBeTruthy();

// ✅ Good - specific assertion
expect(result).toEqual({ status: "success", count: 5 });

// ❌ Bad - not testing the right thing
expect(apiCall).toHaveBeenCalled();

// ✅ Good - verify the actual behavior
expect(apiCall).toHaveBeenCalledWith({ userId: "123", action: "delete" });
```

## 4. Resilience (Robustness)

**Priority**: High for integration/E2E tests, moderate for unit tests

Tests should remain valid when code undergoes legitimate changes that don't alter external behavior.

**Note**: Unit tests MAY need to test implementation details to ensure internal correctness. This is acceptable and sometimes necessary. Resilience is more critical for integration and E2E tests.

**Key Practices:**
- **E2E/Integration**: Test through public interfaces, use semantic selectors, focus on user behavior
- **Unit**: Balance testing implementation logic with avoiding over-coupling to internal structure
- Assert on meaningful parts of output, not exact strings that may change cosmetically

**Examples:**
```typescript
// ❌ Bad for E2E - testing implementation details
expect(component.state.isLoading).toBe(false);

// ✅ Good for E2E - testing user-visible behavior
expect(screen.getByRole("button")).not.toBeDisabled();

// ✅ Acceptable for unit tests - testing internal logic
expect(internalHelper).toHaveBeenCalled(); // OK if testing unit behavior

// ❌ Bad - brittle selector tied to CSS classes
const button = container.querySelector("div.css-1abc123 > button");

// ✅ Good - semantic selector
const button = screen.getByRole("button", { name: "Submit" });

// ❌ Bad - testing exact error message that may change
expect(error.message).toBe("Error: Database connection failed at line 123");

// ✅ Good - testing the meaningful part
expect(error.message).toContain("Database connection failed");
```

## Guidelines by Test Type

**Unit Tests:**
- **Reliability**: Critical - must be deterministic
- **Validity**: Critical - must verify correct behavior
- **Sensitivity**: High - should catch implementation bugs
- **Resilience**: Moderate - may test some implementation details

**Integration Tests:**
- **Reliability**: Critical - must be deterministic
- **Validity**: Critical - must verify correct integration
- **Sensitivity**: High - should catch integration bugs
- **Resilience**: High - focus on interface contracts, not internals

**E2E Tests:**
- **Reliability**: Critical - must be deterministic
- **Validity**: Critical - must verify real user flows
- **Sensitivity**: Moderate - catch major user-facing bugs
- **Resilience**: Critical - test user behavior, never implementation

## Summary

When writing or reviewing tests, ask yourself:

1. **Reliability**: Will this give the same result every time?
2. **Validity**: Does this actually test what I think it tests?
3. **Sensitivity**: Would this fail if I introduced a bug?
4. **Resilience**: Will this break when I refactor? (Is that acceptable for this test type?)

Balance these pillars based on your test type and goals. Not all pillars apply equally to all tests.
