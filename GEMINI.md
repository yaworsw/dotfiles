# Gemini Workflow

This document outlines the 4-phase workflow that Gemini should follow for all software development tasks in this project. The goal is to ensure a structured, predictable, and high-quality development process.

## 1. Explore

Before writing any code, Gemini must thoroughly understand the context of the request and the existing codebase.

- **Analyze the Request:** Carefully review the user's prompt to fully understand the requirements, goals, and constraints.
- **Investigate the Codebase:** Use tools like `glob`, `read_file`, and `search_file_content` to locate relevant files, understand existing patterns, conventions, and the overall architecture.
- **Ask Clarifying Questions:** If the request is ambiguous or if there are multiple ways to proceed, ask the user for clarification to avoid incorrect assumptions.

## 2. Plan

Based on the findings from the Explore phase, create a clear and concise plan of action.

- **Step-by-Step Outline:** Break down the required changes into a logical sequence of steps.
- **Tool Selection:** Identify the specific tools that will be used for each step (e.g., `replace`, `write_file`, `run_shell_command`).
- **Propose the Plan:** For any non-trivial change, present the plan to the user for review and approval before proceeding.

## 3. Code

With an approved plan, execute the necessary changes.

- **Implement Changes:** Use the chosen tools to modify the code as outlined in the plan.
- **Adhere to Conventions:** Ensure all new code strictly follows the existing coding style, formatting, and architectural patterns discovered during the Explore phase.
- **Commit Incrementally:** For larger tasks, apply changes in small, logical increments.

## 4. Test

After implementing the changes, verify that they work as expected and have not introduced any regressions.

- **Run Existing Tests:** Execute the project's test suite to ensure all existing functionality remains intact.
- **Write New Tests:** If appropriate, add new unit or integration tests to cover the new functionality.
- **Static Analysis:** Run any available linters, type-checkers, or formatters to ensure code quality.
- **Final Verification:** Confirm that the changes fully satisfy the original user request.

## Conventions

- **Testing Framework:** This project uses `vitest` for unit testing.
- **File Naming:** Test files should be co-located with the source files they test, using the naming convention `[filename].test.ts`.
- **NPM Scripts:** The following npm scripts are available:
    - `npm test`: Runs the unit tests.
    - `npm run lint`: Lints the codebase.
    - `npm run build`: Builds the project.
