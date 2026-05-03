# Skill: Frontend Engineering (React 19 & Chakra UI 3)

## 🏗️ Core Competencies
- **React 19 Hooks**: Expertise in `useTransition`, `useDeferredValue`, and the new `use` API for clean asynchronous logic.
- **TypeScript 5.x**: Advanced typing patterns, including discriminated unions, template literal types, and type-safe event handling.
- **Chakra UI 3.x**: Proficient in the latest Chakra design system, utilizing the `css` prop, variant API, and high-performance layout components.

## 🔄 Component Lifecycle & State
- **State Colocation**: Keep state as close to where it's used as possible. Only lift state up when shared by multiple siblings.
- **Side Effects**: Use `useEffect` sparingly. Prefer event handlers or custom hooks for logic triggered by user actions.
- **Forms**: Use uncontrolled components with `FormData` or controlled components with `useState` depending on complexity.

## 🖼️ UI/UX Patterns
- **Responsive Layouts**: Use `SimpleGrid`, `Flex`, and `Stack` with breakpoint-aware props.
- **Skeleton States**: Implement `Skeleton` and `Spinner` to improve perceived performance during data loading.
- **Error Boundaries**: Wrap features in Error Boundaries to prevent the entire app from crashing on local failures.

## 📦 Asset Management
- **Icons**: Use `lucide-react` for consistent, tree-shakable iconography.
- **Animations**: Use `framer-motion` for meaningful transitions and micro-interactions.
- **Images**: Optimize images and use `chakra.img` or `Box as="img"` with proper object-fit.
