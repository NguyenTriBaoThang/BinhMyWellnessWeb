# Tiến độ triển khai Bình Mỹ Du Ký

Scope comes from the redesign brief supplied for this repository. The old database and any hosted data are out of scope: this work changes application code and local repository content only. Do not migrate, reset, seed, inspect, or delete a remote database; do not deploy Production.

## Tiến độ

| Task | Status | Result / evidence | Checks |
| --- | --- | --- | --- |
| T01 Inventory and scope | DONE | Inspected the existing Next.js app and research bundle. Kept the old database app preserved under `legacy/`; active runtime no longer depends on its APIs, Prisma or AI integrations. | No DB connection or deployment. |
| T02 Brand and old flows | DONE | Replaced Wellness/365 and chat/booking flows with Bình Mỹ Du Ký discovery and local itinerary UX. | Production build. |
| T03 JSON data and validator | DONE | Added typed static JSON repository, schemas and checks for references, evidence, coordinates, hours, seasons, prices, routes and image publication. | `typecheck`, `prebuild` asset check. |
| T04 Place research and gaps | DONE_WITH_GAPS | Normalized five named places and one article-only activity with source records. Unknown coordinates, operation, hours, price and duration remain unverified/null. | See `DATA_GAPS.md`. |
| T05 Home, explore and detail | DONE | Added home, four category discovery, search and filters, map/list view and sourced detail pages. | Production build. |
| T06 Map and routing | DONE_WITH_DATA_BLOCKER | Map accepts only verified Bình Mỹ coordinates; itinerary uses directed route matrix/GeoJSON. Supplied data has no verified pins or route edges, so no route or ETA is invented. | Planner tests; build. |
| T07 Deterministic itinerary engine | DONE | Added bounded deterministic planning, capacity, age, time, schedule, budget, child pricing, shared-cost and route constraints. AI is not used. | `npm run test:planner`: 9 passed. |
| T08 Itinerary form and timeline | DONE_WITH_DATA_BLOCKER | Added trip inputs, alternatives, timeline, edits, map, local save/reopen, export/print and share link. Current verified dataset cannot produce a feasible route. | Build; planner regression suite. |
| T09 Local storage and editor | DONE | Added versioned validated browser data, favorites, visited places, saved itineraries and local-only JSON editor/import/export. | Typecheck and build. |
| T10 UX and accessibility | DONE | Added responsive layouts, keyboard-visible focus, reduced-motion and print behavior, truthful empty/error states. | Source review, lint and build; no browser automation configured. |
| T11 Build and automated checks | DONE | Build does not need database or AI credentials. | `npm run lint`, `npm run typecheck`, `npm run test:planner`, `npm run build`, asset check passed. |
| T12 Handover | DONE | Updated README, architecture, content/image policy and Vercel deployment instructions. | Review docs and links. |

## Runtime boundaries and demo status

- Pages are `/`, `/explore`, `/experiences/[slug]`, `/itinerary`, `/my` and `/editor`.
- Runtime reads bundled JSON only. It has no database, login, Gemini, map API key or paid routing dependency.
- Five named places and one unsited activity are included as reported source material. Facts without primary evidence remain unknown.
- No verified coordinates or routing edges exist yet; no place is pinned or route-eligible. All nine provided images remain unpublished because permission is unverified.
- The Vercel guide describes a Preview deployment. No deployment was made in this task.

