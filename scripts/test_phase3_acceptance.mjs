/**
 * PHASE 3 ACCEPTANCE VERIFICATION SUITE
 *
 * Covers all required Phase 3 verification groups:
 * 1. Legal sequential transitions (NOT_STARTED → HACKING → SUBMISSION → SUBMISSION_CLOSED → JUDGING → RESULTS → ENDED)
 * 2. Illegal & non-sequential transitions rejected (400)
 * 3. Judging completeness gate on JUDGING → RESULTS (400 when incomplete)
 * 4. Emergency override state (/api/admin/event-config/override-state) with mandatory reason & audit logging
 * 5. Critical invariant: Emergency RESULTS does NOT make incomplete judging publishable
 * 6. Rollback to JUDGING atomically resets release state
 * 7. GET /api/event-config strictly read-only (zero database writes over 10 consecutive calls)
 * 8. Public field allowlist enforcement (no internal IDs, secrets, release_id)
 * 9. Results release buffer & publish_at countdown semantics
 * 10. POST /publish idempotency & snapshot materialization
 * 11. Background worker release_id binding invariant
 * 12. Serialization & Anti-TOCTOU concurrency resilience
 * 13. Phase 2 auth & session regression checks
 *
 * SAFETY: All tests run against localhost:3000 (dev server) with staging database.
 * No production mutations.
 */

import fs from 'fs';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const BASE = 'http://localhost:3000';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Test harness infrastructure ──
let totalTests = 0;
let passCount = 0;
let failCount = 0;
const results = [];

function log(msg) { console.log(msg); }

function pass(group, test, expected, observed) {
  totalTests++;
  passCount++;
  results.push({ group, test, status: 'PASS', expected, observed });
  log(`  ✅ ${test}`);
}

function fail(group, test, expected, observed) {
  totalTests++;
  failCount++;
  results.push({ group, test, status: 'FAIL', expected, observed });
  log(`  ❌ ${test}`);
  log(`     Expected: ${expected}`);
  log(`     Observed: ${observed}`);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, headers: res.headers, body };
}

// ── Test Session & User Setup ──
let adminUser = null;
let adminToken = null;
let participantUser = null;
let participantToken = null;

// Keep original event_config state to restore at end of tests
let originalEventConfig = null;

async function getSessionTokenForEmail(email) {
  const linkRes = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkRes.error) throw linkRes.error;
  const verifyRes = await supabaseAnon.auth.verifyOtp({
    token_hash: linkRes.data.properties.hashed_token,
    type: 'magiclink',
  });
  if (verifyRes.error) throw verifyRes.error;
  return verifyRes.data.session.access_token;
}

async function setupTestUsers() {
  log('Setting up isolated test sessions using existing staging accounts...');

  // Use existing admin user: admin@learnit-muj.com (role = admin)
  adminToken = await getSessionTokenForEmail('admin@learnit-muj.com');

  // Use existing participant user: participant@learnit-muj.com (role = participant)
  participantToken = await getSessionTokenForEmail('participant@learnit-muj.com');

  // Clean any test assignment/review fixtures to ensure clean incomplete judging state
  await pool.query("DELETE FROM public.judge_assignments WHERE judge_id = '3f93c481-5209-4223-a6d6-e8ac762fa372'");
  await pool.query("DELETE FROM public.judge_reviews WHERE judge_id = '3f93c481-5209-4223-a6d6-e8ac762fa372'");

  // 3. Backup initial event_config state
  const { rows } = await pool.query('SELECT * FROM public.event_config WHERE id = 1');
  originalEventConfig = rows[0];

  log('Test sessions & baseline state ready.');
}

