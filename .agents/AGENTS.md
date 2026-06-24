# Project-Specific Agent Rules for pdf-online

## UI Testing and Validation

- **Mandatory Validation Step**: You must run the Playwright test suite after making any edits to the codebase (source code, configuration, styles, assets).
- **Test Command**: Execute `npm run test:ui` in the project root to start the dev server and run the tests.
- **Handling Failures**: Do not report success or ask for feedback if there are failing UI tests. Inspect the Playwright report (`npx playwright show-report` if needed) to debug and resolve any issues.
- **Extending Test Coverage**: If you introduce a new feature, page, or routing path, you must add corresponding navigation/UI test cases to [navigation.spec.ts](file:///d:/Code/UI/pdf-online/tests/navigation.spec.ts).
