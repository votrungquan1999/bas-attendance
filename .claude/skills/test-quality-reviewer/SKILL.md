---
name: test-quality-reviewer
description: Reviews test code quality using the 4 Pillars framework (Reliability, Validity, Sensitivity, Resilience). Use when reviewing tests, analyzing test quality, checking test coverage, or when user says "review these tests", "check test quality", or "analyze test coverage".
allowed-tools: Read, Grep, Glob, Write
context: fork
---

# Test Quality Reviewer

This Skill reviews test code using the **4 Pillars of Good Tests** framework to ensure tests are reliable, valid, sensitive, and appropriately resilient.

## The 4 Pillars Framework

| Pillar | Core Question | Failure Mode |
|--------|--------------|--------------|
| **Reliability** | "Will this test give consistent results?" | Flaky tests, false failures |
| **Validity** | "Does this test actually prove correctness?" | Tests pass but don't verify the real flow |
| **Sensitivity** | "Will this test fail if there are bugs?" | Tests that pass despite defects |
| **Resilience** | "Will this test survive legitimate refactoring?" | Brittle tests that break on every change |

**Important:** Different test types (unit, integration, E2E) emphasize different pillars. Unit tests may need lower resilience (testing implementation details), while E2E tests need high resilience (testing user behavior).

---

## Review Process

### Step 1: Identify Test Files

Use tools to find test files:
```bash
# Find test files
Glob: **/*.test.ts
Glob: **/*.test.tsx
Glob: **/*.spec.ts
```

### Step 2: Read and Analyze Tests

For each test file, read and analyze:
```bash
Read: path/to/test-file.test.ts
```

### Step 3: Apply 4 Pillars Analysis

For each test in the file, evaluate:

#### ✅ Pillar 1: Reliability (Critical for ALL tests)

**Question:** Will this test give consistent results every time?

**Look for:**
- ❌ Hardcoded timeouts: `setTimeout(2000)`
- ❌ Shared mutable state between tests
- ❌ Dependencies on external systems without mocking
- ❌ Tests that depend on execution order
- ❌ Race conditions in async tests

**Good patterns:**
- ✅ Condition-based waits: `await waitFor(() => expect(element).toBeVisible())`
- ✅ Each test sets up its own state
- ✅ Proper cleanup in afterEach/beforeEach
- ✅ Isolated test data

#### ✅ Pillar 2: Validity (Critical for ALL tests)

**Question:** Does this test actually prove what it claims to test?

**Look for:**
- ❌ Conditional assertions that may be skipped
- ❌ forEach loops that might not run (empty arrays)
- ❌ Generic "truthy" checks: `expect(result).toBeTruthy()`
- ❌ Missing assertions for edge cases

**Good patterns:**
- ✅ All assertions always execute
- ✅ Explicit array length checks before forEach
- ✅ Specific assertions: `expect(result).toEqual({ status: "success", count: 5 })`
- ✅ Edge cases explicitly tested

#### ✅ Pillar 3: Sensitivity (High for unit, moderate for E2E)

**Question:** Would this test fail if a bug was introduced?

**Look for:**
- ❌ Assertions using implementation constants: `expect(msg).toBe(ERROR_MESSAGES.INVALID)`
- ❌ Overly loose assertions: `expect(result).toBeTruthy()`
- ❌ Only checking that functions were called, not with what arguments
- ❌ Over-mocking that bypasses real code

**Good patterns:**
- ✅ Static literal values: `expect(msg).toBe("Invalid input provided")`
- ✅ Specific assertions with exact values
- ✅ Checking function arguments: `expect(fn).toHaveBeenCalledWith({ id: "123" })`
- ✅ Minimal mocking, testing real integrations

#### ✅ Pillar 4: Resilience (High for E2E, moderate for unit)

**Question:** Will this test survive legitimate refactoring?

**Look for:**
- ❌ Testing internal state: `component.state.isLoading`
- ❌ Testing private methods
- ❌ Brittle CSS selectors: `container.querySelector("div.css-1abc123 > button")`
- ❌ Testing exact error messages that may change

**Good patterns (E2E/Integration):**
- ✅ Testing user-visible behavior: `getByRole("button")`
- ✅ Semantic selectors: `getByRole("button", { name: "Submit" })`
- ✅ Testing public API, not internals
- ✅ Partial string matches for messages: `.toContain("failed")`

**Acceptable for unit tests:**
- ✅ Testing internal logic may be necessary
- ✅ Checking internal helper calls is OK for unit tests
- ✅ Lower resilience acceptable when testing implementation

---

