const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is missing.');
  console.error('Make sure you run this script with the --env-file=.env.local flag:');
  console.error('node --env-file=.env.local scripts/run-migrations.js');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('🔌 Connected to Azure PostgreSQL Database successfully.');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    
    // Read and sort SQL files alphabetically (e.g. 001_schema.sql, 002_seed.sql)
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`📂 Found ${migrationFiles.length} migration files in ${migrationsDir}.`);

    for (const file of migrationFiles) {
      console.log(`\n⏳ Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      // Run each migration inside a dedicated transaction block
      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query('COMMIT');
        console.log(`✅ Completed: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ FAILED migration ${file}:`);
        console.error(err.message);
        throw err;
      }
    }

    console.log('\n🎉 Database schema migration completed successfully!');
  } catch (err) {
    console.error('\n💥 Migration execution halted due to errors.');
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
