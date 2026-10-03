import { Client } from 'pg';

const prodUrl = process.env.DATABASE_URL;
const u = new URL(prodUrl);
u.pathname = '/cem_staging';

async function run() {
  const c = new Client({ connectionString: u.toString(), ssl: { rejectUnauthorized: false } });
  await c.connect();

  console.log('=== STAGING SCHEMA CONTRACT VERIFICATION ===\n');

  const tables = await c.query("SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Public Tables and Views:');
  tables.rows.forEach(r => console.log(`  • ${r.table_name.padEnd(30)} [${r.table_type}]`));

  const funcs = await c.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name");
  console.log('\nPublic Routines:');
  funcs.rows.forEach(r => console.log(`  • ${r.routine_name}`));

  const constraints = await c.query(`
    SELECT conname, contype, relname 
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = 'public' AND cl.relname IN ('event_config', 'results_snapshot', 'results_awards', 'review_history', 'submissions', 'profiles')
    ORDER BY relname, conname;
  `);
  console.log('\nNew/Verified Constraints:');
  constraints.rows.forEach(r => console.log(`  • on ${r.relname.padEnd(20)} [${r.contype}] ${r.conname}`));

  await c.end();
}

run().catch(console.error);
