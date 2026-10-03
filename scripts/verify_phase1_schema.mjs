import { Client } from 'pg';

let databaseUrl = process.argv[2] || process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

async function verify() {
  const urlObj = new URL(databaseUrl);
  console.log(`Connecting to: ${urlObj.hostname}:${urlObj.port}${urlObj.pathname}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('=== PHASE 1 SCHEMA VERIFICATION ===\n');

    const checks = [];

    // 1. Check event_config singleton
    const ec = await client.query(`SELECT * FROM public.event_config WHERE id = 1`);
    checks.push({
      item: 'event_config singleton (id=1)',
      status: ec.rows.length === 1 ? 'PASS' : 'FAIL',
      details: ec.rows[0] ? `phase=${ec.rows[0].event_phase}, release=${ec.rows[0].results_release}` : 'not found'
    });

    // 2. Check results_snapshot
    const rs = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'results_snapshot'
    `);
    const rsCols = rs.rows.map(r => r.column_name);
    const rsOk = ['id', 'release_id', 'snapshot_payload', 'created_at', 'created_by'].every(c => rsCols.includes(c));
    checks.push({
      item: 'results_snapshot table',
      status: rsOk ? 'PASS' : 'FAIL',
      details: rsCols.join(', ')
    });

    // 3. Check results_awards
    const ra = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'results_awards'
    `);
    const raCols = ra.rows.map(r => r.column_name);
    const raOk = ['id', 'release_id', 'award_overlay', 'updated_at', 'updated_by'].every(c => raCols.includes(c));
    checks.push({
      item: 'results_awards table',
      status: raOk ? 'PASS' : 'FAIL',
      details: raCols.join(', ')
    });

    // 4. Check review_history
    const rh = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'review_history'
    `);
    const rhCols = rh.rows.map(r => r.column_name);
    const rhOk = ['id', 'review_id', 'submission_id', 'judge_id', 'version', 'previous_scores', 'reason'].every(c => rhCols.includes(c));
    checks.push({
      item: 'review_history table',
      status: rhOk ? 'PASS' : 'FAIL',
      details: rhCols.join(', ')
    });

    // 5. Check judge_reviews.version
    const jrv = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'judge_reviews' AND column_name = 'version'
    `);
    checks.push({
      item: 'judge_reviews.version column',
      status: jrv.rows.length === 1 ? 'PASS' : 'FAIL',
      details: jrv.rows.length === 1 ? 'exists' : 'missing'
    });

    // 6. Check profiles.identifier uniqueness
    const pi = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'profiles' AND indexname = 'idx_profiles_identifier_unique'
    `);
    checks.push({
      item: 'profiles.identifier unique index',
      status: pi.rows.length === 1 ? 'PASS' : 'FAIL',
      details: pi.rows.length === 1 ? 'exists' : 'missing'
    });

    // 7. Check submissions unique(team_id)
    const su = await client.query(`
      SELECT conname FROM pg_constraint 
      WHERE conname = 'idx_submissions_team_id_unique'
    `);
    checks.push({
      item: 'submissions UNIQUE(team_id)',
      status: su.rows.length === 1 ? 'PASS' : 'FAIL',
      details: su.rows.length === 1 ? 'exists' : 'missing'
    });

    // 8. Check login_attempts (privacy minimized)
    const la = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'login_attempts'
    `);
    const laCols = la.rows.map(r => r.column_name);
    const laHasRawIp = laCols.includes('ip_address');
    const laHasHash = laCols.includes('ip_hash');
    checks.push({
      item: 'login_attempts privacy compliance',
      status: (!laHasRawIp && laHasHash) ? 'PASS' : 'FAIL',
      details: `has_hash: ${laHasHash}, has_raw_ip: ${laHasRawIp}`
    });

    // 9. Check audit_logs (privacy minimized)
    const al = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'audit_logs'
    `);
    const alCols = al.rows.map(r => r.column_name);
    const alHasRawIp = alCols.includes('ip_address');
    const alHasHash = alCols.includes('ip_hash');
    checks.push({
      item: 'audit_logs privacy compliance',
      status: (!alHasRawIp && alHasHash) ? 'PASS' : 'FAIL',
      details: `has_hash: ${alHasHash}, has_raw_ip: ${alHasRawIp}`
    });

    // Print summary table
    console.table(checks);

    const allPassed = checks.every(c => c.status === 'PASS');
    console.log(`\nOverall Verification Result: ${allPassed ? '✅ ALL CHECKS PASSED' : '⚠️ SOME CHECKS PENDING MIGRATION'}`);

  } catch (err) {
    console.error('Verification error:', err.message);
  } finally {
    await client.end();
  }
}

verify();
