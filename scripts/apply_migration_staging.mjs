import { Client } from 'pg';
import fs from 'fs';

const prodUrl = process.env.DATABASE_URL;

if (!prodUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

const urlObj = new URL(prodUrl);
urlObj.pathname = '/cem_staging';
const stagingUrl = urlObj.toString();

async function runStagingMigration() {
  console.log('=== APPLYING 020_v2_baseline_schema.sql TO STAGING DATABASE (cem_staging) ===\n');

  const client = new Client({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to Azure PostgreSQL staging database: cem_staging');

    const sql = fs.readFileSync('supabase/migrations/020_v2_baseline_schema.sql', 'utf8');
    console.log('⏳ Executing migration 020 inside atomic transaction block...');
    
    const startTime = Date.now();
    await client.query(sql);
    const duration = Date.now() - startTime;

    console.log(`✅ Staging migration committed successfully in ${duration}ms!`);
  } catch (err) {
    console.error('💥 Staging migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runStagingMigration();
