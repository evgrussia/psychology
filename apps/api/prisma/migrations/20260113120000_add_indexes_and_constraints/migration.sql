-- Migration: Add missing indexes and constraints
-- Date: 2026-01-13
-- Purpose: 
--   1. Fix trigger_flags type from TEXT to JSONB (array of enum values)
--   2. Add missing performance indexes
--   3. Add CHECK constraint for curated_items XOR relationship
--
-- Rollback note: This migration adds indexes and constraints. 
-- To rollback: drop indexes and constraints, revert trigger_flags to TEXT

-- 1. Change trigger_flags from TEXT to JSONB
-- Note: Existing data will need to be migrated separately if any exists
ALTER TABLE "anonymous_questions" 
  ALTER COLUMN "trigger_flags" TYPE JSONB USING "trigger_flags"::JSONB;

-- 2. Add missing performance indexes

-- Index for appointments.start_at_utc (for conflict checking)
CREATE INDEX IF NOT EXISTS "appointments_start_at_utc_idx" ON "appointments"("start_at_utc");

-- Index for appointments.status (for filtering by status)
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments"("status");

-- Index for availability_slots.source (for filtering by source)
CREATE INDEX IF NOT EXISTS "availability_slots_source_idx" ON "availability_slots"("source");

-- Composite index for payments (provider, provider_payment_id) for better query performance
CREATE INDEX IF NOT EXISTS "payments_provider_provider_payment_id_idx" ON "payments"("provider", "provider_payment_id");

-- 3. Add CHECK constraint for curated_items XOR relationship
-- Ensures that exactly one of content_item_id or interactive_definition_id is set
ALTER TABLE "curated_items" 
  ADD CONSTRAINT "curated_items_xor_check" 
  CHECK (
    (content_item_id IS NULL AND interactive_definition_id IS NOT NULL) OR
    (content_item_id IS NOT NULL AND interactive_definition_id IS NULL)
  );
