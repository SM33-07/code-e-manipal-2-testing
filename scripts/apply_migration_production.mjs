import { Client } from 'pg';
import fs from 'fs';

const prodUrl = process.env.DATABASE_URL;

if (!prodUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

const urlObj = new URL(prodUrl);

async function runProductionMigration() {
  console.log('=== APPLYING 020_v2_baseline_schema.sql TO AZURE PRODUCTION DATABASE ===');
  console.log(`Target: ${urlObj.hostname}:${urlObj.port}${urlObj.pathname}\n`);

  const client = new Client({
    connectionString: prodUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to Azure PostgreSQL production database.');

    const sql = fs.readFileSync('supabase/migrations/020_v2_baseline_schema.sql', 'utf8');
    console.log('⏳ Executing 020_v2_baseline_schema.sql inside atomic transaction...');
    
    const startTime = Date.now();
    await client.query(sql);
    const duration = Date.now() - startTime;

    console.log(`\n🎉 PRODUCTION MIGRATION COMMITTED SUCCESSFULLY in ${duration}ms!`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
  } catch (err) {
    console.error('💥 Production migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runProductionMigration();
