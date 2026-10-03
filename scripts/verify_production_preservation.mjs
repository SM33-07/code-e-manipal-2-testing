import { Client } from 'pg';

const prodUrl = process.env.DATABASE_URL;

async function checkPreservation() {
  const c = new Client({ connectionString: prodUrl, ssl: { rejectUnauthorized: false } });
  await c.connect();

  console.log('=== PRODUCTION DATA PRESERVATION & VERIFICATION REPORT ===\n');

  // 1. Profiles
  const profiles = await c.query('SELECT id, name, email, role, identifier, team_id, is_disabled FROM public.profiles ORDER BY role, created_at');
  console.log(`1. Profiles Table (${profiles.rows.length} rows - Expected: 12):`);
  console.table(profiles.rows.map(r => ({
    name: r.name,
    role: r.role,
    identifier: r.identifier,
    team_id: r.team_id ? `${r.team_id.slice(0, 8)}...` : 'NULL',
    is_disabled: r.is_disabled
  })));

  // 2. Teams
  const teams = await c.query('SELECT id, name, track, leader_name, created_at FROM public.teams ORDER BY created_at');
  console.log(`\n2. Teams Table (${teams.rows.length} rows - Expected: 2):`);
  console.table(teams.rows.map(r => ({
    id: `${r.id.slice(0, 8)}...`,
    name: r.name,
    track: r.track,
    leader_name: r.leader_name || 'N/A'
  })));

  // 3. Submissions
  const subs = await c.query('SELECT id, team_id, title, status, is_locked, final_submitted_at FROM public.submissions');
  console.log(`\n3. Submissions Table (${subs.rows.length} rows - Expected: 1):`);
  console.table(subs.rows.map(r => ({
    id: `${r.id.slice(0, 8)}...`,
    team_id: `${r.team_id.slice(0, 8)}...`,
    title: r.title,
    status: r.status,
    is_locked: r.is_locked
  })));

  // 4. Judge Reviews
  const revs = await c.query('SELECT id, submission_id, judge_id, score_innovation, score_technical, score_presentation, score_impact, version, is_complete FROM public.judge_reviews');
  console.log(`\n4. Judge Reviews Table (${revs.rows.length} rows - Expected: 1):`);
  console.table(revs.rows.map(r => ({
    id: `${r.id.slice(0, 8)}...`,
    innovation: r.score_innovation,
    technical: r.score_technical,
    presentation: r.score_presentation,
    impact: r.score_impact,
    version: r.version,
    is_complete: r.is_complete
  })));

  // 5. Event Configuration Singleton
  const ec = await c.query('SELECT * FROM public.event_config WHERE id = 1');
  console.log('\n5. Event Configuration Singleton (id=1):');
  console.table(ec.rows.map(r => ({
    id: r.id,
    phase: r.event_phase,
    release: r.results_release,
    buffer_min: r.buffer_minutes,
    start_time: r.start_time ? r.start_time.toISOString() : 'NULL',
    updated_at: r.updated_at.toISOString()
  })));

  // 6. Event Config Legacy KV Preserved Table
  const kv = await c.query('SELECT key, value FROM public.event_config_kv ORDER BY key');
  console.log(`\n6. Preserved Legacy Key-Value Store (${kv.rows.length} rows):`);
  kv.rows.forEach(r => console.log(`  • ${r.key.padEnd(25)} => ${r.value}`));

  await c.end();
}

checkPreservation().catch(console.error);
