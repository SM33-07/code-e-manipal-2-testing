import { Pool, QueryResultRow } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('❌ Missing DATABASE_URL environment variable');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    // Azure Flexible Server forces SSL by default.
    // We set rejectUnauthorized to false to allow SSL connection without configuring a custom CA certificate locally.
    rejectUnauthorized: false,
  },
  max: 5,                         // Keep low for serverless (each Vercel function gets its own pool)
  idleTimeoutMillis: 10000,       // Close idle connections after 10s (serverless functions are short-lived)
  connectionTimeoutMillis: 10000, // Allow 10s for Azure cold-start connections
});

// Prevent uncaught pool errors from crashing the process
pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err.message);
});

/**
 * Execute a query against the Azure Postgres database
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  return pool.query<T>(text, params);
}

