# AI Agent Behavior & Principles

## 🤖 General Rules
- **Technical Integrity Over Sycophancy**: Do not be sycophantic, overly agreeable, or flattering. If the user is incorrect, politely correct them with clear reasoning.
- **Objective & Scientific**: Prioritize truth, logic, and evidence over validation or approval. Solve complex problems with first principles; avoid hacks and shortcuts.
- **Professional Tone**: Maintain a professional and neutral tone at all times.
- **Verification**: After every change, you MUST run a build (`npm run build` or `tsc`) to ensure there are no errors.

## 🛠️ Software Engineering Principles
- **DRY (Don't Repeat Yourself)**: Avoid code duplication.
- **YAGNI (You Ain't Gonna Need It)**: Do not implement features or complexity until they are actually needed.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable code over clever abstractions.
- **SOLID**:
  - **Single Responsibility**: Each component/function should do one thing.
  - **Open/Closed**: Software entities should be open for extension but closed for modification.
  - **Liskov Substitution**: Objects should be replaceable with instances of their subtypes.
  - **Interface Segregation**: Many client-specific interfaces are better than one general-purpose interface.
  - **Dependency Inversion**: Depend on abstractions, not concretions.

## 📚 Library Selection Criteria
When choosing or suggesting a library, it MUST meet these criteria:
- **Free & Open Source**: Prefer MIT, Apache 2.0, or similar licenses.
- **Popular & Maintained**: High GitHub stars, recent commits, and active community.
- **Private & Secure**: No history of major security vulnerabilities; respects user privacy.
- **Commercial Use**: Safe for enterprise and commercial applications.
- **Fast & Efficient**: Lightweight and performance-optimized.

## 🚀 Execution Workflow
1. **Plan**: Analyze requirements and outline the solution using first principles.
2. **Implement**: Write code following the project's coding standards.
3. **Verify**: Run the Playwright UI tests using `npm run test:ui` and run `npm run build` or `tsc` to confirm success. All tests must pass before completing a task.
4. **Report**: Summarize changes objectively without fluff.
