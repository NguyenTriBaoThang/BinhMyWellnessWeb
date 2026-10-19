# Implementation Tasks

Initial audit: 2026-10-19, before implementation changes. At that point `main` was one commit ahead of `origin/main`, with no `AGENTS.md`; the app was Next.js 14 App Router, TypeScript, Prisma, and PostgreSQL, with static monthly content and a fixed-buffer itinerary page. The current worktree adds the planner, verification/availability flows, saved itineraries, multi-provider booking requests, and fee reconciliation described below. No production database or deployment was touched.

Reference review: the LocalExplorerAI source was cloned into a temporary directory and its current planner, chat route, and routing service implementations were read. Its useful patterns are hard-feasibility filtering before ranking, pluggable routing providers, explicitly bounded demo routing, structured chat output, and a separately reported local fallback mode. Its architecture uses FastAPI/PostGIS and is not suitable to copy into this Vercel Next.js application. The reference repository is MIT licensed; adapt patterns without copying substantial code, and retain attribution/license if any code is reused.

Baseline checks: `tsc --noEmit --incremental false` passed; `next lint` passed with no warnings or errors.

| Task | Status | Current evidence / remaining work |
|---|---|---|
| T01 Repository audit | DONE | Local code/schema/auth/deployment config and actual reference planner/chat/routing implementation inspected. |
| T02 Data and migrations | PARTIAL | Added verification, dated availability, saved itineraries, booking idempotency, and fee reconciliation fields in additive migrations. Baseline adoption and rollback guidance are documented. Prisma client generation and TypeScript checks pass. Disposable PostgreSQL migration and transaction checks remain outstanding. |
| T03 Provider data and availability | PARTIAL | Provider UI can publish dated slots; admin UI verifies service, coordinates, area, and opened slots. Existing monthly destination stories remain static and are not treated as verified planner inputs. |
| T04 Feasibility planner | DONE | Deterministic planner checks verified data, exact slots, group capacity, price basis, budget, duration, breaks, route ETA, and return deadline. Route calls are cached and capped per request. |
| T05 Gemini integration | DONE | Server-only structured constraint extraction, bounded input/output and timeout, redaction, rate limits, and deterministic fallback. Requires a configured Gemini key to verify the live integration. |
| T06 Map and routing | PARTIAL | Leaflet renders verified stop coordinates; Goong adapter returns routes/ETA only when configured and valid. No live Goong credentials were available for an integration check. |
| T07 Chat/map/itinerary UI | DONE | Responsive planner UI sends constraints, displays assumptions and route limits, saves/loads/edits itineraries, and requires an explicit confirmation before sending booking requests. |
| T08 Multi-provider booking | PARTIAL | Per-stop requests use serializable transactions, shared slot advisory locks, capacity rechecks, idempotency, and itinerary status aggregation. Concurrency checks against disposable PostgreSQL remain outstanding. |
| T09 Reporting and 8% fee | PARTIAL | Role-scoped reconciliation lets providers record net receipts; the platform fee is calculated at 8%, and admins separately confirm receipt. There is no payment processor or automated transfer. Existing review flows remain in place. |
| T10 Security and operations | PARTIAL | Server-side role checks, production persistent-storage guard, server-only secrets, request timeouts, HMAC-keyed DB rate limits, and safe fallback are present. Production configuration is intentionally unverified. |
| T11 Acceptance checks | PARTIAL | Eight planner tests pass, covering verified eligibility, capacity, price, budget, route absence, return deadline, caching/request limits, and invalid requests. API authorization, database concurrency, migration, and browser/mobile flows need a disposable test environment. |
| T12 Handover | PARTIAL | Environment variables and migration procedure are documented. Production deployment, credentials, staging comparison, and end-to-end integration remain for the operator. |

No production database or deployment was touched. `npm run test:planner`, `next lint`, and `tsc --noEmit` pass. The repo has no confirmed disposable PostgreSQL or browser automation environment, so database/API concurrency and browser flows were not executed.