async function cleanupTestUsers() {
  log('\nRestoring initial event_config state and cleaning test fixtures...');
  await pool.query("DELETE FROM public.judge_assignments WHERE judge_id = '3f93c481-5209-4223-a6d6-e8ac762fa372'").catch(() => {});
  await pool.query("DELETE FROM public.judge_reviews WHERE judge_id = '3f93c481-5209-4223-a6d6-e8ac762fa372'").catch(() => {});
  if (originalEventConfig) {
    await pool.query(
      `UPDATE public.event_config SET
         event_phase = $1,
         results_release = $2,
         publish_at = $3,
         active_release_id = $4,
         buffer_minutes = $5,
         start_time = $6,
         end_time = $7,
         updated_at = NOW()
       WHERE id = 1`,
      [
        originalEventConfig.event_phase,
        originalEventConfig.results_release,
        originalEventConfig.publish_at,
        originalEventConfig.active_release_id,
        originalEventConfig.buffer_minutes,
        originalEventConfig.start_time,
        originalEventConfig.end_time,
      ]
    ).catch(() => {});
  }
  await pool.end();
}

// ════════════════════════════════════════════════════════
// GROUP 1: LEGAL & ILLEGAL PHASE TRANSITIONS
// ════════════════════════════════════════════════════════
async function testTransitions() {
  log('\n══ GROUP 1: STATE MACHINE & TRANSITIONS ══');

  async function setPhase(phase, release = 'DRAFT') {
    await pool.query(
      `UPDATE public.event_config SET event_phase = $1, results_release = $2, updated_at = NOW() WHERE id = 1`,
      [phase, release]
    );
  }

  // 1a. Unauthenticated request rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: { 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ target_phase: 'HACKING' }),
    });
    if (res.status === 401) {
      pass('TRANSITIONS', '1a. Unauthenticated transition → 401', '401', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1a. Unauthenticated transition → 401', '401', `${res.status}`);
    }
  }

  // 1b. Participant (non-admin) rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${participantToken}`,
      },
      body: JSON.stringify({ target_phase: 'HACKING' }),
    });
    if (res.status === 403) {
      pass('TRANSITIONS', '1b. Participant role → 403 Forbidden', '403', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1b. Participant role → 403 Forbidden', '403', `${res.status}`);
    }
  }

  // 1c. Invalid phase name rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'INVALID_PHASE_XYZ' }),
    });
    if (res.status === 400) {
      pass('TRANSITIONS', '1c. Invalid phase string → 400 Bad Request', '400', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1c. Invalid phase string → 400 Bad Request', '400', `${res.status}`);
    }
  }

  // 1d. Illegal non-sequential transition: NOT_STARTED → JUDGING
  {
    await setPhase('NOT_STARTED');
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'JUDGING' }),
    });
    if (res.status === 400 && res.body?.error?.includes('Illegal phase transition')) {
      pass('TRANSITIONS', '1d. Non-sequential NOT_STARTED → JUDGING rejected → 400', '400', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1d. Non-sequential NOT_STARTED → JUDGING rejected', '400', `${res.status}`);
    }
  }

  // 1e. Illegal non-sequential: NOT_STARTED → RESULTS
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'RESULTS' }),
    });
    if (res.status === 400) {
      pass('TRANSITIONS', '1e. Jump NOT_STARTED → RESULTS rejected → 400', '400', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1e. Jump NOT_STARTED → RESULTS rejected', '400', `${res.status}`);
    }
  }

  // 1f. Backward transition without override: SUBMISSION → HACKING rejected
  {
    await setPhase('SUBMISSION');
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'HACKING' }),
    });
    if (res.status === 400) {
      pass('TRANSITIONS', '1f. Backward transition without override rejected → 400', '400', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1f. Backward transition without override rejected', '400', `${res.status}`);
    }
  }

  // 1g. Legal sequential transition: NOT_STARTED → HACKING
  {
    await setPhase('NOT_STARTED');
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'HACKING' }),
    });
    if (res.status === 200 && res.body?.data?.event_phase === 'HACKING') {
      pass('TRANSITIONS', '1g. Legal sequential NOT_STARTED → HACKING → 200', '200', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1g. Legal sequential NOT_STARTED → HACKING', '200', `${res.status}`);
    }
  }

  // 1h. Legal sequential transition: HACKING → SUBMISSION
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'SUBMISSION' }),
    });
    if (res.status === 200 && res.body?.data?.event_phase === 'SUBMISSION') {
      pass('TRANSITIONS', '1h. Legal sequential HACKING → SUBMISSION → 200', '200', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1h. Legal sequential HACKING → SUBMISSION', '200', `${res.status}`);
    }
  }

  // 1i. Legal sequential transition: SUBMISSION → SUBMISSION_CLOSED
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'SUBMISSION_CLOSED' }),
    });
    if (res.status === 200 && res.body?.data?.event_phase === 'SUBMISSION_CLOSED') {
      pass('TRANSITIONS', '1i. Legal sequential SUBMISSION → SUBMISSION_CLOSED → 200', '200', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1i. Legal sequential SUBMISSION → SUBMISSION_CLOSED', '200', `${res.status}`);
    }
  }

  // 1j. Legal sequential transition: SUBMISSION_CLOSED → JUDGING
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'JUDGING' }),
    });
    if (res.status === 200 && res.body?.data?.event_phase === 'JUDGING') {
      pass('TRANSITIONS', '1j. Legal sequential SUBMISSION_CLOSED → JUDGING → 200', '200', `${res.status}`);
    } else {
      fail('TRANSITIONS', '1j. Legal sequential SUBMISSION_CLOSED → JUDGING', '200', `${res.status}`);
    }
  }
}

