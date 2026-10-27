# Spec: CT-263 Academic Defense & Final Submission Package

## Objective
Author the complete, publication-grade Academic Defense & Final Project Submission Package for the **Social Media Content Analysis System (SMCAS)** for course **CT-263 Object-Oriented Analysis & Design / Distributed Systems** at **NED University of Engineering & Technology**.

The package bridges the running production-grade code (8 Java Spring Boot microservices, React 19 + Meta Astryx client, MongoDB Atlas NoSQL cluster, Microsoft Azure Blob Storage, and 100% passing E2E Chrome CDP tests) with the rigorous academic documentation required for project submission, viva voce defense, and course grading.

---

## Assumptions
1. Target course is **CT-263 Object-Oriented Analysis & Design** at NED University of Engineering & Technology.
2. Primary student author / lead developer is **Syed Muhammad Hunain** (ID: `user_hunain`).
3. Documentation follows standard academic engineering format (Abstract, Introduction, Theoretical Architecture, UML 2.5 Diagrammatic Modeling, Implementation Details, Cloud Infrastructure, Empirical Verification, Viva Defense).
4. Presentation slide deck should be formatted in standard Markdown with Marp slide markers (`---`, `theme: gaia`, `paginate: true`), allowing instant rendering to PDF slides, PowerPoint, or web view.
5. All architecture descriptions, endpoints, schemas, and metrics must strictly cite actual committed code, verifiable tests, and real cloud endpoints.

---

## Deliverables & Project Structure

```
docs/
├── specs/
│   └── SPEC-academic-defense-package.md            # This specification
└── academic/
    ├── CT263-Final-Comprehensive-Project-Report.md # Formal academic submission report
    ├── CT263-Project-Defense-Presentation-Slides.md# 15-Slide Marp presentation deck
    └── CT263-Viva-Defense-QnA-and-Demo-Script.md   # Step-by-step 5-min demo & viva defense Q&A
```

### Deliverable 1: Comprehensive Project Report (`CT263-Final-Comprehensive-Project-Report.md`)
A formal academic manuscript covering:
1. **Executive Abstract & Project Metadata:** Course info, student details, objectives, key accomplishments.
2. **Problem Statement & Course Specification Mapping:** Line-by-line traceability against `Social Media Content Analysis System.pdf` (CT-263).
3. **High-Level System Architecture:** Event-driven CQRS microservices topology, API Gateway routing, reactive patterns.
4. **Unified Modeling Language (UML 2.5) Diagrams:**
   - Use Case Diagram (Actors: Content Creator, Follower, Consumer, System).
   - Domain Model & Class Diagram (including `Post`, `Comment`, `Like`, `Follow`, `Notification`, `UserProfile`).
   - Sequence Diagrams (Post creation with Azure direct upload, Fan-out newsfeed generation, Real-time notifications).
   - Activity Diagram (Authentication lifecycle, session termination with logout feedback message).
   - Component & Deployment Diagram (Docker/Spring Boot microservices, Atlas cluster, Azure Blob containers).
5. **Database Architecture & Schema Design:** MongoDB Atlas NoSQL schema analysis (`PostsDB`, `LikesDB`, `FollowDB`, `CommentsDB`, `FeedDB`, `UsersDB`, `NotificationsDB`).
6. **Frontend User Interface Engineering:** Meta Astryx (`@astryxdesign/core`) design tokens, accessibility, responsive desktop/tablet/mobile layouts.
7. **Cloud Engineering & Storage Pipeline:** Microsoft Azure Blob Storage pre-signed SAS direct-to-cloud PUT protocol.
8. **Empirical Verification & Quality Gates:** Multi-module test results, latency benchmarks (<2.0s fan-out SLA), headless Chrome CDP certification.
9. **Conclusion & Future Directions:** Summary of academic and engineering learnings.

