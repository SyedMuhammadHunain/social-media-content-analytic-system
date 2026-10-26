# CodeScene Configuration Guide: Test Exclusion & Code Health Optimization

**Repository:** `social-media-content-analytic-system`  
**Purpose:** Ensure CodeScene evaluates pure production architecture without penalizing procedural test suites and end-to-end CDP scripts.

---

## 1. Automated Repository Configuration
The repository includes [`.codescene/code-health-rules.json`](../../.codescene/code-health-rules.json) in the project root:

```json
{
  "version": 1,
  "test_code_patterns": [
    "frontend/test/**",
    "**/*.test.mjs",
    "**/*.test.ts"
  ],
  "exclusions": [
    "frontend/test/**"
  ]
}
```

When CodeScene analyzes the repository, it uses these rules to mark test suites as **Test Code** rather than production business logic.

---

## 2. Web UI Configuration in CodeScene (Recommended)
If your CodeScene project settings override repository files:

1. Open your project on **[CodeScene Cloud](https://codescene.io/)**.
2. Click **Configuration** in the top navigation bar.
3. In the left sidebar, navigate to **Scope -> Files and Filters** (or **Exclusions**).
4. Under **Test Code Patterns**, add:
   ```text
   frontend/test/**
   **/*.test.mjs
   ```
5. (Optional) Under **Exclude Content / Files to Ignore**, add:
   ```text
   frontend/test/**
   docs/**
   ```
6. Click **Save Configuration**.
7. Click **Run Analysis** to re-evaluate the repository.

---

## 3. Expected Impact on Code Health Score
- **Before:** Test files (e.g. `feed_3_column_layout.test.mjs` with 330 lines of sequential browser automation) were flagged for complexity, lowering the average code health to **8.96**.
- **After:** Test complexity penalties are cleared. Only production UI/components are scored, lifting the overall repository score to **9.5+ (Green)**.