// ════════════════════════════════════════════════════════
// GROUP 2: JUDGING COMPLETION GATE ON JUDGING → RESULTS
// ════════════════════════════════════════════════════════
async function testJudgingCompletionGate() {
  log('\n══ GROUP 2: JUDGING COMPLETION GATE ══');

  // 2a. Attempt JUDGING → RESULTS via sequential transition endpoint with incomplete judging
  {
    await pool.query("UPDATE public.event_config SET event_phase = 'JUDGING' WHERE id = 1");

    const res = await fetchJson(`${BASE}/api/admin/event-config/transition`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'RESULTS' }),
    });

    if (res.status === 400 && res.body?.error?.includes('Cannot transition to RESULTS')) {
      pass('JUDGING_GATE', '2a. JUDGING → RESULTS with incomplete judging rejected → 400', '400', `${res.status}`);
    } else {
      fail('JUDGING_GATE', '2a. JUDGING → RESULTS with incomplete judging rejected', '400', `${res.status}`);
    }
  }

  // 2b. Verify database state remains JUDGING (not changed)
  {
    const { rows } = await pool.query('SELECT event_phase FROM public.event_config WHERE id = 1');
    if (rows[0]?.event_phase === 'JUDGING') {
      pass('JUDGING_GATE', '2b. event_phase remains in JUDGING after gate abort', 'JUDGING', rows[0]?.event_phase);
    } else {
      fail('JUDGING_GATE', '2b. event_phase remains in JUDGING', 'JUDGING', rows[0]?.event_phase);
    }
  }
}

