---
name: playwright-testing
description: Running Playwright UI tests in the workspace to verify navigation, layout, and functionality after any code change.
---
# Playwright UI Testing Standard Operating Procedure

This skill outlines how to run, write, and troubleshoot Playwright UI tests in the `pdf-online` project.

## When to Run Tests

**Mandatory Rule:** You must run the Playwright test suite after making ANY changes to the codebase, including but not limited to:
- Adding or modifying components
- Changing routing structure
- Modifying CSS, theme values, or styling
- Adding new feature pages or updating content
- Modifying project dependencies

## How to Run Tests

Run the following command in the project root:
```powershell
npm run test:ui
```

This command will automatically:
1. Start the Vite development server using `npm start` (on `http://localhost:3001/pdf-online/`).
2. Run the Playwright test suite against the dev server.
3. Automatically shutdown the dev server once tests complete.

## How to Handle Test Failures

If any test fails, follow these steps to troubleshoot:
1. Check the console logs from the test output to see which assertions failed.
2. If more detail is needed, run `npx playwright show-report` to view the full HTML test report including screenshots/traces for the failure.
3. **Bug in Code:** If the failure is due to a bug in your recent changes, fix the bug and run `npm run test:ui` again.
4. **Intentional UI Change:** If the UI was changed intentionally (e.g., you renamed a page or heading), modify the corresponding test in [navigation.spec.ts](file:///d:/Code/UI/pdf-online/tests/navigation.spec.ts) to match the new behavior.
