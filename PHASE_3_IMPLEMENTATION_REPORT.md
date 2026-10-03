# CODE-e-MANIPAL 2.0 — PHASE 3 IMPLEMENTATION REPORT

**Title**: Event State Machine, Permission Matrix & Allowlisted Configuration Engine  
**Authoritative Baseline**: `IMPLEMENTATION_BASELINE_v4_FINAL.md`  
**Status**: 🟢 **IMPLEMENTED & VERIFIED**  
**Environment**: Local Dev Server (`http://localhost:3000`) against Azure PostgreSQL Staging  
**Production State**: Untouched (Zero mutations to production)  
**TypeScript Status**: `npx tsc --noEmit` exited **0 errors**

---

## 1. Executive Summary

Phase 3 establishes the authoritative event state machine, deterministic results release buffer, strictly allowlisted configuration engine, and Anti-TOCTOU transactional phase transition guards.

All six core requirements from the Master Implementation Directive and `IMPLEMENTATION_BASELINE_v4_FINAL.md` have been fully implemented without improvisation:
1. **7 Canonical Phases**: `NOT_STARTED → HACKING → SUBMISSION → SUBMISSION_CLOSED → JUDGING → RESULTS → ENDED`.
2. **Decoupled Results Release Engine**: `DRAFT → PUBLISHING → PUBLISHED`.
3. **Independent Judging Completion Gate**: Both `requireJudgingComplete` and `materializeResultsSnapshot` strictly verify assignment and evaluation completeness.
4. **Emergency Override Path**: Restricted to admins on `PATCH /api/admin/event-config/override-state` with mandatory reason (>= 10 chars) and append-only audit trail.
5. **Zero-Side-Effect GET `/api/event-config`**: Evaluates effective status dynamically via `getEffectiveResultsRelease()` with zero database writes.
6. **Strict Response Allowlist**: Internal identifiers (`id`, `active_release_id`), database credentials, secrets, and score configurations are strictly barred from public output.

---

## 2. Implemented Architecture & Source Files

### 2.1 `lib/event/state-machine.ts`
- **7 Canonical Phases**:
  `NOT_STARTED`, `HACKING`, `SUBMISSION`, `SUBMISSION_CLOSED`, `JUDGING`, `RESULTS`, `ENDED`.
- **Legal Sequential Transition Graph**:
  `NOT_STARTED → HACKING → SUBMISSION → SUBMISSION_CLOSED → JUDGING → RESULTS → ENDED`.
  Any jump or unapproved regression is rejected with `400 Bad Request`.
- **`checkJudgingCompleteness()` & `requireJudgingComplete()`**:
  - Excludes withdrawn/disqualified teams and deleted submissions.
  - Verifies that every eligible submission has at least 1 judge assigned.
  - Verifies that every assigned judge has a finalized review (`is_complete = true`, no dangling drafts).
  - Returns structured diagnostic errors detailing missing assignments or incomplete judge reviews.

### 2.2 `lib/event/results-release.ts`
- **Decoupled Release Cycle**: `DRAFT → PUBLISHING → PUBLISHED`.
- **`getEffectiveResultsRelease(config, now)`**:
  - Deterministically evaluates whether `now >= publish_at` during `PUBLISHING`. If passed, returns `'PUBLISHED'` without waiting for background workers and without modifying the database.
- **`materializeResultsSnapshot(adminUserId)`**:
  - Executes inside a serializable transaction with `SELECT ... FOR UPDATE`.
  - **Idempotency**: Returns existing countdown and release ID if already `PUBLISHING` or `PUBLISHED`.
  - **Independent Gate**: Strictly checks judging completeness before generating a snapshot.
  - Inserts immutable `public.results_snapshot (release_id, snapshot_payload, created_by)`.
  - Initializes ceremony `public.results_awards (release_id, award_overlay, updated_by)`.
  - Updates `event_config` to `PUBLISHING` with buffer duration and `publish_at`.
- **`reconcilePublishWorker(releaseId)`**:
  - Background worker reconciling database status.
  - Strictly bound to `release_id`. If `active_release_id` was cleared (e.g. rolled back to `JUDGING`), 0 rows are updated and the worker exits safely.

### 2.3 `app/api/event-config/route.ts`
- **Public GET**:
  - Strictly read-only.
  - Computes effective release state on-the-fly.
  - Filters response strictly through `getPublicEventConfig()` allowlist.
- **Admin PATCH**:
  - Updates event timers (`start_time`, `end_time`, `buffer_minutes`).
  - Strictly rejects attempts to modify `event_phase` or `results_release` directly, directing callers to `/transition`, `/override-state`, or `/publish`.

### 2.4 `app/api/admin/event-config/transition/route.ts`
- Admin-only endpoint (`PATCH` / `POST`).
- Validates sequential transition against `LEGAL_TRANSITIONS`.
- Acquires row-level lock (`SELECT event_phase FROM public.event_config WHERE id = 1 FOR UPDATE`).
- Enforces `requireJudgingComplete()` when transitioning from `JUDGING` to `RESULTS`.
- Implements exponential backoff + jitter retry on transient serialization failures (`40001`) and deadlocks (`40P01`).
- Records audit log upon transition.

### 2.5 `app/api/admin/event-config/override-state/route.ts`
- Admin-only emergency endpoint (`PATCH` / `POST`).
- Requires a mandatory detailed `reason` (minimum 10 characters).
- Records append-only audit log in `public.audit_logs`.
- If regressing from `RESULTS` to an earlier phase (`JUDGING`), atomically resets release state (`results_release = 'DRAFT'`, `publish_at = NULL`, `active_release_id = NULL`).
- **Critical Invariant**: Emergency jump to `RESULTS` does NOT publish results and does NOT bypass the judging check on `/publish`.

### 2.6 `app/api/admin/event-config/publish/route.ts`
- Admin-only endpoint (`POST`).
- Initiates results snapshot materialization.
- Strictly independent gate: Aborts if judging is incomplete, even if already in `RESULTS`.
- Idempotent: Replays existing countdown/release if called multiple times.

---

## 3. Database Integrity & Concurrency Controls

| Control | Implementation | Verification Status |
|---|---|:---:|
| **Singleton Table** | `public.event_config` with constraint `CHECK (id = 1)` | Verified in migration `020` |
| **Row-Level Locking** | `SELECT ... FOR UPDATE` across transitions & publish | Verified under concurrent load |
| **Anti-TOCTOU Retry** | 3x retry on PostgreSQL codes `40001` / `40P01` | Verified in transition route |
| **Zero GET Writes** | Dynamic calculation via `getEffectiveResultsRelease` | Verified across 10 consecutive requests |
| **Release Isolation** | Worker bound to `active_release_id = $release_id` | Verified with stale & valid IDs |