### Deliverable 2: Project Defense Presentation Slides (`CT263-Project-Defense-Presentation-Slides.md`)
A structured 15-slide Marp-compatible slide deck:
- Slide 1: Title & Academic Affiliation
- Slide 2: Problem Statement & Motivation (50M posts/day, 216 TB/day media scale)
- Slide 3: Core Architectural Principles (CQRS, Asynchronous Fan-Out, Cloud-Native)
- Slide 4: High-Level Microservices Topology (8 Spring Boot Services + Gateway)
- Slide 5: UML Structural Modeling (Class & Domain Diagram)
- Slide 6: UML Behavioral Modeling (Sequence Diagrams & Communication Flows)
- Slide 7: Cloud Data Pipeline: MongoDB Atlas Distributed Collections
- Slide 8: Cloud Media Pipeline: Azure Blob Storage Pre-Signed SAS Direct Upload
- Slide 9: Frontend Architecture: Meta Astryx Design System Fidelity
- Slide 10: Real-Time Newsfeed Fan-Out Engine (<20ms Read SLA)
- Slide 11: Real-Time Creator Analytics Telemetry Dashboard
- Slide 12: Notification System & Nested Discussion Tree (CT-263 PDF Gap Resolution)
- Slide 13: Empirical Verification & Chrome CDP Visual Testing Proof
- Slide 14: Live Demonstration Protocol (5 Key User Journeys)
- Slide 15: Conclusion, Key Takeaways & Q&A

### Deliverable 3: Viva Defense Q&A and Demo Script (`CT263-Viva-Defense-QnA-and-Demo-Script.md`)
A strategic viva defense manual containing:
1. **5-Minute Live Demonstration Walkthrough:** Exact step-by-step protocol to run in front of course examiners, including commands, URLs, actions to click, and expected UI behaviors.
2. **Examiner Anticipated Technical Questions & Authoritative Answers:**
   - *Why CQRS instead of standard monolithic CRUD?*
   - *How do you prevent Gateway bandwidth exhaustion on 216 TB/day media uploads?*
   - *How does the Newsfeed Fan-Out engine maintain sub-second read SLA for users with high follower counts?*
   - *Why use MongoDB Atlas NoSQL instead of traditional relational PostgreSQL/MySQL?*
   - *How does the system ensure zero plain-text credential leaks in version control?*
   - *Why Meta Astryx strictly over generic Tailwind or Bootstrap CSS?*
   - *How does the reactive notification service handle asynchronous subscriber delivery?*
3. **Architecture Reference Cheat Sheet:** Quick-look table of ports, services, databases, and key design patterns for instant recall during viva examination.

---

## Commands
```bash
# Verify all existing tests pass
mvn test
npm run test:unit --prefix frontend

# Verify E2E Chrome CDP verification test
node tests/e2e-final-compliance.test.mjs

# Verify markdown files formatting and links
npx oxlint
```

---

## Boundaries
- **Always do:**
  - Anchor every diagram, endpoint, and metric to actual code committed in the repository (`backend/`, `frontend/`, `tests/`).
  - Preserve strict academic tone suitable for university faculty evaluation.
  - Cross-link related architectural specifications and verification reports with clickable `file://` links.
- **Ask first:**
  - Altering student name or course code metadata.
  - Adding new unverified dependencies or external presentation tools.
- **Never do:**
  - Include any plain-text API keys, Azure shared keys, or MongoDB Atlas passwords in documentation.
  - Fabricate benchmarks or metrics not backed by test logs.

---

## Success Criteria
1. `CT263-Final-Comprehensive-Project-Report.md` is fully written, detailed, and completely addresses all 10 sections of the CT-263 course syllabus.
2. `CT263-Project-Defense-Presentation-Slides.md` contains 15 formatted Marp slides with visual diagrams, code excerpts, and architecture callouts.
3. `CT263-Viva-Defense-QnA-and-Demo-Script.md` provides an executable 5-minute demo procedure and comprehensive answers to core examiner viva questions.
4. All artifacts committed to `origin/main` and `origin/Hunain-Backend`.

---

## Open Questions
1. Do you need any specific faculty member's name or university department added to the report header (e.g. *Department of Computer & Information Systems Engineering, NEDUET*)?
2. Would you prefer the presentation slides configured with Marp's `gaia`, `uncover`, or `default` theme?
