-- ============================================================
-- LEARNIT SUBMISSION PORTAL — Seed Data
-- Run AFTER schema.sql.
-- Steps:
--   1. Create users in Supabase Auth dashboard (or via API).
--   2. Copy their UUIDs and replace the placeholders below.
--   3. Run this file in Supabase Dashboard → SQL Editor.
-- ============================================================

-- ── Promote users to judge / admin by email ──────────────────
-- (Run after the users have signed up so profiles exist)

-- UPDATE public.profiles SET role = 'admin'
--   WHERE email = 'admin@learnit.dev';

-- UPDATE public.profiles SET role = 'judge'
--   WHERE email IN ('judge1@learnit.dev', 'judge2@learnit.dev', 'judge3@learnit.dev');

-- ── Sample Teams ──────────────────────────────────────────────
INSERT INTO public.teams (id, name, hackathon, invite_code) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Team Alpha',   'LearnIT 2025', 'ALPHA001'),
  ('a1000000-0000-0000-0000-000000000002', 'Team Beta',    'LearnIT 2025', 'BETA0002'),
  ('a1000000-0000-0000-0000-000000000003', 'Team Gamma',   'LearnIT 2025', 'GAMMA003'),
  ('a1000000-0000-0000-0000-000000000004', 'Team Delta',   'LearnIT 2025', 'DELTA004'),
  ('a1000000-0000-0000-0000-000000000005', 'Team Epsilon', 'LearnIT 2025', 'EPSI0005')
ON CONFLICT DO NOTHING;

-- ── Sample Submissions ────────────────────────────────────────
INSERT INTO public.submissions (
  id, team_id, title, summary, description,
  category, technologies,
  github_url, demo_url, docs_url,
  status, submitted_at
) VALUES

-- 1. Reviewed
(
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'EcoTrack — Carbon Footprint Monitor',
  'A real-time dashboard that monitors and gamifies reducing personal carbon footprint using IoT sensors and ML predictions.',
  'EcoTrack integrates IoT sensors installed at home with a Next.js dashboard to give households live insights into their energy consumption and carbon output. The ML model predicts weekly usage patterns and triggers personalised challenges. Gamification (badges, leaderboards) drives sustained behaviour change. Supabase Realtime pushes updates to the dashboard without polling.',
  'Sustainability',
  ARRAY['Next.js', 'Supabase', 'TailwindCSS', 'TypeScript', 'Python', 'IoT'],
  'https://github.com/learnit/ecotrack',
  'https://ecotrack-demo.vercel.app',
  'https://docs.ecotrack.dev',
  'reviewed',
  NOW() - INTERVAL '5 days'
),

-- 2. Reviewed
(
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'MedAssist — AI Triage Bot',
  'An AI-powered symptom checker that helps rural clinics pre-triage patients before doctor visits.',
  'MedAssist uses a fine-tuned LLM to guide patients through a structured symptom assessment via WhatsApp or a web form. It integrates with clinic scheduling and flags high-risk cases for immediate human attention. Designed to work on 2G connections for low-connectivity rural areas.',
  'Healthcare',
  ARRAY['Python', 'FastAPI', 'OpenAI', 'React', 'PostgreSQL', 'Twilio'],
  'https://github.com/learnit/medassist',
  'https://medassist-demo.netlify.app',
  NULL,
  'reviewed',
  NOW() - INTERVAL '4 days'
),

-- 3. Reviewed
(
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000003',
  'SkillBridge — Peer Learning Network',
  'A platform connecting students to teach and learn micro-skills from each other using a credit exchange system.',
  'SkillBridge enables peer-to-peer skill exchanges through a credit economy. Students earn credits by teaching 20-minute sessions and spend them to learn. An ML recommender matches learners with the best available teacher based on ratings and topic embeddings. Video sessions are recorded and stored for async replay.',
  'Education',
  ARRAY['React', 'Node.js', 'MongoDB', 'Socket.io', 'TailwindCSS', 'WebRTC'],
  'https://github.com/learnit/skillbridge',
  'https://skillbridge.vercel.app',
  'https://skillbridge.notion.site',
  'reviewed',
  NOW() - INTERVAL '3 days'
),

-- 4. Under review
(
  'b1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000004',
  'CrisisMap — Disaster Response Coordinator',
  'Real-time map for coordinating disaster relief volunteers, resource depots, and affected zones.',
  'CrisisMap provides emergency coordinators with a live Leaflet.js map showing volunteer positions, supply depot statuses, and affected zone polygons — all updated via Supabase Realtime WebSockets. The PWA works offline-first so it stays functional in connectivity-degraded disaster zones. Roles: coordinator, volunteer, viewer.',
  'Social Impact',
  ARRAY['Next.js', 'Leaflet.js', 'Supabase Realtime', 'TypeScript', 'PWA', 'Deno'],
  'https://github.com/learnit/crisismap',
  'https://crisismap.vercel.app',
  NULL,
  'under_review',
  NOW() - INTERVAL '2 days'
),

-- 5. Submitted (not yet assigned)
(
  'b1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000005',
  'FoodLoop — Community Food Waste Reducer',
  'Connects restaurants and grocers with surplus food to nearby shelters and families in need.',
  'FoodLoop uses geolocation and a push-notification system to alert registered shelters when nearby food donors list surplus stock. Drivers volunteer to pick up and deliver. The impact dashboard tracks meals rescued and CO₂ saved. Built as a cross-platform mobile PWA.',
  'Sustainability',
  ARRAY['React Native', 'Expo', 'Supabase', 'Stripe', 'Maps API'],
  'https://github.com/learnit/foodloop',
  NULL,
  NULL,
  'submitted',
  NOW() - INTERVAL '1 day'
)

ON CONFLICT DO NOTHING;

-- ── Sample Judge Reviews (for the reviewed submissions) ───────
-- Replace judge UUIDs with real judge user IDs after seeding judges above.

-- INSERT INTO public.judge_reviews (
--   submission_id, judge_id,
--   score_innovation, score_technical, score_presentation, score_impact,
--   feedback, is_complete
-- ) VALUES
-- (
--   'b1000000-0000-0000-0000-000000000001',
--   '<judge-uuid-1>',
--   9, 8, 8, 9,
--   'Exceptional use of real-time data. The gamification layer is well thought-out. Demo could show the ML predictions more prominently.',
--   true
-- ),
-- (
--   'b1000000-0000-0000-0000-000000000002',
--   '<judge-uuid-1>',
--   8, 7, 9, 10,
--   'Outstanding impact potential. Technical implementation is solid. Could improve offline resilience.',
--   true
-- );