## Review Output Format

For each test file reviewed, provide:

```markdown
## Test File: [filename]

### Overall Assessment
- **Test Type:** [Unit / Integration / E2E]
- **Total Tests:** [number]
- **Quality Score:** [Excellent / Good / Needs Improvement / Poor]

### Pillar Analysis

#### ⚡ Reliability: [Pass / Issues Found]
[List specific issues or confirm good patterns]

#### ✓ Validity: [Pass / Issues Found]
[List specific issues or confirm good patterns]

#### 🎯 Sensitivity: [Pass / Issues Found]
[List specific issues or confirm good patterns]

#### 🛡️ Resilience: [Pass / Issues Found / Acceptable for Unit Tests]
[List specific issues or confirm good patterns]

### Specific Issues

1. **[Test Name]** (Line X)
   - **Issue:** [Description]
   - **Pillar Violated:** [Which pillar]
   - **Recommendation:** [How to fix]

2. **[Test Name]** (Line Y)
   - **Issue:** [Description]
   - **Pillar Violated:** [Which pillar]
   - **Recommendation:** [How to fix]

### Strengths
- [List what the tests do well]

### Recommendations
1. [Priority fix]
2. [Other improvements]
```

---

## Guidelines by Test Type

### Unit Tests
- **Reliability:** CRITICAL - Must be deterministic
- **Validity:** CRITICAL - Must verify correct behavior
- **Sensitivity:** HIGH - Should catch implementation bugs
- **Resilience:** MODERATE - May test some implementation details (acceptable)

### Integration Tests
- **Reliability:** CRITICAL - Must be deterministic
- **Validity:** CRITICAL - Must verify correct integration
- **Sensitivity:** HIGH - Should catch integration bugs
- **Resilience:** HIGH - Focus on interface contracts, not internals

### E2E Tests
- **Reliability:** CRITICAL - Must be deterministic
- **Validity:** CRITICAL - Must verify real user flows
- **Sensitivity:** MODERATE - Catch major user-facing bugs
- **Resilience:** CRITICAL - Test user behavior, never implementation

---

## Common Anti-Patterns to Flag

### ❌ Reliability Issues
```typescript
// BAD: Hardcoded timeout
await new Promise(resolve => setTimeout(resolve, 2000))

// BAD: Shared state
let counter = 0
it("test 1", () => { counter++ })
it("test 2", () => { expect(counter).toBe(0) }) // Will fail!
```

### ❌ Validity Issues
```typescript
// BAD: Conditional assertion (might not run)
if ("error" in result) {
  expect(result.error.message).toBe("Failed")
}

// BAD: forEach that might not run
items.forEach(item => {
  expect(item.valid).toBe(true)
})
```

### ❌ Sensitivity Issues
```typescript
// BAD: Using implementation constants
expect(result.message).toBe(ERROR_MESSAGES.INVALID)

// BAD: Too loose
expect(result).toBeTruthy()

// BAD: Not checking arguments
expect(apiCall).toHaveBeenCalled()
```

### ❌ Resilience Issues (E2E/Integration)
```typescript
// BAD: Testing internal state
expect(component.state.loading).toBe(false)

// BAD: Brittle selector
container.querySelector(".css-xyz123 button")

// BAD: Exact error message
expect(error).toBe("Error at line 42: Connection failed")
```

---

## When to Use This Skill

**Trigger phrases:**
- "Review these tests"
- "Check test quality"
- "Analyze test coverage"
- "Are my tests good?"
- "How can I improve these tests?"
- "Check for flaky tests"

**Use when:**
- After writing new tests
- During code review
- Debugging flaky tests
- Refactoring test suites
- Auditing test quality

**Output:**
- Detailed analysis using 4 Pillars
- Specific issues with line numbers
- Concrete recommendations
- Priority ranking of fixes

---

## Summary

This Skill uses the 4 Pillars framework to systematically review test quality:

1. **Find test files** using Glob
2. **Read tests** using Read
3. **Analyze each pillar** based on test type
4. **Provide specific feedback** with line numbers
5. **Recommend improvements** with priority

**Remember:** Different test types have different pillar priorities. Unit tests can have lower resilience (testing implementation), while E2E tests must have high resilience (testing behavior).

## Output

Write your complete findings to `./tmp/<identifier>/test-quality-review.md` — where `<identifier>` is the caller-provided workspace, or a short ticket-id/slug you derive for this task (create the folder if needed). **If it already holds artifacts from unrelated work, STOP and ask the user rather than overwriting.** Do this before finishing, so the caller and user can review the full results.
