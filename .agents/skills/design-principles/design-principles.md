# Skill: Design Principles & Software Quality

## 📐 Architecture Design
- **Single Responsibility (SRP)**: Extract logic into custom hooks (`useFeatureLogic.ts`) and keep UI components focused on rendering.
- **Composition**: Use the children prop and component composition to avoid "prop drilling" and complex conditional logic.
- **Dependency Inversion**: Pass functions or configuration as props instead of hardcoding global dependencies inside components.

## 🧱 Coding Standards (React/TS)
- **Immutability**: Always treat state as immutable. Use functional updates (`setItems(prev => [...prev, newItem])`).
- **Clean Code**: Use descriptive naming (`isProcessing` instead of `flag`). Keep functions small (< 20 lines where possible).
- **Early Returns**: Use guard clauses to handle null/undefined/error states early:
  ```tsx
  if (!data) return <Spinner />;
  if (error) return <ErrorMessage />;
  return <MainContent />;
  ```
- **Consistent Exports**: Prefer named exports over default exports for better IDE support and refactoring safety.

## 🚀 Performance Optimization
- **Lazy Loading**: Use `React.lazy()` for route-level splitting.
- **Memoization**: Only use `memo`, `useMemo`, and `useCallback` when profiling indicates a performance bottleneck.
- **Bundle Size**: Avoid importing entire libraries; use tree-shaking friendly imports (e.g., `import { Box } from '@chakra-ui/react'`).

## 🛡️ Privacy & Security
- **Local-First**: Never send user PDF data to a server. All processing must remain in the user's browser/local environment.
- **Secure Defaults**: Sanitize inputs and avoid `dangerouslySetInnerHTML` unless strictly necessary and sanitized.
