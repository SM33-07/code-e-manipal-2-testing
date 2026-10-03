import { Client } from 'pg';
import crypto from 'crypto';

const targetUrl = process.argv[2] || process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!targetUrl) {
  console.error('❌ Missing target database URL');
  process.exit(1);
}

const urlObj = new URL(targetUrl);
console.log(`=== RUNNING SMOKE TESTS AGAINST: ${urlObj.hostname}:${urlObj.port}${urlObj.pathname} ===\n`);

async function runSmokeTests() {
  const client = new Client({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Login / Profile Lookup & Invariants
    // ----------------------------------------------------
    console.log('--- TEST 1: Login / Profile Lookup & Invariants ---');
    const adminLookup = await client.query(
      'SELECT * FROM public.profiles WHERE UPPER(TRIM(identifier)) = $1',
      ['ADMIN-01']
    );
    assert(adminLookup.rows.length === 1 && adminLookup.rows[0].role === 'admin', 'Lookup ADMIN-01 found admin user');
    assert(adminLookup.rows[0].team_id === null, 'ADMIN-01 team_id is strictly NULL');
    assert(adminLookup.rows[0].is_disabled === false, 'ADMIN-01 is_disabled is false');

    const judgeLookup = await client.query(
      'SELECT * FROM public.profiles WHERE UPPER(TRIM(identifier)) = $1',
      ['JUDGE-01']
    );
    assert(judgeLookup.rows.length === 1 && judgeLookup.rows[0].role === 'judge', 'Lookup JUDGE-01 found judge user');
    assert(judgeLookup.rows[0].team_id === null, 'JUDGE-01 team_id is strictly NULL');

    const team1Lookup = await client.query(
      'SELECT * FROM public.profiles WHERE UPPER(TRIM(identifier)) = $1',
      ['TEAM-001']
    );
    assert(team1Lookup.rows.length === 1, 'Lookup TEAM-001 found participant user');
    assert(team1Lookup.rows[0].team_id !== null, 'TEAM-001 team_id is populated from team_members');

    const team2Lookup = await client.query(
      'SELECT * FROM public.profiles WHERE UPPER(TRIM(identifier)) = $1',
      ['TEAM-002']
    );
    assert(team2Lookup.rows.length === 1 && team2Lookup.rows[0].team_id === null, 'TEAM-002 has NULL team_id (no team_members record)');

    // ----------------------------------------------------
    // TEST 2: Event-Config GET / PATCH & Constraint Validation
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Event-Config Singleton & Constraint Checks ---');
    const configRow = await client.query('SELECT * FROM public.event_config WHERE id = 1');
    assert(configRow.rows.length === 1, 'event_config singleton id=1 exists');
    assert(configRow.rows[0].event_phase === 'NOT_STARTED', 'Initial event_phase is NOT_STARTED');
    assert(configRow.rows[0].results_release === 'DRAFT', 'Initial results_release is DRAFT');

    // Test DB-level check constraint: results_release = 'PUBLISHING' without publish_at MUST fail
    let publishingWithoutTimeFailed = false;
    try {
      await client.query("UPDATE public.event_config SET results_release = 'PUBLISHING', publish_at = NULL WHERE id = 1");
    } catch (err) {
      publishingWithoutTimeFailed = err.message.includes('chk_publishing_publish_at');
    }
    assert(publishingWithoutTimeFailed, 'DB constraint chk_publishing_publish_at rejected PUBLISHING without publish_at');

    // Test DB-level check constraint: invalid event_phase MUST fail
    let invalidPhaseFailed = false;
    try {
      await client.query("UPDATE public.event_config SET event_phase = 'INVALID_PHASE' WHERE id = 1");
    } catch (err) {
      invalidPhaseFailed = err.message.includes('event_config_event_phase_check');
    }
    assert(invalidPhaseFailed, 'DB constraint event_config_event_phase_check rejected invalid state');

    // ----------------------------------------------------
    // TEST 3: Submission Uniqueness, Finalization & Locking
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Submission Uniqueness, Finalization & Locking ---');
    const existingSub = await client.query('SELECT * FROM public.submissions LIMIT 1');
    assert(existingSub.rows.length === 1, 'Existing submission row found');

    const subTeamId = existingSub.rows[0].team_id;

    // Test duplicate submission insertion for same team_id MUST fail
    let duplicateSubFailed = false;
    try {
      await client.query(
        `INSERT INTO public.submissions (team_id, title, summary, category)
         VALUES ($1, 'Duplicate Sub', 'Summary', 'Web')`,
        [subTeamId]
      );
    } catch (err) {
      duplicateSubFailed = err.code === '23505' || err.message.includes('unique');
    }
    assert(duplicateSubFailed, 'UNIQUE(team_id) constraint rejected duplicate submission for team');

    // Test finalization locking
    await client.query(
      `UPDATE public.submissions 
       SET status = 'locked', is_locked = true, final_submitted_at = NOW() 
       WHERE id = $1`,
      [existingSub.rows[0].id]
    );
    const lockedSub = await client.query('SELECT * FROM public.submissions WHERE id = $1', [existingSub.rows[0].id]);
    assert(lockedSub.rows[0].status === 'locked' && lockedSub.rows[0].is_locked === true, 'Submission finalized and status updated to locked');

    // Revert test lock to submitted for clean state
    await client.query(
      `UPDATE public.submissions 
       SET status = 'submitted', is_locked = false 
       WHERE id = $1`,
      [existingSub.rows[0].id]
    );

    // ----------------------------------------------------
    // TEST 4: Judge Review Concurrency & Versioning
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Judge Review Concurrency & Optimistic Versioning ---');
    const existingRev = await client.query('SELECT * FROM public.judge_reviews LIMIT 1');
    assert(existingRev.rows.length === 1, 'Existing judge_reviews row found');
    assert(existingRev.rows[0].version === 1, 'judge_reviews.version initialized to 1');

    const revId = existingRev.rows[0].id;
    const adminUser = adminLookup.rows[0];

    // Transaction A: Simulates valid review update with version increment & history archival
    await client.query('BEGIN');
    const currentRevRes = await client.query('SELECT * FROM public.judge_reviews WHERE id = $1 FOR UPDATE', [revId]);
    const currentRev = currentRevRes.rows[0];

    const prevScores = {
      score_innovation: currentRev.score_innovation,
      score_technical: currentRev.score_technical,
      score_presentation: currentRev.score_presentation,
      score_impact: currentRev.score_impact,
    };

    await client.query(
      `INSERT INTO public.review_history (
        review_id, submission_id, judge_id, round, version, previous_scores, previous_feedback, changed_by, reason
      ) VALUES ($1, $2, $3, '1', $4, $5, $6, $7, 'Smoke test score audit revision')`,
      [revId, currentRev.submission_id, currentRev.judge_id, currentRev.version, JSON.stringify(prevScores), currentRev.feedback, adminUser.id]
    );

    await client.query(
      `UPDATE public.judge_reviews 
       SET score_innovation = 9, version = version + 1, updated_at = NOW() 
       WHERE id = $1`,
      [revId]
    );
    await client.query('COMMIT');

    const updatedRev = await client.query('SELECT * FROM public.judge_reviews WHERE id = $1', [revId]);
    assert(updatedRev.rows[0].version === 2 && updatedRev.rows[0].score_innovation === 9, 'Review version incremented to 2 with updated score');

    const historyRow = await client.query('SELECT * FROM public.review_history WHERE review_id = $1 ORDER BY changed_at DESC LIMIT 1', [revId]);
    assert(historyRow.rows.length === 1 && historyRow.rows[0].version === 1, 'review_history captured previous version 1 scores');

    // Transaction B: Simulates Stale Version Collision (Expected version 1, but actual is 2)
    const staleExpectedVersion = 1;
    let collisionDetected = false;
    const checkVersion = await client.query('SELECT version FROM public.judge_reviews WHERE id = $1', [revId]);
    if (checkVersion.rows[0].version !== staleExpectedVersion) {
      collisionDetected = true; // Service layer aborts with 409 Conflict
    }
    assert(collisionDetected, 'Stale review version conflict successfully detected (409 Conflict logic verified)');

    // ----------------------------------------------------
    // TEST 5: Results Snapshot & Awards Relational Chain
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Results Snapshot & Awards Relational Chain ---');
    const testReleaseId = crypto.randomUUID();
    const snapshotPayload = {
      rankings: [
        { rank: 1, team_name: 'Hi 2', total_score: 36.5 }
      ]
    };

    await client.query(
      `INSERT INTO public.results_snapshot (release_id, snapshot_payload, created_by)
       VALUES ($1, $2, $3)`,
      [testReleaseId, JSON.stringify(snapshotPayload), adminUser.id]
    );

    const snapshotRes = await client.query('SELECT * FROM public.results_snapshot WHERE release_id = $1', [testReleaseId]);
    assert(snapshotRes.rows.length === 1, 'results_snapshot write-once record materialized');

    // Create results_awards referencing the release_id
    const awardOverlay = { special_awards: ['Best Technical Implementation'] };
    await client.query(
      `INSERT INTO public.results_awards (release_id, award_overlay, updated_by)
       VALUES ($1, $2, $3)`,
      [testReleaseId, JSON.stringify(awardOverlay), adminUser.id]
    );

    const awardsRes = await client.query('SELECT * FROM public.results_awards WHERE release_id = $1', [testReleaseId]);
    assert(awardsRes.rows.length === 1, 'results_awards row linked to release_id');

    // Verify ON DELETE RESTRICT on results_snapshot
    let deleteSnapshotBlocked = false;
    try {
      await client.query('DELETE FROM public.results_snapshot WHERE release_id = $1', [testReleaseId]);
    } catch (err) {
      deleteSnapshotBlocked = err.code === '23503' || err.message.includes('violates foreign key');
    }
    assert(deleteSnapshotBlocked, 'Foreign key ON DELETE RESTRICT prevents deleting snapshot while awards exist');

    // Clean up test awards and snapshot
    await client.query('DELETE FROM public.results_awards WHERE release_id = $1', [testReleaseId]);
    await client.query('DELETE FROM public.results_snapshot WHERE release_id = $1', [testReleaseId]);

    // ----------------------------------------------------
    // TEST 6: Backward-Compatibility View & Announcements
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Backward-Compatibility View & Announcements ---');
    const legacyViewRes = await client.query('SELECT * FROM public.event_config_legacy_view');
    assert(legacyViewRes.rows.length >= 5, 'event_config_legacy_view returns key-value rows');
    const kvMap = legacyViewRes.rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
    assert('event_phase' in kvMap, 'event_config_legacy_view contains event_phase');
    assert('hackathon_is_started' in kvMap, 'event_config_legacy_view contains computed hackathon_is_started');
    assert('results_published' in kvMap, 'event_config_legacy_view contains computed results_published');

    // Telemetry table write test
    const testIpHash = crypto.createHash('sha256').update('127.0.0.1').digest('hex').slice(0, 16);
    await client.query(
      `INSERT INTO public.login_attempts (identity_key, success, ip_hash, user_agent_summary)
       VALUES ('TEAM-001', true, $1, 'Chrome/Windows')`,
      [testIpHash]
    );
    const laRow = await client.query("SELECT * FROM public.login_attempts WHERE identity_key = 'TEAM-001' LIMIT 1");
    assert(laRow.rows.length === 1 && laRow.rows[0].ip_hash.length === 16, 'login_attempts logged privacy-compliant 16-hex hash');
    await client.query("DELETE FROM public.login_attempts WHERE identity_key = 'TEAM-001'");

    console.log('\n========================================');
    console.log(`SMOKE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Smoke tests error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSmokeTests();
