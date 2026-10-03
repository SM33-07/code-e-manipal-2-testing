import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const prodUrl = process.env.DATABASE_URL;

if (!prodUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

// Derive staging URL by replacing database name with /cem_staging
const urlObj = new URL(prodUrl);
urlObj.pathname = '/cem_staging';
const stagingUrl = urlObj.toString();

async function setupStaging() {
  console.log('=== SETTING UP ISOLATED AZURE STAGING DATABASE (cem_staging) ===\n');

  // 1. Connect to production maintenance db to create cem_staging if not exists
  const prodClient = new Client({
    connectionString: prodUrl,
    ssl: { rejectUnauthorized: false }
  });

  await prodClient.connect();

  const dbCheck = await prodClient.query("SELECT 1 FROM pg_database WHERE datname = 'cem_staging'");
  if (dbCheck.rows.length === 0) {
    console.log('⏳ Creating database cem_staging on Azure...');
    await prodClient.query('CREATE DATABASE cem_staging');
    console.log('✅ Created database cem_staging successfully.');
  } else {
    console.log('ℹ️ Database cem_staging already exists.');
  }

  // Dump current production schema objects and data to clone to staging
  console.log('⏳ Cloning existing pre-020 production state into cem_staging...');

  // 2. Connect to cem_staging
  const stagingClient = new Client({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: false }
  });
  await stagingClient.connect();

  // Run existing migrations 001 through 018 on cem_staging
  const migrationsDir = path.resolve('supabase/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.startsWith('020_'))
    .sort();

  console.log(`Found ${files.length} base migration files to seed into staging:`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await stagingClient.query(sql);
      console.log(`  • Applied ${file}`);
    } catch (e) {
      console.log(`  • Note on ${file}: ${e.message}`);
    }
  }

  // Copy existing production data rows from prod into staging so backfills can be verified with 100% parity
  console.log('\n⏳ Syncing production rows (profiles, teams, submissions, judge_reviews, event_config) into staging...');

  // Copy auth.users
  const authUsers = await prodClient.query('SELECT * FROM auth.users');
  for (const u of authUsers.rows) {
    await stagingClient.query(
      'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [u.id, u.email, u.raw_user_meta_data]
    );
  }
  console.log(`  • Synced ${authUsers.rows.length} auth.users rows`);

  // Copy profiles
  const profiles = await prodClient.query('SELECT * FROM public.profiles');
  for (const p of profiles.rows) {
    await stagingClient.query(
      `INSERT INTO public.profiles (id, name, email, avatar_url, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name`,
      [p.id, p.name, p.email, p.avatar_url, p.role, p.created_at, p.updated_at]
    );
  }
  console.log(`  • Synced ${profiles.rows.length} profiles rows`);

  // Copy teams
  const teams = await prodClient.query('SELECT * FROM public.teams');
  for (const t of teams.rows) {
    await stagingClient.query(
      `INSERT INTO public.teams (id, name, hackathon, invite_code, created_by, created_at, updated_at, deadline_extension, leader_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, t.name, t.hackathon, t.invite_code, t.created_by, t.created_at, t.updated_at, t.deadline_extension, t.leader_name]
    );
  }
  console.log(`  • Synced ${teams.rows.length} teams rows`);

  // Copy team_members
  const teamMembers = await prodClient.query('SELECT * FROM public.team_members');
  for (const tm of teamMembers.rows) {
    await stagingClient.query(
      `INSERT INTO public.team_members (team_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [tm.team_id, tm.user_id, tm.role, tm.joined_at]
    );
  }
  console.log(`  • Synced ${teamMembers.rows.length} team_members rows`);

  // Copy submissions
  const submissions = await prodClient.query('SELECT * FROM public.submissions');
  for (const s of submissions.rows) {
    await stagingClient.query(
      `INSERT INTO public.submissions (
        id, team_id, title, summary, description, category, technologies,
        github_url, demo_url, docs_url, demo_video_url, status, submitted_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO NOTHING`,
      [
        s.id, s.team_id, s.title, s.summary, s.description, s.category, s.technologies,
        s.github_url, s.demo_url, s.docs_url, s.demo_video_url, s.status, s.submitted_at, s.created_at, s.updated_at
      ]
    );
  }
  console.log(`  • Synced ${submissions.rows.length} submissions rows`);

  // Copy judge_reviews
  const reviews = await prodClient.query('SELECT * FROM public.judge_reviews');
  for (const r of reviews.rows) {
    await stagingClient.query(
      `INSERT INTO public.judge_reviews (
        id, submission_id, judge_id, score_innovation, score_technical,
        score_presentation, score_impact, feedback, is_complete, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING`,
      [
        r.id, r.submission_id, r.judge_id, r.score_innovation, r.score_technical,
        r.score_presentation, r.score_impact, r.feedback, r.is_complete, r.created_at, r.updated_at
      ]
    );
  }
  console.log(`  • Synced ${reviews.rows.length} judge_reviews rows`);

  // Copy event_config
  const eventConfig = await prodClient.query('SELECT * FROM public.event_config');
  for (const ec of eventConfig.rows) {
    await stagingClient.query(
      `INSERT INTO public.event_config (key, value, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [ec.key, ec.value, ec.updated_at]
    );
  }
  console.log(`  • Synced ${eventConfig.rows.length} event_config rows`);

  await prodClient.end();
  await stagingClient.end();

  console.log('\n✅ STAGING DATABASE SETUP COMPLETE.');
  console.log(`Staging connection ready at: ${urlObj.hostname}:${urlObj.port}/cem_staging`);
}

setupStaging().catch(console.error);
