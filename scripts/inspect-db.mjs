import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

async function inspect() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('=== CONNECTED TO DATABASE ===\n');

    // 1. Check for secret_* functions or any functions in public
    console.log('--- 1. FUNCTION INSPECTION ---');
    const funcs = await client.query(`
      SELECT routine_name, routine_type, security_type, data_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `);
    console.log(`Found ${funcs.rows.length} routines in public schema:`);
    funcs.rows.forEach(r => {
      const isSecret = r.routine_name.toLowerCase().includes('secret');
      console.log(`  ${isSecret ? '🚨 [SUSPICIOUS]' : '•'} ${r.routine_name} (${r.routine_type}, sec: ${r.security_type})`);
    });

    // 2. List all public tables
    console.log('\n--- 2. PUBLIC TABLES & ROW COUNTS ---');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    for (const row of tables.rows) {
      const tbl = row.table_name;
      try {
        const countRes = await client.query(`SELECT count(*)::int AS cnt FROM public."${tbl}"`);
        console.log(`  • ${tbl.padEnd(25)} : ${countRes.rows[0].cnt} rows`);
      } catch (err) {
        console.log(`  • ${tbl.padEnd(25)} : [error counting: ${err.message}]`);
      }
    }

    // 3. Detailed schema for key tables
    const keyTables = ['profiles', 'teams', 'submissions', 'judge_reviews', 'reviews', 'event_config', 'judge_assignments', 'registrations'];
    console.log('\n--- 3. KEY TABLE COLUMNS & CONSTRAINTS ---');

    for (const tbl of keyTables) {
      const exists = tables.rows.some(t => t.table_name === tbl);
      if (!exists) {
        console.log(`\nTable '${tbl}': DOES NOT EXIST`);
        continue;
      }

      console.log(`\nTable '${tbl}':`);
      // Columns
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tbl]);
      console.log('  Columns:');
      cols.rows.forEach(c => {
        const nullStr = c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defStr = c.column_default ? ` DEFAULT ${c.column_default}` : '';
        console.log(`    - ${c.column_name.padEnd(25)} ${c.data_type.padEnd(18)} ${nullStr}${defStr}`);
      });

      // Constraints
      const constraints = await client.query(`
        SELECT conname, contype, pg_get_constraintdef(c.oid) as def
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class cl ON cl.oid = c.conrelid
        WHERE n.nspname = 'public' AND cl.relname = $1
        ORDER BY conname;
      `, [tbl]);
      if (constraints.rows.length > 0) {
        console.log('  Constraints:');
        constraints.rows.forEach(c => {
          console.log(`    - [${c.contype}] ${c.conname}: ${c.def}`);
        });
      }

      // Indexes
      const indexes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = $1
        ORDER BY indexname;
      `, [tbl]);
      if (indexes.rows.length > 0) {
        console.log('  Indexes:');
        indexes.rows.forEach(idx => {
          console.log(`    - ${idx.indexname}: ${idx.indexdef}`);
        });
      }
    }

    // 4. Check custom types/enums
    console.log('\n--- 4. CUSTOM ENUMS / TYPES ---');
    const types = await client.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);
    const enumsMap = {};
    types.rows.forEach(r => {
      enumsMap[r.enum_name] = enumsMap[r.enum_name] || [];
      enumsMap[r.enum_name].push(r.enum_value);
    });
    for (const [k, v] of Object.entries(enumsMap)) {
      console.log(`  • ${k}: [${v.join(', ')}]`);
    }

    console.log('\n=== INSPECTION COMPLETE ===');
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await client.end();
  }
}

inspect();
