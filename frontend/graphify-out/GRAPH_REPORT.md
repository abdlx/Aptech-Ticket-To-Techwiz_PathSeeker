# Graph Report - src  (2026-08-24)

## Corpus Check
- Corpus is ~8,068 words - fits in a single context window. You may not need a graph.

## Summary
- 67 nodes · 105 edges · 9 communities (7 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Shared Shell & Voice
- Admin Management Suite
- Career Discovery Flows
- User Journey Screens
- Starter Hero Illustration
- Vite Branding Asset
- Product Content Data
- React Branding Asset
- App Bootstrap Routing

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 6 edges
2. `Layered Platform Hero Illustration` - 4 edges
3. `App()` - 3 edges
4. `Brand()` - 3 edges
5. `careers` - 3 edges
6. `Upper Floating Rounded Panel` - 3 edges
7. `Lower Purple Textured Platform` - 3 edges
8. `Dashed Vertical Alignment Guides` - 3 edges
9. `React Logo` - 3 edges
10. `readLocation()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 2 thin omitted)

### Community 0 - "Shared Shell & Voice"
Cohesion: 0.18
Nodes (11): AppShell(), Brand(), Icon(), paths, copyForState, NaviAssistant(), poseForState, navItems (+3 more)

### Community 2 - "Career Discovery Flows"
Cohesion: 0.22
Nodes (4): CareerBankPage(), CareerDetailPage(), QuizPage(), RecommendationsPage()

### Community 3 - "User Journey Screens"
Cohesion: 0.29
Nodes (6): DashboardPage(), FeedbackPage(), ProfilePage(), ResourcesPage(), SavedPage(), StoriesPage()

### Community 4 - "Starter Hero Illustration"
Cohesion: 0.70
Nodes (5): Isometric Layered Composition, Layered Platform Hero Illustration, Lower Purple Textured Platform, Upper Floating Rounded Panel, Dashed Vertical Alignment Guides

### Community 5 - "Vite Branding Asset"
Cohesion: 0.40
Nodes (5): Dark Mode Color Adaptation, Blurred Purple and Cyan Highlights, Purple Lightning Mark, Vite Logo, Adaptive Parenthesis Frame

### Community 6 - "Product Content Data"
Cohesion: 0.40
Nodes (4): careers, quizQuestions, resources, stories

### Community 7 - "React Branding Asset"
Cohesion: 0.50
Nodes (4): Atomic Orbit Symbol, Cyan Vector Path, Iconify Logos Asset, React Logo

## Knowledge Gaps
- **10 isolated node(s):** `paths`, `poseForState`, `copyForState`, `adminNav`, `Isometric Layered Composition` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Icon()` connect `Shared Shell & Voice` to `Admin Management Suite`, `Career Discovery Flows`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `careers` connect `Product Content Data` to `Admin Management Suite`, `Career Discovery Flows`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `paths`, `poseForState`, `copyForState` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Management Suite` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._