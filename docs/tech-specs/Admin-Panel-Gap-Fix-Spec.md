# Tech Spec: Admin Panel Gap Fix (Implementation Alignment)

**Project:** “Эмоциональный баланс”  
**Scope:** Bring current codebase into compliance with `docs/Admin-Panel-Specification.md` (v1.0, 2026‑01‑07).  
**Audience:** Engineering (FE/BE), QA, Product.  
**Status:** Draft  
**Owner:** Engineering  

---

## 1) Summary

The admin panel has substantial implementation already (dashboard, schedule, services, content, interactives, CRM leads, UGC moderation, analytics, audit log, RBAC primitives), but it **does not fully match** the specification due to:

- Missing P0 sections: **Templates** and **Settings** are placeholders in UI.
- Missing P0 flow: **Appointment outcome/no‑show** is implemented in API, but **no UI** and **no DB persistence**.
- Missing P0 section: **Media library as a dedicated screen** (`/admin/content/media`) is absent (only a picker modal exists).
- RBAC matrix mismatch between spec vs API permissions vs UI nav visibility.
- URL/IA mismatch: spec uses `/admin/...`, current Next app routes from `/` (and some links hardcode `/admin/...` causing double prefix issues).
- Mixed UI styles: some pages use design-system, others use legacy inline CSS.

This tech spec focuses on **deltas only** (no reliance on previously written tech specs).

---

## 2) Goals / Non-goals

### 2.1 Goals
- Align admin panel with P0/P1 requirements from `docs/Admin-Panel-Specification.md`.
- Provide a **concrete task list** with file-level changes, endpoints, migrations, dependencies, and risks.
- Ensure RBAC matches the spec’s matrix (owner/assistant/editor) across UI + API.

### 2.2 Non-goals (explicitly out of scope for this spec)
- P2 items (advanced analytics, finances dashboards, real-time monitoring, A/B management UI), unless needed as dependency.
- Full redesign according to Figma (only minimum UX parity + consistent components).
- New product features not mentioned in `Admin-Panel-Specification.md`.

---

## 3) Source of Truth

- Spec: `docs/Admin-Panel-Specification.md`
- Current implementation:
  - Admin app: `apps/admin/src/app/*`
  - API: `apps/api/src/presentation/controllers/*` + `apps/api/src/application/*` + `apps/api/prisma/schema.prisma`

---

## 4) Architecture / Constraints

- Backend must follow Clean Architecture / DDD (domain → application → infrastructure → presentation).
- Existing DB is Postgres with Prisma schema at `apps/api/prisma/schema.prisma`.
- Admin Next app proxies API via rewrite (`apps/admin/next.config.js`) using `/api/*` → backend.

---

## 5) Key Gaps (Current vs Spec)

### 5.1 P0 gaps (blocking spec compliance)
1) **Templates** (`/admin/templates/`): UI placeholder; no admin CRUD for all template categories; only moderation templates are listed in a narrow use case.
2) **Settings** (`/admin/settings/`): UI placeholder; system settings not persisted (only audit-log entry).
3) **Schedule outcome / no-show**: API exists (`POST /admin/schedule/appointments/:id/outcome`) but:
   - no UI to record outcome,
   - no DB persistence of outcome,
   - schedule list DTO does not include outcome.
4) **Media library screen** (`/admin/content/media/`): missing; only media picker inside content editor.
5) **RBAC matrix mismatch**: assistant/editor rights deviate from spec; UI shows nav items that API may deny.
6) **URL base**: spec expects `/admin/...` IA; current app routes from `/` and has hardcoded `/admin/...` links in places.

### 5.2 P1 gaps (important, not release-blocking per spec)
- Interactive lists should show 30d stats (starts, completion rate, CTA rate) and offer preview/duplicate actions.
- Content list needs richer columns/filters/sorts (author/topics/tags, published_at; metrics per spec if feasible).
- Audit-log filters and export (CSV/JSON).
- Analytics export + “compare previous period” toggle.

---

## 6) Decisions (Proposed)