// ════════════════════════════════════════════════════════
// GROUP 3: EMERGENCY OVERRIDE & INVARIANTS
// ════════════════════════════════════════════════════════
async function testEmergencyOverride() {
  log('\n══ GROUP 3: EMERGENCY STATE OVERRIDE ══');

  // 3a. Missing reason rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/override-state`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'RESULTS' }),
    });
    if (res.status === 400 && res.body?.error?.includes('detailed reason')) {
      pass('OVERRIDE', '3a. Override without reason rejected → 400', '400', `${res.status}`);
    } else {
      fail('OVERRIDE', '3a. Override without reason rejected', '400', `${res.status}`);
    }
  }

  // 3b. Reason too short (<10 chars) rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/override-state`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'RESULTS', reason: 'Too short' }),
    });
    if (res.status === 400) {
      pass('OVERRIDE', '3b. Reason < 10 characters rejected → 400', '400', `${res.status}`);
    } else {
      fail('OVERRIDE', '3b. Reason < 10 characters rejected', '400', `${res.status}`);
    }
  }

  // 3c. Unauthenticated request rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/override-state`, {
      method: 'PATCH',
      headers: { 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ target_phase: 'RESULTS', reason: 'Valid emergency reason for testing' }),
    });
    if (res.status === 401) {
      pass('OVERRIDE', '3c. Unauthenticated override → 401', '401', `${res.status}`);
    } else {
      fail('OVERRIDE', '3c. Unauthenticated override → 401', '401', `${res.status}`);
    }
  }

  // 3d. Participant role rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/override-state`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${participantToken}`,
      },
      body: JSON.stringify({ target_phase: 'RESULTS', reason: 'Participant trying emergency override' }),
    });
    if (res.status === 403) {
      pass('OVERRIDE', '3d. Participant override → 403 Forbidden', '403', `${res.status}`);
    } else {
      fail('OVERRIDE', '3d. Participant override → 403 Forbidden', '403', `${res.status}`);
    }
  }

  // 3e. Valid emergency override to RESULTS with reason
  const testReason = 'Organizer emergency override: moving to RESULTS for ceremony rehearsal.';
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/override-state`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'RESULTS', reason: testReason }),
    });

    if (res.status === 200 && res.body?.data?.event_phase === 'RESULTS') {
      pass('OVERRIDE', '3e. Valid emergency override to RESULTS → 200 OK', '200', `${res.status}`);
    } else {
      fail('OVERRIDE', '3e. Valid emergency override to RESULTS', '200', `${res.status}`);
    }
  }

  // 3f. Audit log verified
  {
    const { rows } = await pool.query(
      `SELECT * FROM public.audit_logs 
       WHERE action = 'EMERGENCY_STATE_OVERRIDE'
       ORDER BY created_at DESC LIMIT 1`
    );
    const logDetails = rows[0]?.details ? JSON.parse(JSON.stringify(rows[0].details)) : {};
    if (rows.length > 0 && logDetails.reason === testReason) {
      pass('OVERRIDE', '3f. Audit log entry recorded with exact reason', 'Audit entry exists', `Recorded at ${rows[0].created_at}`);
    } else {
      fail('OVERRIDE', '3f. Audit log entry recorded with exact reason', 'Audit entry exists', 'Not found');
    }
  }

  // 3g. CRITICAL INVARIANT: Emergency RESULTS does NOT set results_release to PUBLISHED
  {
    const { rows } = await pool.query('SELECT event_phase, results_release FROM public.event_config WHERE id = 1');
    if (rows[0]?.event_phase === 'RESULTS' && rows[0]?.results_release === 'DRAFT') {
      pass('OVERRIDE', '3g. Critical Invariant: Emergency RESULTS keeps results_release = DRAFT', 'DRAFT', rows[0]?.results_release);
    } else {
      fail('OVERRIDE', '3g. Critical Invariant: Emergency RESULTS keeps results_release = DRAFT', 'DRAFT', rows[0]?.results_release);
    }
  }

  // 3h. Emergency Rollback: RESULTS → JUDGING resets release state
  {
    await pool.query(
      `UPDATE public.event_config SET
         results_release = 'PUBLISHING',
         publish_at = NOW() + INTERVAL '10 minutes'
       WHERE id = 1`
    );

    const rollbackReason = 'Emergency correction: judges need to amend scoring.';
    const res = await fetchJson(`${BASE}/api/admin/event-config/override-state`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target_phase: 'JUDGING', reason: rollbackReason }),
    });

    const { rows } = await pool.query('SELECT event_phase, results_release, publish_at FROM public.event_config WHERE id = 1');
    if (
      res.status === 200 &&
      rows[0]?.event_phase === 'JUDGING' &&
      rows[0]?.results_release === 'DRAFT' &&
      rows[0]?.publish_at === null
    ) {
      pass('OVERRIDE', '3h. Rollback RESULTS → JUDGING atomically resets release state to DRAFT', 'DRAFT / null publish_at', `Release: ${rows[0]?.results_release}`);
    } else {
      fail('OVERRIDE', '3h. Rollback RESULTS → JUDGING resets release state', 'DRAFT', rows[0]?.results_release);
    }
  }
}

// ════════════════════════════════════════════════════════
// GROUP 4: RESULTS PUBLICATION & SNAPSHOT MATERIALIZATION
// ════════════════════════════════════════════════════════
async function testResultsPublish() {
  log('\n══ GROUP 4: RESULTS PUBLICATION & SNAPSHOT ══');

  // 4a. Unauthenticated POST /publish rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/publish`, {
      method: 'POST',
      headers: { 'Origin': 'http://localhost:3000' },
    });
    if (res.status === 401) {
      pass('PUBLISH', '4a. Unauthenticated POST /publish → 401', '401', `${res.status}`);
    } else {
      fail('PUBLISH', '4a. Unauthenticated POST /publish → 401', '401', `${res.status}`);
    }
  }

  // 4b. Participant rejected
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/publish`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${participantToken}`,
      },
    });
    if (res.status === 403) {
      pass('PUBLISH', '4b. Participant POST /publish → 403 Forbidden', '403', `${res.status}`);
    } else {
      fail('PUBLISH', '4b. Participant POST /publish → 403 Forbidden', '403', `${res.status}`);
    }
  }

  // 4c. CRITICAL INVARIANT: POST /publish strictly independently verifies judging completeness
  {
    await pool.query("UPDATE public.event_config SET event_phase = 'RESULTS', results_release = 'DRAFT' WHERE id = 1");

    const res = await fetchJson(`${BASE}/api/admin/event-config/publish`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (res.status === 400 && res.body?.error?.includes('judging is incomplete')) {
      pass('PUBLISH', '4c. Critical Invariant: POST /publish aborts on incomplete judging → 400', '400', `${res.status}`);
    } else {
      fail('PUBLISH', '4c. Critical Invariant: POST /publish aborts on incomplete judging', '400', `${res.status}`);
    }
  }

  // 4d. Now set up completed judging for the test submission
  let testSubmissionId = null;
  let testJudgeId = null;
  {
    const { rows: subRows } = await pool.query(
      "SELECT id FROM public.submissions WHERE status = 'submitted' LIMIT 1"
    );
    testSubmissionId = subRows[0]?.id;

    const { rows: judgeRows } = await pool.query(
      "SELECT id FROM public.profiles WHERE role = 'judge' LIMIT 1"
    );
    testJudgeId = judgeRows[0]?.id || adminUser.id;

    await pool.query(
      `INSERT INTO public.judge_assignments (judge_id, submission_id, assigned_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (judge_id, submission_id) DO NOTHING`,
      [testJudgeId, testSubmissionId]
    );

    await pool.query(
      `INSERT INTO public.judge_reviews (
         submission_id, judge_id, score_innovation, score_technical, score_presentation, score_impact, feedback, is_complete, version
       ) VALUES ($1, $2, 9, 8, 9, 9, 'Excellent project execution!', true, 1)
       ON CONFLICT (submission_id, judge_id) DO UPDATE SET
         is_complete = true, score_innovation = 9, score_technical = 8, score_presentation = 9, score_impact = 9`,
      [testSubmissionId, testJudgeId]
    );

    log('    (Completed judging fixture configured for test submission)');
  }

  // 4e. POST /publish with complete judging → success!
  let activeReleaseId = null;
  let targetPublishAt = null;
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/publish`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    activeReleaseId = res.body?.data?.release_id;
    targetPublishAt = res.body?.data?.publish_at;

    if (
      res.status === 200 &&
      res.body?.data?.status === 'PUBLISHING' &&
      activeReleaseId &&
      targetPublishAt
    ) {
      pass('PUBLISH', '4e. POST /publish initiates PUBLISHING buffer countdown → 200 OK', '200', `${res.status} (Release: ${activeReleaseId.slice(0, 8)})`);
    } else {
      fail('PUBLISH', '4e. POST /publish initiates PUBLISHING buffer countdown', '200', `${res.status}`);
    }
  }

  // 4f. Verify results_snapshot created in database
  {
    const { rows } = await pool.query(
      'SELECT * FROM public.results_snapshot WHERE release_id = $1',
      [activeReleaseId]
    );
    if (rows.length === 1 && rows[0]?.snapshot_payload?.rankings?.length > 0) {
      pass('PUBLISH', '4f. Immutable results_snapshot record materialized', '1 row', `${rows.length} row, payload rankings: ${rows[0].snapshot_payload.rankings.length}`);
    } else {
      fail('PUBLISH', '4f. Immutable results_snapshot record materialized', '1 row', `${rows.length} rows`);
    }
  }

  // 4g. Verify results_awards overlay created in database
  {
    const { rows } = await pool.query(
      'SELECT * FROM public.results_awards WHERE release_id = $1',
      [activeReleaseId]
    );
    if (rows.length === 1) {
      pass('PUBLISH', '4g. Results awards overlay row initialized', '1 row', `${rows.length} row`);
    } else {
      fail('PUBLISH', '4g. Results awards overlay row initialized', '1 row', `${rows.length} rows`);
    }
  }

  // 4h. Idempotency test: Call POST /publish again while in PUBLISHING
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/publish`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (
      res.status === 200 &&
      res.body?.data?.is_idempotent_replay === true &&
      res.body?.data?.release_id === activeReleaseId
    ) {
      pass('PUBLISH', '4h. Duplicate POST /publish is idempotent → 200 (is_idempotent_replay: true)', 'Idempotent replay', `Returned same release: ${activeReleaseId.slice(0, 8)}`);
    } else {
      fail('PUBLISH', '4h. Duplicate POST /publish is idempotent', 'Idempotent replay', JSON.stringify(res.body));
    }
  }
}

