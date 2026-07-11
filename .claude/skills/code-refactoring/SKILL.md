---
name: code-refactoring
description: Guides structured code refactoring with test safety nets and incremental transformation patterns. Use when refactoring code, cleaning up implementation, extracting functions, simplifying conditionals, removing duplication, or when user says "refactor this", "clean up code", "extract function", or "simplify this".
---

# Code Refactoring

Structured approach to improving code structure without changing behavior, using tests as a safety net.

## Purpose

Refactoring is distinct from feature development — the goal is to improve internal structure while preserving all external behavior. This skill ensures refactoring is safe, incremental, and verifiable.

## When to Use This Skill

- Cleaning up implementation after feature development steps
- Extracting reusable functions or components
- Simplifying complex conditionals or deeply nested code
- Removing duplication across modules
- Improving naming and code organization
- As a periodic checkpoint during `@feature-development-workflow`

## Instructions

### Step 1: Identify the Refactoring Target

Before touching any code, clearly identify:
- **What** needs refactoring (specific function, class, module)
- **Why** it needs refactoring (duplication, complexity, poor naming, etc.)
- **Which refactoring pattern** applies (see Refactoring Catalog below)

### Step 2: Verify Test Coverage

**CRITICAL: Never refactor without tests.**

1. Check if tests exist for the code you're about to change
2. **Check `package.json` scripts** for existing test commands (e.g., `npm test`, `npm run test:unit`). Use the project's defined command instead of crafting your own.
3. Run all related tests to confirm they pass — this is your safety baseline
3. **If tests are missing: STOP.** Inform the user that the code lacks test coverage for the area being refactored and that refactoring cannot proceed safely. Ask the user to decide:
   - Write tests first (use `@tdd-design` or `@bdd-design`), then resume refactoring
   - Proceed anyway (accepting the risk)
   - Skip this refactoring

### Step 3: Apply the Refactoring

Apply **one refactoring at a time**. Do not combine multiple refactorings in a single step.

1. Make the structural change
2. Run tests immediately
3. If tests pass → commit or move to next refactoring
4. If tests fail → revert and reassess

### Step 4: Verify Behavior Preserved

1. **Check `package.json` scripts** for existing test and lint commands. Use the project's defined commands.
2. Run the full related test suite
3. Run linting to check for code quality issues
4. Confirm no behavioral change — only structural improvement

---

## Refactoring Catalog

### Extract Function
**When:** A code fragment can be grouped together and given a descriptive name.
```
// Before
function processOrder(order) {
  // ...validate order
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must have items");
  }
  if (!order.customer) {
    throw new Error("Order must have customer");
  }
  // ...process payment
}

// After
function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must have items");
  }
  if (!order.customer) {
    throw new Error("Order must have customer");
  }
}

function processOrder(order) {
  validateOrder(order);
  // ...process payment
}
```

### Rename (Variable, Function, Class)
**When:** A name doesn't clearly communicate intent.
- Choose names that describe **what**, not **how**
- Use domain language consistent with the codebase

### Inline
**When:** A function body is as clear as its name, or a variable is used only once and adds no clarity.

### Simplify Conditional
**When:** Complex nested if/else or switch statements obscure logic.
- Use guard clauses for early returns
- Extract conditional logic into descriptive boolean functions
- Replace nested conditionals with flat, readable structure

### Move Function/Class
**When:** A function or class belongs more naturally in another module.
- Move closer to where it's used most
- Group related functionality together

### Remove Duplication
**When:** Similar code appears in multiple places.
- Extract shared logic into a utility or helper
- Use composition over copy-paste

---

## Best Practices

- ✅ One refactoring at a time — keep changes atomic
- ✅ Run tests after every change
- ✅ Commit after each successful refactoring (or after a logical group)
- ✅ Preserve public interfaces when possible
- ✅ Use IDE rename/move tools when available for safety
- ❌ Don't refactor and add features simultaneously
- ❌ Don't refactor without test coverage
- ❌ Don't combine multiple unrelated refactorings

## Related Skills

- `@tdd-design` - Write tests first if coverage is missing before refactoring
- `@test-quality-reviewer` - Review test quality after refactoring to ensure tests still follow best practices
- `@bdd-design` - Use BDD scenarios to verify behavior preservation at a higher level
