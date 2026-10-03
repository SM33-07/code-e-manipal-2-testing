import { Client } from 'pg';

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  
  // 1. Functions
  const f = await c.query(`
    SELECT routine_name, routine_type, security_type 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    ORDER BY routine_name
  `);
  console.log('=== FUNCTIONS IN PUBLIC SCHEMA ===');
  if (f.rows.length === 0) {
    console.log('  (No functions found in public schema)');
  }
  f.rows.forEach(r => {
    const isSecret = r.routine_name.toLowerCase().includes('secret');
    console.log(`  ${isSecret ? '🚨 [SUSPICIOUS]' : '•'} ${r.routine_name} (${r.routine_type}, sec: ${r.security_type})`);
  });

  // 2. Tables & counts
  const t = await c.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
    ORDER BY table_name
  `);
  console.log('\n=== TABLES & ROW COUNTS ===');
  for (const r of t.rows) {
    const cnt = await c.query(`SELECT count(*)::int as c FROM public."${r.table_name}"`);
    console.log(`  • ${r.table_name.padEnd(25)}: ${cnt.rows[0].c} rows`);
  }

  // 3. Profiles columns & constraints
  const p = await c.query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' 
    ORDER BY ordinal_position
  `);
  console.log('\n=== PROFILES COLUMNS ===');
  p.rows.forEach(r => {
    console.log(`  • ${r.column_name.padEnd(20)} ${r.data_type.padEnd(15)} nullable:${r.is_nullable} def:${r.column_default || 'none'}`);
  });

  const pCons = await c.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_class cl ON cl.oid = c.conrelid
    WHERE n.nspname = 'public' AND cl.relname = 'profiles'
    ORDER BY conname;
  `);
  console.log('\n=== PROFILES CONSTRAINTS ===');
  pCons.rows.forEach(r => console.log(`  • [${r.contype}] ${r.conname}: ${r.def}`));

  // 4. Event config contents
  const ec = await c.query(`SELECT * FROM public.event_config ORDER BY key`);
  console.log('\n=== EVENT_CONFIG ROWS ===');
  ec.rows.forEach(r => {
    console.log(`  • ${r.key} => ${r.value}`);
  });

  // 5. Existing roles in profiles
  const roles = await c.query(`SELECT DISTINCT role, count(*) FROM public.profiles GROUP BY role`);
  console.log('\n=== PROFILES ROLE DISTRIBUTION ===');
  roles.rows.forEach(r => console.log(`  • role "${r.role}": ${r.count} users`));

  // 6. Check for any triggers on key tables
  const trigs = await c.query(`
    SELECT event_object_table, trigger_name, action_timing, event_manipulation
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `);
  console.log('\n=== PUBLIC TRIGGERS ===');
  if (trigs.rows.length === 0) {
    console.log('  (No triggers found in public schema)');
  }
  trigs.rows.forEach(r => console.log(`  • on ${r.event_object_table}: ${r.trigger_name} (${r.action_timing} ${r.event_manipulation})`));

  // 7. Check auth schema tables in Azure DB
  const authTables = await c.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'auth'
    ORDER BY table_name;
  `);
  console.log('\n=== AUTH SCHEMA IN AZURE DB ===');
  if (authTables.rows.length === 0) {
    console.log('  (No auth schema tables found in Azure DB)');
  } else {
    for (const r of authTables.rows) {
      const cnt = await c.query(`SELECT count(*)::int as c FROM auth."${r.table_name}"`);
      console.log(`  • auth.${r.table_name.padEnd(20)}: ${cnt.rows[0].c} rows`);
    }
  }

  await c.end();
}

run().catch(console.error);
