# Spec: CodeScene CLI Tool Installation & Live Code Health Analysis

## Objective
Install the official CodeScene standalone CLI tool (`cs`) in the local Linux environment, verify execution, run a live Code Health evaluation across the Social Media Content Analysis System (SMCAS) codebase (both Java microservices and React frontend), and capture the findings in `docs/reports/codescene-live-analysis-report.md`.

---

## Tech Stack & Artifacts
- **CLI Binary:** CodeScene CLI (`cs` for Linux x86_64)
- **Installation Script:** Official CodeScene Enterprise/Cloud installer (`https://downloads.codescene.io/enterprise/cli/install-cs-tool.sh`)
- **Configuration:** [`.codescene/code-health-rules.json`](../../.codescene/code-health-rules.json) (test exclusions & file filters)
- **Target Location:** `~/.local/bin/cs`
- **Output Report:** `docs/reports/codescene-live-analysis-report.md`

---

## Commands
```bash
# 1. Install CodeScene CLI headless
curl https://downloads.codescene.io/enterprise/cli/install-cs-tool.sh | sh -s -- -y

# 2. Verify binary installation and version
~/.local/bin/cs --version

# 3. Check authentication status
~/.local/bin/cs auth status

# 4. Review specific critical files or full delta against branch
~/.local/bin/cs review frontend/src/app/feed/NewsFeedPage.tsx
~/.local/bin/cs review frontend/src/context/AuthContext.tsx

# 5. Run delta analysis against main branch
~/.local/bin/cs delta main --output-format json
```

---

## Project Structure
```
~/.local/bin/
└── cs                                              # CodeScene CLI binary executable
.codescene/
└── code-health-rules.json                          # Repo test code patterns and exclusions
docs/
├── specs/
│   └── SPEC-codescene-cli-integration.md          # This specification
└── reports/
    └── codescene-live-analysis-report.md           # Live findings & Code Health score report
```

---

## Code Health Boundaries & Standards
- **Always do:**
  - Enforce test exclusions (`frontend/test/**`, `**/*.test.mjs`, `**/*.test.java`) defined in `.codescene/code-health-rules.json`.
  - Record Code Health scores on the 1.0–10.0 scale for both frontend and backend modules.
  - Target Green Code Health (score ≥ 9.0/10.0) across all production components.
- **Ask first:**
  - Triggering browser OAuth flow (`cs auth login`) if headless interaction is preferred.
  - Adding pre-commit hooks to `.git/hooks/pre-commit`.
- **Never do:**
  - Commit personal access tokens (`CS_ACCESS_TOKEN`) or credentials to git.
  - Modify production architecture solely to bypass legitimate CodeScene warnings without understanding root causes.

---

## Testing & Verification Strategy
1. **Binary Check:** Confirm `cs` installs cleanly without root requirement and outputs valid version string.
2. **Analysis Check:** Run `cs review` against core frontend components and backend controllers.
3. **Report Generation:** Compile code health scores, hotspots, and detected smells into `docs/reports/codescene-live-analysis-report.md`.

---

## Success Criteria
1. `cs` binary is installed and executable in `~/.local/bin/cs`.
2. CodeScene accurately evaluates codebase using `.codescene/code-health-rules.json`.
3. Live Code Health assessment report published to `docs/reports/codescene-live-analysis-report.md` documenting repository health score (Target: ≥ 9.5).

---

## Approved Decisions
- **Usage Model:** On-demand manual CLI tool only (`cs review`, `cs delta`). No invasive git pre-commit hooks.
- **Cloud Project Link:** The user's active CodeScene web project is already connected to this GitHub repository (`SyedMuhammadHunain/social-media-content-analytic-system`). Local CLI commands complement the cloud dashboard.