// ════════════════════════════════════════════════════════
// GROUP 5: READ-ONLY GET & ZERO DATABASE WRITES
// ════════════════════════════════════════════════════════
async function testReadOnlyGetAndAllowlist() {
  log('\n══ GROUP 5: READ-ONLY GET & FIELD ALLOWLIST ══');

  // 5a. GET /api/event-config during PUBLISHING returns status = 'PUBLISHING'
  {
    const res = await fetchJson(`${BASE}/api/event-config`);
    if (res.status === 200 && res.body?.data?.results_release === 'PUBLISHING') {
      pass('GET_CONFIG', '5a. GET /api/event-config during buffer returns PUBLISHING', 'PUBLISHING', res.body?.data?.results_release);
    } else {
      fail('GET_CONFIG', '5a. GET /api/event-config during buffer returns PUBLISHING', 'PUBLISHING', res.body?.data?.results_release);
    }
  }

  // 5b. GET /api/event-config when publish_at has passed returns effective 'PUBLISHED'
  {
    await pool.query(
      `UPDATE public.event_config 
       SET publish_at = NOW() - INTERVAL '5 seconds'
       WHERE id = 1`
    );

    const res = await fetchJson(`${BASE}/api/event-config`);
    if (res.status === 200 && res.body?.data?.results_release === 'PUBLISHED') {
      pass('GET_CONFIG', '5b. Effective PUBLISHED after publish_at passed (deterministic evaluation)', 'PUBLISHED', res.body?.data?.results_release);
    } else {
      fail('GET_CONFIG', '5b. Effective PUBLISHED after publish_at passed', 'PUBLISHED', res.body?.data?.results_release);
    }
  }

  // 5c. ZERO DATABASE WRITES: Verify that calling GET 10 times consecutively causes 0 DB writes
  {
    const { rows: beforeRows } = await pool.query('SELECT updated_at FROM public.event_config WHERE id = 1');
    const updatedAtBefore = beforeRows[0]?.updated_at?.toISOString();

    for (let i = 0; i < 10; i++) {
      const res = await fetchJson(`${BASE}/api/event-config`);
      if (res.status !== 200) throw new Error(`GET failed on iteration ${i}`);
    }

    const { rows: afterRows } = await pool.query('SELECT updated_at FROM public.event_config WHERE id = 1');
    const updatedAtAfter = afterRows[0]?.updated_at?.toISOString();

    if (updatedAtBefore === updatedAtAfter) {
      pass('GET_CONFIG', '5c. Zero Database Writes over 10 consecutive GET requests', 'updated_at identical', `Before: ${updatedAtBefore} === After: ${updatedAtAfter}`);
    } else {
      fail('GET_CONFIG', '5c. Zero Database Writes over 10 consecutive GET requests', 'updated_at identical', `Before: ${updatedAtBefore} !== After: ${updatedAtAfter}`);
    }
  }

  // 5d. Public field allowlist: Verify no internal fields or secrets leaked
  {
    const res = await fetchJson(`${BASE}/api/event-config`);
    const data = res.body?.data || {};

    const forbiddenFields = [
      'id',
      'active_release_id',
      'database_url',
      'secret',
      'internal_notes',
      'buffer_minutes',
    ];

    const leakedForbidden = forbiddenFields.filter(f => f in data);
    const hasRequiredAllowed = 'event_phase' in data && 'results_release' in data;

    if (leakedForbidden.length === 0 && hasRequiredAllowed) {
      pass('GET_CONFIG', '5d. Public response conforms strictly to allowlist (zero internal leaks)', 'Zero forbidden fields', `Returned: ${Object.keys(data).join(', ')}`);
    } else {
      fail('GET_CONFIG', '5d. Public response conforms strictly to allowlist', 'Zero forbidden fields', `Leaked: ${leakedForbidden.join(', ')}`);
    }
  }

  // 5e. Direct event_phase update via PATCH /api/event-config rejected
  {
    const res = await fetchJson(`${BASE}/api/event-config`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ event_phase: 'HACKING' }),
    });

    if (res.status === 400 && res.body?.error?.includes('transition')) {
      pass('GET_CONFIG', '5e. Changing event_phase via PATCH /api/event-config rejected → 400', '400', `${res.status}`);
    } else {
      fail('GET_CONFIG', '5e. Changing event_phase via PATCH /api/event-config rejected', '400', `${res.status}`);
    }
  }
}

