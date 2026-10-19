ALTER TABLE "itineraries"
  ADD COLUMN IF NOT EXISTS "returnTravelMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "returnDistanceM" INTEGER,
  ADD COLUMN IF NOT EXISTS "returnRouteProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "returnRouteGeometry" TEXT;