### D1) URL Strategy: adopt `/admin` via Next `basePath`
- Add `basePath: '/admin'` to `apps/admin/next.config.js`.
- Keep internal Next routes written as `/...` (without `/admin`); Next will prefix automatically.
- Remove hardcoded `/admin` in `Link href` to avoid `/admin/admin/...` after basePath.

**Rationale:** Minimal code churn, aligns with spec IA without moving folders.

### D2) RBAC: align API permissions to spec matrix + make UI truly read-only where required
- Update `apps/api/src/presentation/permissions/admin-permissions.ts` to reflect:
  - assistant: read-only for services/content/interactive/curated/glossary/media; full for schedule/leads/moderation; audit-log only own (already enforced by use case).
  - editor: full for content/interactive/curated/glossary; read-only for events; no dashboard/analytics/settings.
- In admin UI, enforce read-only by hiding/disabling actions and guarding pages consistently.

### D3) Appointment outcomes: persist outcome in DB (not only tracking)
- Add outcome fields to `Appointment` (Prisma migration).
- Update schedule DTOs and list endpoints to include current outcome.
- Implement UI “Mark outcome” flow in schedule page.

### D4) Templates: build full templates management on top of existing `MessageTemplate*` tables
- Reuse existing `MessageTemplate` and `MessageTemplateVersion`.
- Add missing fields for activation and status enum if needed.
- Implement CRUD + versioning + preview endpoints in admin API.
- Implement `/admin/templates` UI and editor UI.

### D5) Settings: implement persistent settings + UI tabs
- Add a settings table (single row or KV model) for system settings.
- Implement profile and user management using existing `User`, `Role`, `UserRole`, `AdminInvite`.
- Implement integrations configuration where feasible; secrets stored encrypted.

---

## 7) Detailed Work Items (By Area)

Each item includes: **Files**, **API**, **DB migrations**, **Dependencies**, **Risks**, **Acceptance**.

---

### 7.1 URL / IA Alignment (`/admin/*`)

#### Tasks
- **T-URL-1:** Add `basePath: '/admin'`.
  - **Files**: `apps/admin/next.config.js`
  - **Dependencies**: confirm reverse proxy (nginx) routes `/admin` to admin app (deployment config).
  - **Risks**: broken absolute links, redirects, assets; requires scanning hardcoded `/admin`.
  - **Acceptance**: opening `GET /admin/` renders dashboard; `GET /admin/login` works.

- **T-URL-2:** Remove hardcoded `/admin` from internal links; fix double-prefix issues.
  - **Files (examples)**:
    - `apps/admin/src/app/interactive/quizzes/page.tsx` (currently links to `/admin/interactive/...`)
    - Any other `Link href="/admin/..."`
  - **Acceptance**: all nav + in-page links resolve correctly under `/admin`.

---

### 7.2 RBAC Alignment (Spec matrix)

#### Tasks
- **T-RBAC-1:** Update `AdminPermissions` roles to match spec.
  - **Files**: `apps/api/src/presentation/permissions/admin-permissions.ts`
  - **Notes**:
    - Add `assistant` to read-only permissions for:
      - `content.list/get`
      - `interactive.list/get`
      - `curated.list/get`
      - `glossary.list/get`
      - `media.list`
    - Add `editor` to events read-only:
      - `events.list/get` include editor
    - Ensure write actions remain restricted (owner/editor as per matrix).
  - **Risks**: existing UI flows might assume access; ensure UI reflects changes.

- **T-RBAC-2:** Enforce guards on pages lacking `AdminAuthGuard`.
  - **Files** (audit to apply):
    - `apps/admin/src/app/content/*`
    - `apps/admin/src/app/services/*`
    - `apps/admin/src/app/events/*`
    - `apps/admin/src/app/curated/*`
    - `apps/admin/src/app/glossary/*`
  - **Acceptance**:
    - unauthorized users redirected to `/admin/login`
    - “no access” screen shown for forbidden roles

