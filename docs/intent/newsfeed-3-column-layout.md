# Intent: News Feed 3-Column Social Discovery Architecture

- **Outcome:** Enrich News Feed with a 3-column desktop layout featuring `FeedShortcutsCard` on the Left Rail, and `TrendingTopicsCard`, `WhoToFollowCard`, and `PlatformInfoFooter` on the Right Rail with reactive in-place feed filtering.
- **User:** Creator Syed Muhammad Hunain and academic OOAD evaluators reviewing realistic social functionality.
- **Why now:** Desktop feed feels empty on wide displays; adding interactive discovery rails creates a production-grade platform feel before backend development begins.
- **Success:** Clicking a trending hashtag or shortcut filters feed in-place with an active filter badge and "Clear" action; "Who to Follow" toggle syncs state across feed post cards; layout collapses cleanly on tablet and mobile; 100% tests pass.
- **Constraint:** Strictly Meta Astryx (`@astryxdesign/core`) components and tokens; zero ad-hoc CSS or third-party UI libraries.
- **Out of scope:** Backend search indexing, persistent database storage, and external recommendation machine learning pipelines.
