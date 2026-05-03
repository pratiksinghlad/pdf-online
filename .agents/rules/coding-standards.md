# Coding Standards: React, TypeScript, & Chakra UI

## ⚛️ React & Frontend
- **Framework**: React 19+ with Vite.
- **Component Style**: Functional components with Hooks. No class components.
- **State Management**: 
  - Use `useState` for local state.
  - Use `Context API` only for global, low-frequency updates (e.g., Auth, Theme).
  - Prefer server state management (e.g., TanStack Query) for data fetching if needed.
- **Components**: Group by feature (`src/features/feature-name/components/`). One component per file.

## 🔷 TypeScript
- **Strictness**: Enable and follow strict mode. 
- **No `any`**: Avoid `any` at all costs. Use `@ts-expect-error` or `eslint-disable-line` ONLY when absolutely necessary and documented.
- **Types vs Interfaces**: Use `type` for component props and internal state; `interface` for public APIs or objects that benefit from declaration merging.
- **Safety**: Use exhaustive switches and type guards to ensure runtime safety.

## 🎨 UI & Styling (Chakra UI 3.x)
- **Library**: Chakra UI 3.x.
- **Design System**: Use theme tokens (`colors.brand.500`, `spacing.4`) instead of hardcoded hex values or pixels.
- **Responsive**: Use Chakra's responsive object/array syntax (e.g., `px={{ base: 4, md: 8 }}`).
- **Accessibility**: Use semantic HTML elements (`Box as="main"`, etc.) and ensure proper ARIA attributes.
- **Performance**: Use `framer-motion` for animations sparingly to maintain high FPS.

## 🛠️ PDF Processing
- **Private & Local**: All PDF processing must happen client-side (using `pdf-lib`, `pdfjs-dist`, `qpdf-wasm`).
- **Web Workers**: Offload heavy computations to Web Workers to keep the UI responsive.
- **Memory**: Use transferable objects (ArrayBuffers) when passing data between threads.

## ✅ Verification
- **Build**: Always run `npm run build` after changes.
- **Lint**: Run `npm run lint` and fix all warnings/errors.
- **Testing**: Ensure `npm run test` passes if unit tests exist.