- **T-RBAC-3:** Implement UI read-only mode per role.
  - **Files**: admin pages and shared components
  - **Acceptance**:
    - assistant can view content/interactive/curated/glossary/media but cannot create/update/publish/delete
    - editor can view events but cannot create/update/publish

---

### 7.3 Schedule: Appointment outcome/no-show (P0)

#### Current API
- Endpoint: `POST /api/admin/schedule/appointments/:id/outcome`
- DTO: `RecordAppointmentOutcomeRequestDto` supports:
  - outcome: `attended|no_show|canceled_by_client|canceled_by_provider|rescheduled`
  - reason_category: `late_cancel|tech_issue|illness|other|unknown`
  - **File**: `apps/api/src/application/admin/dto/schedule.dto.ts`

#### Tasks
- **T-SCH-1:** Persist appointment outcome in DB.
  - **DB migration**: update `Appointment` in `apps/api/prisma/schema.prisma`:
    - `outcome` (nullable)
    - `outcome_reason_category` (nullable)
    - `outcome_recorded_at` (nullable)
    - `outcome_recorded_by_role` (nullable)
  - **Implementation**:
    - Update `RecordAppointmentOutcomeUseCase` to write to repository/DB (currently only emits tracking).
    - Add audit-log entry for outcome set.
  - **Files**:
    - `apps/api/src/application/admin/use-cases/schedule/RecordAppointmentOutcomeUseCase.ts`
    - repository + prisma mapping layer for `Appointment` (exact file depends on current infra; update accordingly)
  - **Dependencies**: ensure appointment status/state rules in domain allow recording outcome post-completion.
  - **Risks**: data consistency and repeated recordings; decide overwrite policy and log it.

- **T-SCH-2:** Extend schedule appointment DTO to include outcome fields.
  - **Files**:
    - `apps/api/src/application/admin/dto/schedule.dto.ts` (`ScheduleAppointmentDto`)
    - `ListScheduleAppointmentsUseCase` mapping
  - **Acceptance**: UI can render existing outcome and disable re-entry if desired.

- **T-SCH-3:** Add UI flow “Отметить исход” in schedule page.
  - **Files**: `apps/admin/src/app/schedule/page.tsx`
  - **UI**:
    - button on completed appointments → modal → select outcome + optional reason → submit
  - **Acceptance**:
    - matches `US-ADM-NO-SHOW-01` (spec section 7)
    - no-show appears in analytics (already based on tracking event)

---

### 7.4 Templates: Full management (P0)

#### Current DB
`MessageTemplate` + `MessageTemplateVersion` exist:
- **File**: `apps/api/prisma/schema.prisma`

#### Tasks
- **T-TPL-1:** Create admin templates API (CRUD + versions + preview + activate + rollback).
  - **New controllers**: `apps/api/src/presentation/controllers/admin-templates.controller.ts`
  - **New use cases** (application layer):
    - `ListTemplatesUseCase`
    - `GetTemplateUseCase`
    - `CreateTemplateUseCase`
    - `CreateTemplateVersionUseCase`
    - `PreviewTemplateUseCase` (server-side placeholder rendering with whitelisted variables)
    - `ActivateTemplateUseCase`
    - `RollbackTemplateUseCase` (recommended: create a new version copying an old one)
  - **New DTOs**: `apps/api/src/application/admin/dto/templates.dto.ts`
  - **RBAC**: owner/assistant allowed; editor denied.
  - **Acceptance**:
    - list templates for booking/waitlist/event/moderation across channels email/telegram
    - edit body/subject, preview with test data, activate template

- **T-TPL-2:** Add DB fields required by spec publication workflow (if missing).
  - **DB migrations** (proposal):
    - `MessageTemplate.status` → enum (`draft|active|archived`) OR enforce via code and keep string (less strict).
    - `MessageTemplate.active_version_id` (nullable)
    - `MessageTemplate.activated_at` (nullable)
    - `MessageTemplate.language` default `ru`
  - **Risks**: migration touches existing moderation templates; add a safe default mapping.

