# Changelog — June 10, 2026

## Fixed

### Database Schema
- **Created missing `judge_reviews` table** — the table did not exist in the database (only `scores` table was present with a different structure). Created with columns: `id`, `submission_id`, `judge_id`, `score_innovation`, `score_technical`, `score_presentation`, `score_impact`, `feedback`, `is_complete`, `created_at`, `updated_at`, plus RLS policies and `UNIQUE(submission_id, judge_id)` constraint.

### Column Mismatches
- **`submissions` table missing `submitted_at`** — the DB schema had no `submitted_at` or `updated_at` columns. Replaced all `submitted_at` references with `created_at` across:
  - `app/api/admin/report/export/route.ts`
  - `app/api/admin/results/route.ts`
  - `app/submission-result/[id]/page.tsx`

### PostgREST Schema Cache Issues
- **Nested FK joins failing** — PostgREST could not find FK relationships for `profiles:judge_id` (cross-schema `auth.users`), `judge_reviews`, and some intra-schema FKs. Refactored all nested queries to use **separate flat queries** with in-memory joining:
  - `GET /api/admin/assignments` — now fetches assignments, submissions, and profiles separately
  - `GET /api/admin/results` — now fetches submissions, teams, reviews, and judges separately
  - `GET /api/admin/report/export` — now fetches submissions and teams separately (simplified CSV)
  - `GET /api/judging/assignments` — now fetches assignments and submissions separately

### RLS Policies
- **Ran SQL to add missing policies**:
  - `submissions_admin_update` — allows admins to update any submission
  - `submissions_judge_status_update` — allows judges to update status of assigned submissions

### Logging
- Fixed `String(err)` → proper error serialization in all API route catch blocks (22 routes).

### Error Handling
- Fixed `app/api/admin/report/export/route.ts` — added null-safety (`submissions ?? []`) to prevent `.map()` crash when no submissions exist.

## Enhanced

### Judge Dashboard
- **Reviewed status tracking** — `GET /api/judging/assignments` now returns a `reviewed` boolean per assignment based on whether the judge has a review in `judge_reviews`.
- **Checkmark updates** — `JudgeDashboard.tsx` now:
  - Reads `reviewed` from API response to mark submissions as judged on page load
  - Locally updates the `judged` state after saving a score (no refresh needed)
- **Admin viewing** — Admin can see all submissions in the judging panel with correct reviewed/not-reviewed status (checks all reviews, not just admin's own).

### Export CSV
- Simplified to basic columns (Rank, Team Name, Project Title, Category, Summary, Technologies, GitHub URL, Status, Submitted At).

### Lifecycle Management
- Fixed "Results" phase button routing from broken `/submission-result` → `/admin/results`.

## Infrastructure
- Pushed code to new repo: `https://github.com/LearnIT-MUJ/Code-E-Manipal_Portal`
- Branches: `main` and `production` (identical content)

---

# Changelog — June 11, 2026

## Fixed

### Build & TypeScript Fixes
- **`app/login/page.tsx`** — Removed `styled-jsx` syntax (unsupported by Turbopack), replaced template literal classNames with `clsx()`, inlined `roleCard` arrow function, removed extraneous closing brace.
- **`types/react-slick.d.ts`** — Added module declaration for `react-slick` to resolve implicit `any` type error in `HeaderGallery.tsx`.
- **`components/SubmissionCard.tsx`** — Removed duplicate `transition` property in inline style object.
- **`data/mockData.ts`** — Fixed `Criteria` type mismatch: `completeness` field not defined in `Criteria` interface.

## Current State

### Login Page (`app/login/page.tsx`)
A warm-toned, vintage-inspired login screen:
- **Background**: Full-screen cover image (`login.webp`) with a dark overlay for readability
- **Layout**: Card shifts right on desktop (`lg:justify-end lg:px-20`), centered on mobile
- **Card**: Cream/off-white background (`rgba(252,246,239,0.97)`) with subtle border and shadow, 480px max-width, with a mandala SVG watermark in the top-right corner
- **Typography**: Headings in `Cormorant Garamond` serif (40px, deep maroon `#4B1F24`), body in `Inter` sans-serif
- **Decorations**: Ornamental SVG dividers (small and wide variants) with gold/maroon diamond-and-line motif
- **Email field**: `Mail` icon prefix, warm cream input background, maroon border
- **Password field**: `Lock` icon prefix, `Eye`/`EyeOff` toggle for visibility
- **Role selector**: Three pill buttons (Participant, Judge, Admin) using `Users`, `Scale`, `ShieldCheck` icons — active state uses maroon gradient (`#8B1F44 → #6D1632`) with gold icon tint
- **Sign In**: Full-width maroon gradient button with shadow and `ArrowRight` icon
- **Remember me**: Checkbox with `accentColor: #8B1F44`
- **Forgot password**: Link styled in maroon
- **Demo mode**: Subtle "Demo mode enabled" text
- **Gallery link**: `Images` icon + "View Public Gallery" link in maroon
- **Error handling**: Shake animation on error via `animate-shake` class (defined in `styles/index.css`)
- **Routing**: Post-login redirects to `/admin`, `/judging`, or `/team` based on role

### Admin Dashboard (`app/admin/`)
A full layout with a polished earthy aesthetic (cream/maroon/gold palette):

**Layout** (`app/admin/layout.tsx`):
- **Header** (64px, `#FBF5F0` background, bottom border):
  - Logo: Leaf-heart SVG icon + "Code-e-Manipal" in serif + "2.0" gold badge
  - Top navigation: Team / Submit / Judging / Admin / Gallery — active indicator uses gold diamond divider
  - Right side: Role badge (Shield icon + "Admin" dropdown), notification bell with red badge (count `3`), circular avatar with letter "A"
- **Sidebar** (165px, `#FDF4EE` background):
  - Sidebar logo SVG (flame/heart motif) + "Admin Panel" label + gold diamond divider
  - Navigation: Dashboard, Teams, Judging, Results, Report, Analytics, Settings — active state uses maroon gradient with white text and gold icon
  - Decorative background image strip at bottom
  - Logout button (maroon, full width) redirects to `/login`
- **Main content area**: Scrollable, padded

**Dashboard Page** (`app/admin/page.tsx`):
- **Hero banner** (92px): Maroon gradient icon circle with `Flame` icon, "LearnIT Admin Dashboard" heading in serif, "Hackathon Control Center" subtitle, gold bar divider — background image on right side masked with gradient
- **Stat cards** (4-column grid): Total Teams (1), Total Submissions (3), Submitted (3), Reviewed (3) — each with a circular maroon icon container, serif numeral, and subtle background image watermark
- **Judge Assignment panel**: Title with `UserCircle` icon, dropdown selectors for submission/judge with `ChevronDown`, "Assign" button (maroon gradient, disabled state in muted brown), "Auto-Assign (Shuffle)" button, scrollable assignment list with avatar circles and delete (`Trash2`) buttons
- **Results Management panel**: Title with `Trophy` icon (gold), "View Full Report" button, gold bar divider, summary card with Projects reviewed / Pending reports / Export ready stats, decorative background image strip
