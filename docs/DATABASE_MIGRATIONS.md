# Database migrations

The repository previously had a Prisma schema but no migration history. `prisma/migrations/0_init` records the schema that existed before AI planning work. Additive migrations add service verification and dated availability, itinerary persistence and idempotency, AI rate/usage logs, and booking net-receipt/8% fee reconciliation fields. Existing booking and service rows are retained.

## Existing database

Do not run this against production until a current backup is verified and the same steps have succeeded on a staging clone.

1. Confirm `DATABASE_URL` and `DIRECT_URL` point to the intended staging database. Keep both values server-side.
2. Compare the live schema with `prisma/migrations/0_init/migration.sql`. The baseline migration must describe the already-existing schema before it is marked as applied.
3. If and only if the schemas match, record the baseline without executing its create-table statements:

   ```sh
   npx prisma migrate resolve --applied 0_init
   ```

4. Apply all additive migrations and verify the new columns/tables:

   ```sh
   npx prisma migrate deploy
   npx prisma migrate status
   ```

If the baseline does not match, stop and reconcile on a database backup/staging clone. Do not use `migrate reset`, `db push`, or seed to reconcile a production database.

## New database

Set the development database URLs, then run `npx prisma migrate deploy`. This applies the baseline followed by additive migrations. Seed only a disposable development database.

## Rollback

The migrations are additive and keep legacy fields/data. For an application rollback, redeploy the previous application version and leave the additive schema in place. Do not drop availability, itinerary, AI logging, or fee reconciliation fields after they contain operational data; a destructive rollback requires a separately reviewed backup and recovery procedure.

## Server-only integrations

Set `GEMINI_API_KEY`, `GEMINI_MODEL`, `GOONG_API_KEY`, and `ROUTING_TIMEOUT_MS` in the server environment. Keep these out of `NEXT_PUBLIC_*` variables. Without Gemini the planner uses the deterministic extraction fallback; without Goong it shows stops without invented road ETAs. No live provider credentials are included in this repository.

The 8% platform fee is calculated from a provider-recorded net receipt for a completed booking. An administrator separately records that the fee was received. This is reconciliation bookkeeping only; it does not collect or transfer money.

No database connection, migration application, seed, or production deployment was performed while preparing these files. Before applying migrations, run the full sequence against a disposable PostgreSQL database; that environment was not available during this implementation.