- **T-TPL-3:** Build admin UI for templates.
  - **Files**:
    - `apps/admin/src/app/templates/page.tsx` (replace placeholder with list + filters)
    - `apps/admin/src/app/templates/[id]/page.tsx` (new)
    - shared markdown editor component reuse
  - **UI features**:
    - list table + filters
    - editor + versions list + rollback
    - preview panel with test variables
  - **Acceptance**: matches spec 4.11.2 (“редактор шаблона”).

---

### 7.5 Settings: Profile / Integrations / Users (P0)

#### Current state
- UI: placeholder `apps/admin/src/app/settings/page.tsx`
- API:
  - Invites exist: `POST /admin/invites` (controller `apps/api/src/presentation/controllers/admin.controller.ts`)
  - Google Calendar integration exists (table + controller)
  - System settings update use case logs only, no persistence

#### Tasks
- **T-SET-1:** Implement persistent system settings storage.
  - **DB**: add `SystemSettings` (single-row) or KV table.
  - **Files**:
    - `apps/api/prisma/schema.prisma`
    - `apps/api/src/application/admin/use-cases/UpdateSystemSettingsUseCase.ts` (update to write DB)
    - add `GetSystemSettingsUseCase`
    - controller endpoints in `admin.controller.ts` or dedicated `admin-settings.controller.ts`
  - **Acceptance**: settings survive restart; audit-log written with old/new values.

- **T-SET-2:** Implement “Profile” settings per spec.
  - **DB** (proposal):
    - Add profile fields to owner user:
      - `bio_markdown` (nullable)
      - `avatar_media_asset_id` (nullable FK to `MediaAsset`)
    - Alternatively: dedicated `PsychologistProfile` table (preferable if multiple psychologists later).
  - **API**:
    - `GET/PUT /admin/settings/profile`
  - **UI**:
    - settings tab “Профиль” with fields from spec 4.14.1

- **T-SET-3:** Implement “Users & roles” management.
  - **API**:
    - `GET /admin/settings/users` list
    - `POST /admin/settings/users/invite` (reuse AdminInvite)
    - `PATCH /admin/settings/users/:id` change role
    - `POST /admin/settings/users/:id/block` / `.../unblock`
    - `DELETE /admin/settings/users/:id` (with safeguards: cannot delete last owner)
  - **DB**: reuse `User`, `Role`, `UserRole`, `AdminInvite`, `Session`.
  - **RBAC**: owner only.
  - **Acceptance**: matches spec 4.14.3.

- **T-SET-4:** Integrations settings UI (minimum: Google Calendar).
  - **UI**:
    - show connection status, connect/disconnect, sync mode toggles
  - **API**:
    - reuse existing GC endpoints; add missing “disconnect” and “sync mode” updates if absent.

- **T-SET-5 (optional P1):** YooKassa/TG/SMTP configs + test actions.
  - **Security**: encrypt secrets at rest; mask in responses.

---

### 7.6 Content: Media library screen (P0)

#### Current DB/API
- `MediaAsset` exists and is used; admin API provides list/upload/delete.

#### Tasks
- **T-MEDIA-1:** Add dedicated media library page `/admin/content/media`.
  - **Files**:
    - `apps/admin/src/app/content/media/page.tsx` (new)
    - integrate with `AdminMediaController` endpoints
  - **UI features**:
    - upload (drag&drop)
    - list/grid + preview
    - edit metadata, copy URL, delete (with in-use errors handled)

- **T-MEDIA-2:** Add media metadata update endpoint (spec requires edit).
  - **API**: `PUT /admin/media/:id` for `title`, `alt_text` (and optional fields if added).
  - **Files**: `apps/api/src/presentation/controllers/admin-media.controller.ts` + new use case
  - **DB**: no migration required for `title/alt_text` (already exist); optional for description/folders/tags.

---

### 7.7 Content list/filters (P1)

#### Tasks
- **T-CONT-1:** Add filters by author/topics/tags; include author + publishedAt in list response.
  - **Files**:
    - `apps/api/src/application/admin/use-cases/ListContentItemsUseCase.ts`
    - related DTOs/mappers
    - `apps/admin/src/app/content/page.tsx` (UI filters)