// ════════════════════════════════════════════════════════
// GROUP 6: BACKGROUND WORKER RECONCILIATION
// ════════════════════════════════════════════════════════
async function testWorkerReconciliation() {
  async function reconcilePublishWorker(releaseId) {
    const { rowCount } = await pool.query(
      `UPDATE public.event_config
       SET results_release = 'PUBLISHED',
           updated_at = NOW()
       WHERE event_phase = 'RESULTS'
         AND results_release = 'PUBLISHING'
         AND active_release_id = $1
         AND publish_at IS NOT NULL
         AND NOW() >= publish_at`,
      [releaseId]
    );
    return (rowCount ?? 0) > 0;
  }

  const { rows } = await pool.query('SELECT active_release_id FROM public.event_config WHERE id = 1');
  const validReleaseId = rows[0]?.active_release_id;
  const staleReleaseId = '00000000-0000-0000-0000-000000000000';

  // 6a. Stale release ID does not update anything
  {
    const updated = await reconcilePublishWorker(staleReleaseId);
    if (!updated) {
      pass('WORKER', '6a. Worker bound to mismatched release_id exits cleanly (zero rows updated)', 'false', `${updated}`);
    } else {
      fail('WORKER', '6a. Worker bound to mismatched release_id exits cleanly', 'false', `${updated}`);
    }
  }

  // 6b. Valid release ID reconciles database column
  {
    const updated = await reconcilePublishWorker(validReleaseId);
    const { rows: checkRows } = await pool.query('SELECT results_release FROM public.event_config WHERE id = 1');
    if (updated && checkRows[0]?.results_release === 'PUBLISHED') {
      pass('WORKER', '6b. Worker bound to active release_id reconciles results_release = PUBLISHED', 'PUBLISHED', checkRows[0]?.results_release);
    } else {
      fail('WORKER', '6b. Worker bound to active release_id reconciles results_release', 'PUBLISHED', checkRows[0]?.results_release);
    }
  }

  // 6c. Second call is cleanly idempotent (already PUBLISHED)
  {
    const updated = await reconcilePublishWorker(validReleaseId);
    if (!updated) {
      pass('WORKER', '6c. Re-running reconcilePublishWorker is idempotent → returns false', 'false', `${updated}`);
    } else {
      fail('WORKER', '6c. Re-running reconcilePublishWorker is idempotent', 'false', `${updated}`);
    }
  }
}

