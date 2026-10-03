import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const tables = ['teams', 'submissions', 'judge_assignments', 'judge_reviews', 'rubrics'];
  for (const t of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [t]);
    console.log(`=== TABLE: ${t} ===`);
    console.table(res.rows);
  }
  await pool.end();
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
