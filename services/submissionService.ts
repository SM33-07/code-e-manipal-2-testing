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
  const submission = rows[0];
  if (!submission) return null;

  // Join team and team members with profiles
  const teamRes = await query(
    `SELECT t.id, t.name, t.hackathon,
       COALESCE(
         json_agg(
           json_build_object(
             'user_id', tm.user_id,
             'role', tm.role,
             'profiles', json_build_object('name', p.name, 'avatar_url', p.avatar_url)
           )
         ) FILTER (WHERE tm.user_id IS NOT NULL),
         '[]'
       ) AS team_members
     FROM public.teams t
     LEFT JOIN public.team_members tm ON tm.team_id = t.id
     LEFT JOIN public.profiles p ON p.id = tm.user_id
     WHERE t.id = $1
     GROUP BY t.id`,
    [submission.team_id]
  );
  submission.teams = teamRes.rows[0] || null;

  // Load judge reviews
  const reviewsRes = await query(
    `SELECT jr.score_innovation, jr.score_technical, jr.score_presentation, jr.score_impact, jr.feedback, jr.is_complete,
            json_build_object('name', p.name) AS profiles
     FROM public.judge_reviews jr
     JOIN public.profiles p ON p.id = jr.judge_id
     WHERE jr.submission_id = $1 AND jr.is_complete = TRUE`,
    [id]
  );
  submission.reviews = reviewsRes.rows || [];

  return submission;
}

async function checkSubmissionDeadline(teamId: string) {
  const { rows: teamRows } = await query(
    'SELECT submission_frozen, deadline_extension FROM public.teams WHERE id = $1',
    [teamId]
  );
  const team = teamRows[0];
  if (!team) return;

  if (team.submission_frozen) {
    throw new Error('SUBMISSION_FROZEN');
  }

  const configRes = await query('SELECT key, value FROM public.event_config');
  const config = configRes.rows.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  if (config.hackathon_is_started === 'true' && config.hackathon_start_time) {
    const startTime = new Date(config.hackathon_start_time).getTime();
    const durationHours = parseFloat(config.hackathon_duration_hours || '48');
    const endTime = startTime + durationHours * 60 * 60 * 1000;

    if (Date.now() > endTime) {
      if (!team.deadline_extension) {
        throw new Error('SUBMISSION_DEADLINE_EXPIRED');
      }
      if (new Date() > new Date(team.deadline_extension)) {
        throw new Error('SUBMISSION_DEADLINE_EXPIRED');
      }
    }
  }
}

// ─── CREATE ────────────────────────────
export async function createSubmission(input: any) {
  await checkSubmissionDeadline(input.team_id);

  const { rows } = await query(
    `INSERT INTO public.submissions (
      team_id, title, summary, category, technologies, github_url, demo_url, docs_url,
      tagline, problem_solved, architecture_overview, technical_challenges, demo_video_url,
      what_worked_well, challenges_faced, lessons_learned, future_roadmap
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
    [
      input.team_id,
      input.title,
      input.summary,
      input.category,
      input.technologies || [],
      input.github_url,
      input.demo_url,
      input.docs_url,
      input.tagline || null,
      input.problem_solved || null,
      input.architecture_overview || null,
      input.technical_challenges || null,
      input.demo_video_url || null,
      input.what_worked_well || null,
      input.challenges_faced || null,
      input.lessons_learned || null,
      input.future_roadmap || null,
    ]
  );

  return rows[0];
}

// ─── UPDATE ────────────────────────────
const ALLOWED_SUBMISSION_FIELDS = [
  'title', 'summary', 'category', 'technologies', 'github_url', 'demo_url', 'docs_url', 'status',
  'tagline', 'problem_solved', 'architecture_overview', 'technical_challenges', 'demo_video_url',
  'what_worked_well', 'challenges_faced', 'lessons_learned', 'future_roadmap'
];

export async function updateSubmission(id: string, input: any) {
  const sub = await getSubmissionById(id);
  if (!sub) {
    throw new Error('SUBMISSION_NOT_FOUND');
  }

  await checkSubmissionDeadline(sub.team_id);

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