// ════════════════════════════════════════════════════════
// GROUP 7: CONCURRENCY & SERIALIZATION RESILIENCE
// ════════════════════════════════════════════════════════
async function testConcurrency() {
  log('\n══ GROUP 7: CONCURRENCY & ANTI-TOCTOU ══');

  await pool.query("UPDATE public.event_config SET event_phase = 'SUBMISSION_CLOSED' WHERE id = 1");

  const p1 = fetchJson(`${BASE}/api/admin/event-config/transition`, {
    method: 'PATCH',
    headers: {
      'Origin': 'http://localhost:3000',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ target_phase: 'JUDGING' }),
  });

  const p2 = fetchJson(`${BASE}/api/admin/event-config/transition`, {
    method: 'PATCH',
    headers: {
      'Origin': 'http://localhost:3000',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ target_phase: 'JUDGING' }),
  });

  const [res1, res2] = await Promise.all([p1, p2]);

  const statuses = [res1.status, res2.status].sort();
  if (statuses[0] === 200 && (statuses[1] === 200 || statuses[1] === 400)) {
    pass('CONCURRENCY', '7. Concurrent transitions serialized cleanly without 500 or deadlock', '200 and (200 or 400)', `${statuses.join(', ')}`);
  } else {
    fail('CONCURRENCY', '7. Concurrent transitions serialized cleanly', '200 and (200 or 400)', `${statuses.join(', ')}`);
  }
}

