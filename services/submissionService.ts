import { query } from "@/lib/db";

// ─── LIST ─────────────────────────────
export async function listSubmissions(
  { limit, offset }: { limit: number; offset: number },
  filters: any
) {
  let sql = 'SELECT COUNT(*) OVER()::int AS total_count, * FROM public.submissions WHERE deleted_at IS NULL';
  const params: any[] = [];
  
  if (filters?.category) {
    params.push(filters.category);
    sql += ` AND category = $${params.length}`;
  }
  
  if (filters?.search) {
    params.push(`%${filters.search}%`);
    sql += ` AND title ILIKE $${params.length}`;
  }
  
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await query(sql, params);
  const total = rows[0]?.total_count ?? 0;

  // Map out total_count from each row object
  const submissions = rows.map((r: any) => {
    const { total_count, ...sub } = r;
    return sub;
  });

  return {
    submissions,
    total,
  };
}

// ─── GET BY ID ─────────────────────────
export async function getSubmissionById(id: string) {
  const { rows } = await query(
    'SELECT * FROM public.submissions WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

// ─── CREATE ────────────────────────────
export async function createSubmission(input: any) {
  // Check if team submissions are frozen or past individual deadline extension
  const { rows: teamRows } = await query(
    'SELECT submission_frozen, deadline_extension FROM public.teams WHERE id = $1',
    [input.team_id]
  );
  const team = teamRows[0];
  if (team) {
    if (team.submission_frozen) {
      throw new Error('SUBMISSION_FROZEN');
    }
    if (team.deadline_extension && new Date() > new Date(team.deadline_extension)) {
      throw new Error('SUBMISSION_DEADLINE_EXPIRED');
    }
  }

  const { rows } = await query(
    `INSERT INTO public.submissions (
      team_id, title, summary, category, technologies, github_url, demo_url, docs_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      input.team_id,
      input.title,
      input.summary,
      input.category,
      input.technologies || [],
      input.github_url,
      input.demo_url,
      input.docs_url,
    ]
  );

  return rows[0];
}

// ─── UPDATE ────────────────────────────
const ALLOWED_SUBMISSION_FIELDS = ['title', 'summary', 'category', 'technologies', 'github_url', 'demo_url', 'docs_url', 'status'];

export async function updateSubmission(id: string, input: any) {
  const sub = await getSubmissionById(id);
  if (!sub) {
    throw new Error('SUBMISSION_NOT_FOUND');
  }

  // Check if team submissions are frozen or past individual deadline extension
  const { rows: teamRows } = await query(
    'SELECT submission_frozen, deadline_extension FROM public.teams WHERE id = $1',
    [sub.team_id]
  );
  const team = teamRows[0];
  if (team) {
    if (team.submission_frozen) {
      throw new Error('SUBMISSION_FROZEN');
    }
    if (team.deadline_extension && new Date() > new Date(team.deadline_extension)) {
      throw new Error('SUBMISSION_DEADLINE_EXPIRED');
    }
  }

  const keys = Object.keys(input).filter(
    (k) => ALLOWED_SUBMISSION_FIELDS.includes(k) && /^[a-z_]+$/.test(k)
  );
  if (keys.length === 0) {
    return sub;
  }

  const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
  const values = keys.map(key => input[key]);

  const { rows } = await query(
    `UPDATE public.submissions SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return rows[0];
}

// ─── DELETE (HARD) ─────────────────────
export async function deleteSubmission(id: string) {
  await query('DELETE FROM public.submissions WHERE id = $1', [id]);
}