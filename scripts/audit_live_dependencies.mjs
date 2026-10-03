import { Client } from 'pg';

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  console.log('=== AUDITING LIVE DATABASE DEPENDENCIES ===\n');

  // 1. Check routines for references to event_config
  const procs = await c.query(`
    SELECT proname, prosrc 
    FROM pg_proc 
    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
    WHERE nspname = 'public';
  `);
  console.log('1. Stored Procedures referencing event_config:');
  let procDeps = 0;
  procs.rows.forEach(r => {
    if (r.prosrc && r.prosrc.toLowerCase().includes('event_config')) {
      console.log(`  🚨 ${r.proname} references event_config!`);
      procDeps++;
    }
  });
  if (procDeps === 0) console.log('  ✅ No stored procedures reference event_config.');

  // 2. Check views referencing event_config, profiles, teams, submissions, judge_reviews
  const views = await c.query(`
    SELECT table_name, view_definition 
    FROM information_schema.views 
    WHERE table_schema = 'public';
  `);
  console.log('\n2. Public Views:');
  if (views.rows.length === 0) {
    console.log('  ✅ Zero public views exist in the database.');
  } else {
    views.rows.forEach(v => console.log(`  • ${v.table_name}`));
  }

  // 3. Check triggers on event_config
  const triggers = await c.query(`
    SELECT event_object_table, trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table IN ('event_config', 'profiles', 'teams', 'submissions', 'judge_reviews');
  `);
  console.log('\n3. Triggers on key tables:');
  triggers.rows.forEach(t => console.log(`  • on ${t.event_object_table}: ${t.trigger_name}`));

  // 4. Foreign Keys referencing profiles, teams, submissions, judge_reviews, event_config
  const fks = await c.query(`
    SELECT
      tc.table_name as source_table,
      kcu.column_name as source_column,
      ccu.table_name AS target_table,
      ccu.column_name AS target_column,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND (ccu.table_name IN ('event_config', 'profiles', 'teams', 'submissions', 'judge_reviews')
           OR tc.table_name IN ('event_config', 'profiles', 'teams', 'submissions', 'judge_reviews'))
    ORDER BY target_table, source_table;
  `);
  console.log('\n4. Foreign Key Relationships:');
  fks.rows.forEach(f => {
    console.log(`  • ${f.source_table}(${f.source_column}) -> ${f.target_table}(${f.target_column}) [ON DELETE ${f.delete_rule}]`);
  });

  // 5. Existing team_members relationships for the 12 profiles
  const tm = await c.query(`
    SELECT tm.team_id, tm.user_id, tm.role as tm_role, t.name as team_name, p.name as user_name, p.role as user_role
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    JOIN profiles p ON tm.user_id = p.id;
  `);
  console.log('\n5. Team Memberships for Existing Profiles:');
  tm.rows.forEach(r => {
    console.log(`  • User "${r.user_name}" (${r.user_role}, ID ${r.user_id}) -> Team "${r.team_name}" (${r.tm_role}, ID ${r.team_id})`);
  });

  // 6. Profiles without team membership
  const unlinked = await c.query(`
    SELECT p.id, p.name, p.email, p.role 
    FROM profiles p 
    LEFT JOIN team_members tm ON p.id = tm.user_id 
    WHERE tm.user_id IS NULL;
  `);
  console.log(`\n6. Profiles WITHOUT team membership (${unlinked.rows.length} users):`);
  unlinked.rows.forEach(r => console.log(`  • ${r.role.padEnd(12)}: "${r.name}" (${r.email || 'no email'})`));

  await c.end();
}

run().catch(console.error);
