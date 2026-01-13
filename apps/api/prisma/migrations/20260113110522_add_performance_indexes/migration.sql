-- CreateIndex
CREATE INDEX "anonymous_questions_status_submitted_at_idx" ON "anonymous_questions"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "appointments_start_at_utc_end_at_utc_status_idx" ON "appointments"("start_at_utc", "end_at_utc", "status");

-- CreateIndex
CREATE INDEX "availability_slots_start_at_utc_end_at_utc_status_idx" ON "availability_slots"("start_at_utc", "end_at_utc", "status");

-- CreateIndex
CREATE INDEX "content_items_status_content_type_slug_idx" ON "content_items"("status", "content_type", "slug");

-- CreateIndex
CREATE INDEX "deep_links_created_at_idx" ON "deep_links"("created_at");

-- CreateIndex
CREATE INDEX "lead_timeline_events_lead_id_occurred_at_idx" ON "lead_timeline_events"("lead_id", "occurred_at");
