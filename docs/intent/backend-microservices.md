# Confirmed Statement of Intent: Backend Microservices Architecture

- **Outcome:** Build a Java 21 & Spring Boot 3.4 microservices backend strictly aligned 1:1 with the 8 services and 5 NoSQL collections in the course PDF, backed by Microsoft Azure Blob Storage and MongoDB Atlas (GitHub Student Developer Pack).
- **User:** Syed Muhammad Hunain (course project submission and evaluation).
- **Why now:** Frontend is complete and verified; backend is the next requirement to deliver.
- **Success:** Architecture, API contracts, and MongoDB Atlas schemas documented in `docs/backend/` and approved by you first, followed by incremental step-by-step implementation.
- **Constraint:** No Docker required; credentials loaded via environment variable placeholders (`${MONGODB_URI}` and `${AZURE_STORAGE_CONNECTION_STRING}`) with local defaults so secrets are never committed; step-by-step pace.
- **Out of scope:** Docker containers, hardcoded credentials, and premature full-codebase generation.
