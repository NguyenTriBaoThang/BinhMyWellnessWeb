# Vercel Preview Demo

This guide prepares a demo deployment without changing Production.

## What is known from this checkout

- This is a Next.js App Router application and `vercel.json` selects the Next.js framework.
- Prisma expects PostgreSQL through `DATABASE_URL` and `DIRECT_URL`.
- `.env.example` contains Supabase placeholders. It does not identify the database currently attached to any Vercel project.
- This checkout has no `.vercel/project.json`, and the Vercel CLI is not available in PATH. The Vercel account, project, environment variables, deployment protection, and database therefore have not been inspected.

## Preview environment

1. Connect the GitHub repository to the intended Vercel project and use a Preview deployment from a dedicated demo branch or pull request.
2. Create or select a disposable PostgreSQL database for Preview. It must not share Production data or credentials. Record which provider owns it; do not infer the provider from the current `.env.example`.
3. Set these variables for the **Preview** target only:

   - `DATABASE_URL`: pooled PostgreSQL URL, if the provider supplies one.
   - `DIRECT_URL`: direct PostgreSQL URL for Prisma migrations.
   - `SESSION_SECRET`: unique random value of at least 32 characters.
   - `BM_ENABLE_TEST_BOOKINGS=true` and `NEXT_PUBLIC_BM_ENABLE_TEST_BOOKINGS=true` only if the demo needs the public sample customer/provider accounts and test-only catalogue entries. Keep both `false` in Production. The quick role switch never grants admin access.
   - `GEMINI_API_KEY`, `GEMINI_MODEL`, `GOONG_API_KEY`, `GOONG_DIRECTIONS_URL`, and `ROUTING_TIMEOUT_MS` only when those integrations are intended for this Preview deployment. Keep Gemini and Goong keys server-side.
   - `NEXT_PUBLIC_MAPTILER_KEY` to use MapTiler map tiles. This key is sent to the browser, so restrict its allowed origins in MapTiler. Without it, the map uses OpenStreetMap tiles.

   Preview sample logins are public test identities. Use this mode only with disposable data. Do not create a real customer/provider account in the demo database.

## Database setup

Use the procedure in [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md):

- On a new, empty Preview database, apply the checked-in migrations with `npx prisma migrate deploy`.
- If Preview points to a database that already has application tables, compare it with `prisma/migrations/0_init/migration.sql` first. Record `0_init` as applied only if the schemas match exactly, then apply and check the additive migrations.
- Seed only the disposable Preview database, after reviewing the fixture records. Never run seed or `db push` against Production.
- Do not mark demo fixtures as verified real services. The planner intentionally excludes `testOnly` services and any service or availability that has not been explicitly verified.

For an itinerary demo, an administrator must verify a published service, its Bình Mỹ coordinates, and the provider's dated availability. The planner then filters for active providers, verified coordinates, verified slots, group capacity, prices, and time constraints. If the Preview database has no such records, the correct demo result is that no verified slot is available.

## Preview smoke flow

1. Sign in to the Preview deployment with a sample customer or provider account if test mode is enabled.
2. As a provider, publish a dated slot in the disposable database.
3. As an administrator, verify the service, location, and slot.
4. As a customer, use the chat suggestions, select a stop from the itinerary panel, and confirm the map focuses that marker.
5. Save the itinerary and submit a booking request only after the explicit confirmation. The request flow does not collect payment.
6. Confirm the fallback messages when Gemini or Goong is not configured; do not claim live AI extraction or road ETA unless the corresponding key works in Preview.

## Production boundary

Keep the Production database URL, session secret, and integration keys separate from Preview. Do not promote the Preview database, sample accounts, seed data, or test-booking flags into Production. Before a production deployment, compare the migration baseline with a staging clone and follow the approval process in [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md).