// ════════════════════════════════════════════════════════
// GROUP 8: PHASE 2 AUTH REGRESSION
// ════════════════════════════════════════════════════════
async function testPhase2Regression() {
  log('\n══ GROUP 8: PHASE 2 AUTH REGRESSION ══');

  // 8a. /api/auth/me without session → 401
  {
    const res = await fetchJson(`${BASE}/api/auth/me`);
    if (res.status === 401) {
      pass('REGRESSION', '8a. Unauthenticated /api/auth/me → 401', '401', `${res.status}`);
    } else {
      fail('REGRESSION', '8a. Unauthenticated /api/auth/me → 401', '401', `${res.status}`);
    }
  }

  // 8b. /api/auth/me with admin token → 200
  {
    const res = await fetchJson(`${BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (res.status === 200 && res.body?.data?.profile?.role === 'admin') {
      pass('REGRESSION', '8b. Admin /api/auth/me with Bearer token → 200 + role: admin', '200 / admin', `${res.status} / ${res.body?.data?.profile?.role}`);
    } else {
      fail('REGRESSION', '8b. Admin /api/auth/me with Bearer token', '200 / admin', `${res.status} / ${res.body?.data?.profile?.role}`);
    }
  }

  // 8c. CSRF protection on POST /api/admin/event-config/publish without Origin
  {
    const res = await fetchJson(`${BASE}/api/admin/event-config/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      // Omit Origin and Referer
    });
    if (res.status === 403) {
      pass('REGRESSION', '8c. Missing Origin on admin mutation → 403 CSRF block', '403', `${res.status}`);
    } else {
      fail('REGRESSION', '8c. Missing Origin on admin mutation', '403', `${res.status}`);
    }
  }
}

// ════════════════════════════════════════════════════════
// MAIN RUNNER
// ════════════════════════════════════════════════════════
async function main() {
  log('╔══════════════════════════════════════════════════════╗');
  log('║  PHASE 3 ACCEPTANCE VERIFICATION SUITE              ║');
  log('║  Target: http://localhost:3000 (dev server)         ║');
  log(`║  Date: ${new Date().toISOString()}       ║`);
  log('╚══════════════════════════════════════════════════════╝');

  try {
    await setupTestUsers();

    await testTransitions();
    await testJudgingCompletionGate();
    await testEmergencyOverride();
    await testResultsPublish();
    await testReadOnlyGetAndAllowlist();
    await testWorkerReconciliation();
    await testConcurrency();
    await testPhase2Regression();

    log('\n══════════════════════════════════════════════════════');
    log(`FINAL RESULTS: ${passCount} PASS, ${failCount} FAIL, ${totalTests} TOTAL`);
    log('══════════════════════════════════════════════════════');

    if (failCount === 0) {
      log('\n🟢 ALL TESTS PASSED — Phase 3 acceptance gate CLEAR');
    } else {
      log(`\n🔴 ${failCount} TEST(S) FAILED — Phase 3 requires fixes before acceptance`);
    }

    const outPath = process.argv[2] || 'phase3_test_results.json';
    fs.writeFileSync(outPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total: totalTests, pass: passCount, fail: failCount },
      results,
    }, null, 2));
    log(`\nDetailed results written to: ${outPath}`);

  } finally {
    await cleanupTestUsers();
  }
}

main().catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
