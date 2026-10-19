DO $$ BEGIN
  CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ServicePriceBasis" AS ENUM ('PER_PERSON', 'PER_GROUP', 'CONTACT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItineraryStatus" AS ENUM ('SAVED', 'BOOKING_REQUESTED', 'PARTIALLY_CONFIRMED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "services"
  ADD COLUMN IF NOT EXISTS "areaCode" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "locationVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "priceBasis" "ServicePriceBasis" NOT NULL DEFAULT 'PER_PERSON',
  ADD COLUMN IF NOT EXISTS "childPrice" INTEGER;

CREATE TABLE IF NOT EXISTS "service_availability" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "slot" TEXT NOT NULL,
  "capacity" INTEGER,
  "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
  "verifiedAt" TIMESTAMP(3),
  "sourceNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "service_availability_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_availability_capacity_check" CHECK ("capacity" IS NULL OR "capacity" > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_availability_serviceId_date_slot_key"
  ON "service_availability"("serviceId", "date", "slot");
CREATE INDEX IF NOT EXISTS "service_availability_date_status_idx"
  ON "service_availability"("date", "status");

DO $$ BEGIN
  ALTER TABLE "service_availability"
    ADD CONSTRAINT "service_availability_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "itineraries" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "adults" INTEGER NOT NULL,
  "children" INTEGER NOT NULL DEFAULT 0,
  "budgetVnd" INTEGER,
  "budgetBasis" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "transportMode" TEXT NOT NULL,
  "originLatitude" DOUBLE PRECISION,
  "originLongitude" DOUBLE PRECISION,
  "originLabel" TEXT,
  "returnLatitude" DOUBLE PRECISION,
  "returnLongitude" DOUBLE PRECISION,
  "returnLabel" TEXT,
  "totalCostVnd" INTEGER,
  "knownCostVnd" INTEGER NOT NULL,
  "hasUnknownCosts" BOOLEAN NOT NULL DEFAULT false,
  "fallbackMode" TEXT NOT NULL,
  "status" "ItineraryStatus" NOT NULL DEFAULT 'SAVED',
  "explanation" TEXT,
  "warnings" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "constraints" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "itinerary_stops" (
  "id" TEXT NOT NULL,
  "itineraryId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "date" TEXT NOT NULL,
  "slot" TEXT NOT NULL,
  "arrivalTime" TEXT NOT NULL,
  "departureTime" TEXT NOT NULL,
  "travelFromPreviousMin" INTEGER,
  "distanceFromPreviousM" INTEGER,
  "routeProvider" TEXT,
  "routeGeometry" TEXT,
  "estimatedCostVnd" INTEGER,
  "costKnown" BOOLEAN NOT NULL DEFAULT true,
  "availabilityCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "itinerary_stops_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "itineraryStopId" TEXT,
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

CREATE TABLE IF NOT EXISTS "ai_rate_limits" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_rate_limits_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "model" TEXT NOT NULL,
  "mode" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "requestId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "itineraries_code_key" ON "itineraries"("code");
CREATE INDEX IF NOT EXISTS "itineraries_customerId_createdAt_idx" ON "itineraries"("customerId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "itinerary_stops_itineraryId_position_key" ON "itinerary_stops"("itineraryId", "position");
CREATE INDEX IF NOT EXISTS "itinerary_stops_serviceId_date_slot_idx" ON "itinerary_stops"("serviceId", "date", "slot");
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_itineraryStopId_key" ON "bookings"("itineraryStopId");
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_idempotencyKey_key" ON "bookings"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "ai_rate_limits_expiresAt_idx" ON "ai_rate_limits"("expiresAt");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_createdAt_idx" ON "ai_usage_logs"("createdAt");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_userId_createdAt_idx" ON "ai_usage_logs"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_itineraryId_fkey"
    FOREIGN KEY ("itineraryId") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_itineraryStopId_fkey"
    FOREIGN KEY ("itineraryStopId") REFERENCES "itinerary_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
