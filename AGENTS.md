# AI Agent Guidelines & Repository Conventions

This document outlines the workflows, coding standards, and skill conventions for AI agents collaborating on the Social Media Content Analysis System.

## Architecture & Technology Stack
- **Design System:** Strictly Meta Astryx (`@astryxdesign/core`). Do not introduce ad-hoc CSS or third-party UI libraries unless officially approved.
- **Frontend Framework:** React 19, TypeScript 5.8, Vite 8.
- **Backend Architecture (Planned):** Java 21, Spring Boot 3, MongoDB Atlas NoSQL, Azure Blob Storage.
- **Testing:** Node.js native test runner (`node:test`, `node:assert`) + Chrome DevTools Protocol (CDP).

## Agent Workflow Disciplines
1. **Interview Before Building (`/interview-me`):**
   - Clarify underspecified requirements one question at a time before generating code.
2. **Spec-Driven Development (`/spec-driven-development`):**
   - Every major capability requires a written specification in `docs/specs/SPEC-<feature>.md` before implementation.
3. **Task Planning (`/planning-and-task-breakdown`):**
   - Maintain active task state in `tasks/plan.md` and `tasks/todo.md`.
4. **Incremental Implementation (`/incremental-implementation`):**
   - Build in thin, test-verified slices. Commit each slice independently. Never write large untested changesets.
5. **Quality Gates & Review (`/code-review-and-quality`):**
   - Verify changes across the 5 axes: Correctness, Readability, Architecture, Security, Performance.
   - Run `npx tsc -b`, `npm run lint`, and `npm test` before merge.

## Directory Layout
- `docs/specs/`: All feature specs.
- `docs/reports/`: Verification reports, code review reports, and screenshots.
- `docs/requirements/`: Academic requirements and course material.
- `docs/intent/`: Interview intent extraction documents.
- `frontend/`: React + Astryx client application.
- `tasks/`: Active planning and todo files.