- **T-CONT-2 (optional P1):** show views/CTA metrics 30d (cached).

---

### 7.8 Interactives list stats (P1)

#### Tasks
- **T-INT-1:** Replace `/admin/interactive` placeholder with real overview page (grouped by type).
  - **Files**:
    - `apps/admin/src/app/interactive/page.tsx`
    - new API endpoint or extend existing `admin-interactive.controller.ts`
- **T-INT-2:** Provide 30d stats per definition (starts, completions, completionRate, ctaRate).
  - **Backend**: add aggregator use case with caching.

---

### 7.9 Audit-log filters/export (P1)

#### Tasks
- **T-AUD-1:** Add filter UI (user/action/entity/date).
  - **Files**: `apps/admin/src/app/audit-log/page.tsx`
- **T-AUD-2:** Add export endpoint `GET /admin/audit-log/export`.
  - **Files**: `apps/api/src/presentation/controllers/admin-audit-log.controller.ts` + application use case

---

### 7.10 Analytics export/compare (P1)

#### Tasks
- **T-AN-1:** Add `90d` range + “compare previous period” support in API and UI.
  - **Files**:
    - `apps/admin/src/app/analytics/page.tsx`
    - use cases under `apps/api/src/application/admin/use-cases/analytics/*`
- **T-AN-2:** Export CSV for funnel tables.

---

## 8) Backlog (P0 / P1) with Dependencies & Risk

### P0 (release-blocking per spec)
1. **URL base `/admin`**: `basePath` + link fixes
   - Depends on: deployment routing correctness
   - Risk: medium (routing regressions)
2. **RBAC alignment** (API permissions + UI guard + readonly)
   - Depends on: role definitions existing (`owner/assistant/editor`)
   - Risk: medium-high (accidental over-permission)
3. **Schedule appointment outcome UI + DB persistence**
   - Depends on: appointment repository + prisma migration
   - Risk: medium (data model + backfill policy)
4. **Templates management (API + UI + minimal DB fields for activation)**
   - Depends on: existing `MessageTemplate*` tables
   - Risk: medium (migration compatibility with moderation templates)
5. **Settings (system settings persistence + users/roles + profile + GC integration UI)**
   - Depends on: `UserRole`, `AdminInvite`, GC integration tables
   - Risk: high (secrets handling, RBAC correctness)
6. **Media library screen + metadata editing**
   - Depends on: `AdminMediaController` + add update endpoint
   - Risk: low-medium (UX + upload constraints)
7. **Fix known routing bug in quizzes link**
   - Depends on: URL strategy decision (basePath)
   - Risk: low

### P1 (important, non-blocking per spec)
1. Content list richer filters/columns and optional metrics
   - Risk: medium (perf, caching)
2. Interactive overview page + 30d stats
   - Risk: medium (analytics aggregation)
3. Audit-log filters + export
   - Risk: low-medium
4. Analytics export + compare previous period
   - Risk: medium (query correctness)
5. UI consistency refactor to design-system components
   - Risk: medium (visual regressions)

---

## 9) Implementation Notes / Safety

- **Secrets** (settings integrations): store encrypted at rest, never return plaintext in API.
- **Audit log**: ensure critical actions are logged (templates activation, settings changes, user role changes, appointment outcome).
- **Performance**: heavy analytics endpoints should be cached (TTL 5–15 min per spec NFR).

---

## 10) Acceptance Checklist (Top-level)

- [ ] Admin UI accessible at `/admin/*` and all links work (no double `/admin/admin`).
- [ ] RBAC matches spec matrix (owner/assistant/editor) for every section.
- [ ] Templates section fully functional (list/edit/preview/version/activate/rollback).
- [ ] Settings section functional (profile/integrations/users/system) for owner.
- [ ] Schedule supports recording appointment outcome/no-show with persistence.
- [ ] Media library exists as `/admin/content/media` with upload, metadata edit, URL copy, safe delete.

