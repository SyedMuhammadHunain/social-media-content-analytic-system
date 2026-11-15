# Statement of Intent: Mobile Light Theme Contrast & Legibility Pass

## Confirmed Intent
- **Outcome:** Replace hardcoded light colors (`#f1f5f9`, `#ffffff`, `#94a3b8`) in mobile CSS (`@media (max-width: 767px)`) with dynamic Meta Astryx theme tokens (`var(--color-text-primary)`, `var(--color-text-secondary)`) so post body text, author headings, timestamps, and mobile feed typography adapt properly and remain legible across both light and dark themes.
- **User:** Mobile and Android users viewing the social media feed in light theme.
- **Why now:** Post body font and feed typography are currently invisible (white-on-white) on mobile in light theme due to hardcoded `#f1f5f9 !important` and `#ffffff !important` rules.
- **Success:** Post body text, author headings, timestamps, and mobile feed components meet WCAG AA contrast standards and remain clearly legible in both light and dark themes on mobile screen widths (≤ 767px).
- **Constraint:** Strictly use Meta Astryx design tokens (`var(--color-text-primary)`, `var(--color-text-secondary)`); do not break desktop styling or add third-party CSS.
- **Out of scope:** Desktop theme provider refactoring, backend feed API changes, or unrelated feature modifications.
