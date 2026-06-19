const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is missing.');
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
    console.log('🔌 Connected to database.');

    await client.query('ALTER TABLE public.hackathon_registrations ADD COLUMN IF NOT EXISTS encrypted_password TEXT;');
    console.log('✅ Column encrypted_password added successfully (if it did not exist).');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
