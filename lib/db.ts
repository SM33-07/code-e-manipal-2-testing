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
  max: 20,                       // Max active connections in pool per Next.js server instance
  idleTimeoutMillis: 30000,      // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail connection attempt after 5s
});

/**
 * Execute a query against the Azure Postgres database
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  return pool.query<T>(text, params);
}

