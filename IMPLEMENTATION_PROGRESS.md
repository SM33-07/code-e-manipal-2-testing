# Visual Recovery Progress

## Stage A–B — repository cleanup and shared visual foundation

- Preserved the `phase7-visual-recovery` branch and the architecture at `8850761`; no API, auth, RBAC, data, or security code changed.
- Replaced legacy translucent/glass styling with opaque, theme-aware surfaces across shared navigation, dialogs, status badges, dashboard widgets, and operational cards.
- Established the Pink City Atelier / Sapphire Haveli token palette in the global theme.
- Kept the existing participant Navbar, added its missing `/dashboard` entry, and removed the duplicate dashboard-only navigation layer.
- Kept the existing admin sidebar, made it theme-aware, and restored access to the existing `/admin/users` route.
- Rewired route atmosphere to the supplied `public/images/heritage/light` and `public/images/heritage/dark` assets without deleting legacy image assets.
- Added reduced-motion handling and strengthened shared button/card/badge focus and surface treatments.

Validation performed:

- `rg` scan confirms no `backdrop-filter`, `backdropFilter`, or `backdrop-blur` remains in `app`, `components`, or `styles`.
- `npx tsc --noEmit`
- `npm run build`

Remaining work:

- Page-level visual refinement for participant forms, judge workflows, and dense admin operational views.
- Browser-based responsive and visual route checks.

Commit: `04e39f3` — `feat: recover visual foundation`

## Stage C — participant information architecture and account flow

- Added protected participant information routes: `/timeline`, `/problem-statements`, and `/guidelines`.
- Added Dashboard, Timeline, and Challenges to the existing participant Navbar; replaced dead dashboard resource anchors with real routes.
- Added `/judge` as a compatibility route to the existing secure judge workspace.
- Removed the client-side role selector and public registration call-to-action from sign-in; sign-in now lands participants on `/dashboard`.
- Routed browser authentication through the existing identifier-aware `/api/auth/login` endpoint and hydrate client role from the authoritative `/api/auth/me` profile response instead of Supabase metadata.
- Disabled the legacy public self-registration UI and API endpoint because this event uses provisioned accounts.
- Extended proxy coverage for the dashboard and participant information routes.

Validation performed:

- `npx tsc --noEmit`
- `npm run build`
- Global scan confirms no blur/backdrop-filter utility or CSS remains.

Remaining work:

- Page-level visual refinement for participant forms, judge workflows, and dense admin operational views.
- Browser-based responsive and visual route checks with provisioned test accounts.

Commit: `c0d2228` — `feat: finalize participant account flow`

## Stage D — final surface, navigation, and submission recovery

- Kept the existing curved participant Navbar while removing its fixed desktop minimum width, constraining its content, and moving overflow navigation into an accessible More menu.
- Set explicit opaque Navbar, popover, input, card, and table surfaces through the shared system; primary brand emphasis is now Jaipur Pink with Brass as the secondary accent and Sapphire reserved for structure/focus.
- Removed participant navigation from admin and judge workspaces, leaving their existing purpose-built admin sidebar and judge workspace intact.
- Added canonical `/submit` rendering of the existing secure submission workflow, rather than a redirect, and made its hero a responsive opaque surface with no legacy oversized spacing.
- Added a route-level solid skeleton fallback and made gallery use only supplied heritage assets for its architectural atmosphere.
- Kept blur regression checks clean and verified compilation/build after the changes.

Validation performed:

- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
- global blur/backdrop scan

Browser inspection note: the available browser automation runtime failed to initialize before it could capture the local app; no browser state was changed.

Remaining work:

- Deep, page-specific migration of legacy inline styles remains on older large operational views; the shared opaque system now covers their common components.

Commit: `4e70023` — `feat: complete final frontend visual recovery`

## Stage E — legacy surface-system consolidation

- Added explicit semantic surface tiers to the theme and changed legacy arbitrary alpha-background compatibility mappings to resolve to opaque theme surfaces.
- Updated the judge workspace’s primary header, action control, tabs, and summary panel to use current semantic tokens and solid containers.
- Routed remaining dashboard submission calls to canonical `/submit`.
- Re-ran static regressions; no backdrop blur/filter remains and the production build passes.

Validation performed:

- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`

Browser inspection remains unavailable because the local automation runtime could not initialize; no browser validation is claimed.

Commit: `7f3c750` — `feat: finalize frontend experience and visual system`

## Stage F — Master Frontend Recovery + Final UI Implementation (from Forensic Audit)

Based directly on `FRONTEND_UI_FORENSIC_AUDIT.md`, executed root-cause recovery across the entire frontend:

1. **Tailwind v4 Theme Pipeline & Semantic Token Compilation (P0-1):**
   - Repaired `@theme inline` pipeline in `styles/theme.css` so semantic tokens (`--card`, `--background`, `--foreground`, `--primary`, `--secondary`, `--border`) compile into actual solid browser styles.
   - Cleaned `styles/tailwind.css` entrypoint and stripped duplicate CSS variable declarations.
   - Confirmed `bg-card` computes to opaque `#FFFDF9` (Light: Pink City Atelier) and `#0C1728` (Dark: Sapphire Haveli) with 100% opacity.

2. **Opaque Surfaces & Zero Content Transparency (P0-2):**
   - Eliminated all transparent content surfaces; cards, panels, forms, modals, tables, and submission cards now render solid background fills.
   - Eliminated glassmorphism/backdrop-blur hacks across cards and navigation.
   - Heritage photography serves purely as restrained atmospheric framing, not background bleeding through text.

3. **Admin Shell & Navigation Recovery (P0-3):**
   - Created dedicated `components/admin/AdminHeader.tsx` displaying the event state banner, active user info, role badge, theme switcher, and direct sign-out.
   - Rebuilt `app/admin/layout.tsx` with a dual navigation system:
     - Desktop: Fixed full-height sidebar with high-contrast active route badges, logout button, and clear separation from participant workflows.
     - Mobile: Full drawer overlay with hamburger trigger, zero horizontal scrollbar overflow, and accessible logout.
   - Verified that admin views are isolated and never inherit participant navigation.

4. **Participant Navbar & Mobile Menu Recovery (P0-4):**
   - Refactored `components/ui/resizable-navbar.tsx` and `components/Navbar.tsx`:
     - Opaque background shield (`bg-background/95 border-b border-border shadow-sm`) with zero collision on scroll.
     - Prioritized desktop navigation: 6 primary links (`/dashboard`, `/timeline`, `/problem-statements`, `/guidelines`, `/team`, `/submit`, `/gallery`) rendered within available width, with overflow handled gracefully.
     - Fully opaque mobile menu drawer with backdrop dismissal, smooth spring transitions, and accessible touch targets.

5. **Legacy Brown/Gold System Removal at Source (P0-5):**
   - Eradicated legacy brown/gold hex codes (`#1E1208`, `#0F0A05`, `#C9A227`, `#D4732A`, `#FCF6EF`, `#8B1F44`, `#A08070`, `#5E142B`) across all application components and views.
   - Replaced old serif font declarations (`font-serif`, `Cormorant Garamond`) with modern technical sans-serif typography.
   - Updated confetti palette to Jaipur Pink, Antique Brass, and Terracotta.
   - Deprecated unused legacy components `components/AdminSidebar.tsx` and `components/HeaderGallery.tsx`.

6. **Jaipur Brand Palette Realignment (P0-6):**
   - Primary: Jaipur Pink (`#C97878` / `#B95745`)
   - Secondary: Antique Brass (`#D2AC68` / `#B08A45`)
   - Support: Terracotta (`#A64B3E`)
   - Structural: Sapphire / Indigo (`#091221` / `#0C1728`)
   - Eliminated blue-first corporate styling and brown-first heritage styling.

7. **Page-by-Page Recovery:**
   - **`/submit` & `SubmissionForm`:** Completely rewrote `components/SubmissionForm.tsx` and `app/SubmissionForm/page.tsx` (centered container, removed nested `<main>`, solid card backgrounds, primary pink submit button, clean tech stack & track badges).
   - **`/team` & `TeamManagement`:** Rewrote `components/TeamManagement.tsx` (solid member cards, phase bar, invite codes, admin team view).
   - **`/judging` & `JudgingInterface`:** Rewrote `components/JudgingInterface.tsx`, `components/SubmissionList.tsx`, `components/JudgeDashboard.tsx`, `components/Leaderboard.tsx`, `components/SuccessSummaryCard.tsx`, and `components/JudgeAssignment.tsx` (solid rubric sliders, scoring criteria, action buttons).
   - **`/admin` subpages:** Rewrote `app/admin/page.tsx`, `app/admin/registrations/page.tsx`, `app/admin/event-control/page.tsx`, `app/admin/report/page.tsx`, `app/admin/results/page.tsx`, `app/admin/analytics/page.tsx`, and `app/admin/users/page.tsx` (solid cards, clean tables, CSV/Excel export, real-time controls).
   - **`/gallery`:** Rewrote `components/FeaturedProjects.tsx`, `components/VideoCarousel.tsx`, `components/ProjectGrid.tsx`, and `app/gallery/page.tsx` (eliminated 3D laptop fold gimmick and "Shahi Darbar" fantasy; replaced with modern 3-tier podium showcase and clean project grid/list view).
   - **`/login`:** Rebuilt `app/login/page.tsx` into a technical console login card with high-contrast inputs and instant theme switcher.
   - **`/project/[id]`:** Removed leaked `Header.tsx` ("LearnIT Admin Dashboard") from public project view.

8. **Loading UX & Navigation Delay Removal:**
   - Replaced artificial 3-second `LoaderAnimation` in `app/RootClient.tsx` with instantaneous route transitions and real async loading states.

Validation performed:
- `npx tsc --noEmit` — 0 errors (clean exit code 0).
- `npm run build` — 52/52 routes compiled successfully in 3.6s with Turbopack (clean exit code 0).
- `git diff --check` — 0 whitespace or formatting issues.
- Global grep audits: `#1E1208` (0 matches), `#0F0A05` (0 matches), `#C9A227` (0 matches), `#D4732A` (0 matches), `#FCF6EF` (0 matches), `#8B1F44` (0 matches), `#A08070` (0 matches).
- Live browser validation across desktop & mobile (390px) viewports in both Light & Dark modes; captured screenshots confirmed solid opaque cards, crisp buttons, and zero transparent content surfaces.

Commit: `e5cf64d` — `fix: complete frontend recovery from forensic audit`

## Stage G — Final Visual & UX Correction Pass (Rendered UI Alignment & Case Handling)

Executed the final visual and navigation correction pass based on live browser inspection and forensic audit requirements:

1. **Light Theme Photographic Veil Rebalance:**
   - Softened `.route-background-veil` in `styles/index.css` from an 88%–95% opaque wash down to `linear-gradient(180deg, rgba(247, 244, 239, 0.40) 0%, rgba(247, 244, 239, 0.62) 45%, rgba(247, 244, 239, 0.82) 100%)`.
   - Architectural details across Albert Hall, Hawa Mahal, Jantar Mantar, and Jal Mahal are visibly recognizable and authentic, while content panels (`bg-card`, `#FFFDF9`) remain 100% opaque for clear readability.

2. **Light Theme Color Hierarchy & Contrast:**
   - Primary: Jaipur Pink (`#B95745` light / `#C97878` dark)
   - Secondary: Antique Brass (`#B08A45` light / `#D2AC68` dark)
   - Support: Terracotta (`#A64B3E`)
   - Foundation: Warm architectural neutral (`#FFFDF9` card, `#F7F4EF` canvas)
   - Deepened light mode text foreground to `#141210`, muted text to `#5C5349`, and border framing to `#D0BEA7` for crisp, accessible contrast.

3. **Identifier Input Case Handling & Email Authentication:**
   - Resolved uppercase input forcing in `app/login/page.tsx`: removed `.toUpperCase()` on `onChange`, enabled lowercase typing for IDs (`team-001`) and emails (`admin@learnit-muj.com`).
   - Extended `app/api/auth/login/route.ts` to natively support standard email-based authentication alongside provisioned identifiers (`TEAM-xxx`, `JUDGE-xx`, `ADMIN-xx`).
   - Password input is preserved intact with zero transformation.

4. **Universal Brand Identity (`components/BrandLogo.tsx`):**
   - Created a reusable, high-contrast brand mark component with dark sapphire/charcoal badge framing the white diamond emblem, paired with `Code-e-Manipal 2.0` typography and contextual role subtitles.
   - Unified across Participant Navbar, Admin Header, Judge Header, and Login page.

5. **Universal Navigation Architecture:**
   - **Participant:** Floating curved navbar with BrandLogo, primary workflow pills, hackathon timer, compact ThemeToggle, and notifications.
   - **Judge:** Built persistent `components/judge/JudgeHeader.tsx` with BrandLogo, Evaluation badge, judge name/pill, compact ThemeToggle, and logout. Eliminated workspace isolation in both assignment list and scoring views.
   - **Admin:** Dedicated AdminHeader with BrandLogo, Admin badge, live ops indicator, theme toggle, desktop sidebar, and slide-out mobile drawer.

6. **Compact Technical Console ThemeToggle (`components/ThemeToggle.tsx`):**
   - Replaced floating legacy pill with a compact `h-8` console toggle using semantic tokens (`border-border bg-card/90 text-foreground`) with spring active indicator and full keyboard accessibility.

7. **Validation & Verification:**
   - `npx tsc --noEmit` — 0 errors (clean exit code 0).
   - `npm run build` — 52/52 routes successfully compiled with Turbopack.
   - `git diff --check` — 0 whitespace or formatting issues.
   - Real browser visual QA verified with captured screenshots:
     * `/login` (Light mode): `login_light_mode_1791131200364.png`
     * `/admin` (Light mode): `admin_dashboard_light_1791131413411.png`
     * `/admin` (Dark mode): `admin_dashboard_dark_1791131445693.png`
     * `/dashboard` (Light mode): `dashboard_light_mode_1791131622544.png`
     * `/judging` (Light mode): `judging_light_mode_1791131551076.png`
     * `/gallery` (Light mode): `gallery_light_mode_1791131640651.png`
     * Mobile 390px QA: `admin_mobile_1791131806233.png` & `admin_nav_drawer_1791131776271.png`

## Stage H — Loader Animation Recovery & Operations Center Global Navbar Integration

1. **High-Tech Branded Loader Animation (`components/LoaderAnimation.tsx`):**
   - Restored the full-featured, cinematic Jaipur/Manipal HUD loader animation.
   - Features: MUJ Campus wireframe background (`/MUJ-BUILD.webp`), pulsing LearnIT diamond brand logo with circuit lines, floating amber particles, HUD corner brackets, numerical progress ticker (0% → 100%), and glowing gold progress indicator.
   - Ergonomics: Fast, responsive ~1.2s completion curve; includes "SKIP INTRO (ESC)" button and keyboard Escape listener for instant dismissal.
   - Mounted client-side in `app/RootClient.tsx` during initial portal load and refresh with a safety timeout fallback to guarantee zero artificial blocking.

2. **Global Platform Navbar in Admin Operations Center (`/admin`):**
   - Integrated universal platform `Navbar` at the top of the Operations Center (`/admin` and all operational submodules).
   - Top Navbar dynamically highlights **Operations Center** when in `/admin/*`, exposes the global hackathon countdown timer, results pill, notification center, theme toggle, and authenticated admin profile avatar with logout.
   - Removed redundant local `AdminHeader` stacking; `app/admin/layout.tsx` cleanly renders beneath the global `Navbar` with `pt-20`.

3. **Desktop & Mobile Operations Workspace Navigation:**
   - **Desktop:** Sticky `w-64` Operations Navigation sidebar on the left (`Operations Center`, `Event Control`, `Teams & Roster`, `Users & Access`, `Results & Awards`, `Report & Export`, `Live Analytics`) with active state tracking.
   - **Mobile:** Sticky sub-bar below the top Navbar with dynamic section label and dedicated "Operations Menu" button that toggles the slide-out operational drawer.

4. **Validation & Verification:**
   - `npx tsc --noEmit` — 0 errors.
   - `npm run build` — 59/59 routes compiled with Turbopack.
   - Browser subagent visual verification completed:
     * Desktop Operations Center with top Navbar: `admin_desktop_navbar_1791137044040.png`
     * Mobile Operations Center with sub-bar and drawer: `admin_mobile_navbar_1791137111743.png`
     * Mobile Platform Navbar drawer: `admin_mobile_main_navbar_1791137142505.png`
     * Video session: `verify_loader_navbar_1791136843283.webp`

## Stage I — Final Product Recovery + Role Workspaces + Navigation + Timeline + Judging + Visual System

1. **Authoritative Visual Identity & Poster Alignment:**
   - **Light Theme:** Grounded in the official Code-e-Manipal 2.0 poster palette — parchment ivory, Jaipur pink (`#B95745`), terracotta (`#A64B3E`), and antique brass (`#B08A45`) with architectural linework.
   - **Dark Theme ("Same Brand at Night"):** Completely purged generic navy/blue SaaS styling. Replaced with deep wine and plum (`#120A12`, `#1D111E`, `--border: #3E243D`, `--primary: #D46868`, `--secondary: #D4AB65`). Blue is strictly supporting technical accents.
   - **Background Layer Architecture:** Repaired veil opacity (`0.35`-`0.80` light, `0.65`-`0.94` dark) so Jaipur heritage photography remains intentionally visible around and behind cards without sacrificing contrast or readability. Content cards remain 100% solid (`#FFFDF9` light, `#1D111E` dark) — zero blurry/transparent text surfaces.
   - **Authentic Brand Logo (`components/BrandLogo.tsx`):** Displays the official palace dome + Hindi linework artwork (`public/logo.png`) inside an emblem container with "2.0" tag and role-specific subtitle.

2. **Universal Brand Header Architecture (`components/Navbar.tsx` & `app/RootClient.tsx`):**
   - One universal platform header permanently present across ALL routes (public, participant, judge `/judge`, and admin `/admin`).
   - Role-adaptive link distribution: Participant (`Dashboard`, `Timeline`, `Challenges`, `Team`, `Submit`, `Gallery`, `FAQ`), Judge (`Dashboard`, `Judge Workspace`, `Timeline`, `Guidelines`), Admin (`Dashboard`, `Operations Center`, `Event Control`, `Live Analytics`).
   - Theme control, countdown timer, results pill, notification bell, and authenticated profile avatar with logout accessible everywhere.

3. **Role-Aware Landing Page (`/dashboard`):**
   - `/dashboard` is the authenticated home for all three roles — Admin lands on `/dashboard` overview (NOT redirected straight to `/admin`).
   - **Participant:** "My Hackathon Workspace" — team identity, event phase timeline, countdown, submission status widget, broadcast announcements, and quick resource links.
   - **Judge:** "My Evaluation Workspace" — assigned teams summary, pending evaluations, next team CTA linking to evaluation, and judging instructions.
   - **Admin:** "Event Operations Overview" — event phase banner, team & submission metrics, judging status, system alerts, and direct shortcuts to deep operational modules.

4. **Canonical Judge Evaluation Workflow:**
   - Dedicated evaluation route: `/judge/evaluate/[teamId]` with phone-first UX (optimized for 360px-430px viewports).
   - Mobile-friendly 1-10 tap buttons (no tiny sliders or fragile dropdowns).
   - Authoritative rubric criteria and weights preserved: Innovation (30%), Technical (30%), Presentation (20%), Impact (20%) on a 100-point scale.
   - On evaluation submission, redirects to `/judge` (dedicated judge workspace & assignment queue) to prevent stranding.

5. **Participant Team Leader Workspace (`/team`):**
   - Replaced member-only presentation with a true Command Center: team code with one-click copy, event phase badge, capacity meter, submission status card with direct CTA, member roster, and timeline milestones.

6. **Administrative Console Modules:**
   - **Teams & Roster (`/admin/teams`):** Dedicated administrative console with search, track filters, submission status, per-team and global submission freeze switches (`PATCH /api/admin/teams`), and deadline extension modal.
   - **Submissions Oversight (`/admin/submissions`):** Real-time project submissions list, repository and demo URL inspection, and audited "Reopen Submission" action (`POST /api/admin/submissions/[id]/reopen`) enforcing a mandatory justification (min 10 characters).
   - **Judging Operations (`/admin/judging`):** Judge assignment distribution table, auto-assign trigger, and audited score correction route (`POST /api/admin/reviews/[id]/reopen`).
   - **Reconciled Navigation (`app/admin/layout.tsx`):** Unified sidebar & mobile drawer across Operations Center, Event Control, Teams & Roster, Submissions, Judging, Users & Access, Results & Awards, Report & Export, and Live Analytics.

7. **Problem Statements ("Coming Soon" Experience — `/problem-statements`):**
   - High-end pre-drop briefing with live release schedule (Day 1, 10:30 AM), 4 track previews (AI & Intelligent Systems, Web3, FinTech & Healthcare, Open Innovation), and participant preparation checklist.

8. **Detailed Process Timeline (`/timeline`):**
   - Real 36-hour schedule for 15 & 16 October 2026 at Manipal University Jaipur.
   - Grouped into Online Phase, Day 1 (Hacking starts), and Day 2 (Code freeze, jury demos, and valedictory ceremony).
   - Responsive left-rail layout with milestone nodes, active flame badges, location tags, and phase filter tabs.

9. **Dedicated Participant FAQ (`/faq`):**
   - Searchable, categorized accessible accordion covering Account & Access, Team Management, Problem Statements, Submissions, Judging, and Schedule.

10. **Validation & Quality Gates:**
    - `npx tsc --noEmit` — 0 errors.
    - `npm run build` — 60/60 routes compiled with Turbopack.
    - Verified responsive layouts across mobile (390px) and desktop viewports.
    - Verified light and dark theme contrast, brand colors, and solid surfaces.

## Stage J — Final Timeline Rebuild + Global Loader Recovery + Background Asset Strategy

1. **Aceternity-Inspired Timeline Architecture (`components/ui/timeline.tsx` & `app/timeline/page.tsx`):**
   - Implemented responsive `Timeline` component with continuous vertical rail in Antique Brass (`#B08A45`), active Jaipur Pink milestone nodes (`#B95745` / `#D46868`), and sticky phase headers.
   - Structured the real 36-hour schedule (15 & 16 October 2026, Manipal University Jaipur) across Online Phase, Day 1 (Hacking starts), and Day 2 (Code freeze & jury evaluation).
   - High information density: clear time badges, event titles, concise descriptions, venue locations, and dynamic status tags (`COMPLETED`, `ACTIVE NOW`, `UPCOMING`, `HARD DEADLINE`).
   - Phone-first layout (360px–430px) with single-column left-rail, zero horizontal overflow, and interactive phase filter buttons (`All Phases`, `Online Phase`, `Day 1`, `Day 2`).
   - Zero neon/purple/green styling; strictly adheres to the official poster color system (Parchment Ivory, Jaipur Pink, Terracotta, Antique Brass in Light; Wine/Plum in Dark).

2. **Global Loader Lifecycle Recovery (`components/LoaderAnimation.tsx` & `app/RootClient.tsx`):**
   - Resolved hydration and dynamic loading delay by importing `LoaderAnimation` directly.
   - Snappy, responsive progress ticker (reaches 100% in ~800ms) with Escape key listener and "SKIP INTRO (ESC)" button.
   - Boot session persistence (`sessionStorage.getItem("cem_portal_booted")`) to ensure the initial intro runs on initial page load/hard refresh without repeatedly interrupting client-side route changes.
   - Immediate bypass when `prefers-reduced-motion: reduce` is active and hard 1.5s fallback to prevent any potential blocking.

3. **Background Asset & Route Atmosphere Strategy (`styles/index.css` & `app/RootClient.tsx`):**
   - Added `.route-timeline` with restrained Jaipur atmosphere backdrop (`/images/heritage/light/jaipur-atmosphere.webp` and `/images/heritage/dark/architectural-atmosphere.webp`).
   - Preserved solid content cards (`#FFFDF9` light, `#1D111E` dark) over atmospheric background veil for high legibility and zero transparent blur artifacts.

4. **Validation & Verification:**
   - `npx tsc --noEmit` — 0 errors.
   - `npm run build` — 60/60 routes compiled successfully with Turbopack.
   - Verified responsive single-column layout on mobile viewports (390px) and clean vertical flow on desktop.

## Stage L — Phase 1 Critical Functional Recovery & Access-Control Parity

1. **CSRF Validation & Admin 403 Recovery (`lib/auth/csrf.ts` & `app/api/auth/login/route.ts`):**
   - Fixed the origin verification in `lib/auth/csrf.ts` to support localhost/loopback development ports (`:3000`, `:3001`, `:3002`), regex port matching, and `isSameOrigin` header verification.
   - Restored working login mutations for admin and participant accounts, completely resolving the 403 Forbidden failure.
   - Cleaned identifier handling in `app/login/page.tsx` so user identifiers preserve casing for ADR-009 canonical normalization.

2. **Next.js 16 Edge Proxy / Route Protection Parity (`proxy.ts`):**
   - Aligned with Next.js 16 conventions where `proxy.ts` serves as the edge proxy with default export and static `config` matcher.
   - Removed conflicting `middleware.ts` that caused duplicate detection crashes.
   - Confirmed client-side and edge-level route protection for protected routes (`/dashboard`, `/team`, `/submit`, `/judge`, `/admin`).

3. **Desktop & Mobile Navbar Visibility Recovery (`components/ui/resizable-navbar.tsx` & `components/Navbar.tsx`):**
   - Restored missing `lg:flex` display style on desktop `NavBody` (which had been accidentally dropped, causing the Navbar to be hidden on desktop viewports).
   - Solidified non-scrolled navbar styling with card background and border to ensure crisp legibility over Jaipur heritage backdrops.
   - Maintained full role-aware links and actions:
     * Unauthenticated: `Home`, `Problem Statements`, `Timeline`, `Past Editions`, `FAQ`, `Register`, plus `Enter Console` CTA.
     * Participant: `Dashboard`, `Problem Statements`, `Submit`, `Timeline`, `Past Editions`, `FAQ`, timer, notifications, avatar menu with Logout.
     * Judge: `Workspace`, `Problem Statements`, `Timeline`, `Guidelines`, `Past Editions`, and profile avatar with Logout.
     * Admin: `Operations Center`, `Participant Dashboard`, `Problem Statements`, `Past Editions`, and profile avatar with Logout.

4. **Client-Side Defense-in-Depth (`app/admin/layout.tsx` & `app/dashboard/layout.tsx`):**
   - Added authentication and role check to `AdminLayout` redirecting non-admins directly to `/dashboard`.
   - Wrapped `DashboardLayout` in `<ProtectedRoute>` to eliminate any potential flash-to-login or unauthorized access during client SPA transitions.
   - Corrected `app/submit/page.tsx` API endpoints (`/api/event-config`) and response shape reading (`json.data` as results, `json.meta.published` as published flag).
   - Fixed duplicate key warning in `lib/heritage/routeConfig.ts`.

5. **Validation & Quality Gates:**
   - `npx tsc --noEmit` — 0 errors across entire workspace.
   - `npm run build` — 62/62 routes successfully compiled with Turbopack, including `ƒ Proxy (Middleware)`.
   - Verified live dev server rendering, theme toggling, and clean responsive layouts.

## Stage M — Phase 2 Global Portal Shell, Role Architecture & Route Consolidation

1. **Canonical role-aware portal shell (`app/RootClient.tsx`, `components/Navbar.tsx`, `lib/navigation/portal.ts`):**
   - Kept the existing single root-level Navbar instance and made its mode explicit: protected portal routes receive role-aware portal navigation; public routes receive public navigation without account, logout, timer, notification, or announcement controls.
   - Centralized Participant, Judge, and Admin link definitions in one navigation configuration. Admin navigation includes supervisory entry points for dashboard, participant-facing workspaces, judge workspace, and Operations.
   - Kept the existing admin sidebar as specialized secondary navigation beneath the global shell. Removed the unused Judge header import so the judge workspace does not introduce a competing header.

2. **Access and account behavior (`proxy.ts`, `app/login/page.tsx`, `app/account/page.tsx`):**
   - Added an authenticated Account route backed by the existing session/profile context and exposed it from desktop and mobile account menus for every role.
   - Added `/account` to edge protected routes.
   - Updated the edge proxy to resolve role from `profiles.role`, rather than auth metadata, before enforcing `/admin` and `/judge` route guards.
   - Admin login and `/login` redirects now lead to `/dashboard`; Admin retains access to `/admin` and is not forced into it.

3. **Navbar regressions (`components/ui/resizable-navbar.tsx`):**
   - Preserved the recovered `lg:flex` desktop visibility behavior and mobile fallback.
   - Removed both navbar `backdrop-blur-md` uses and changed the surfaces to opaque `bg-card`.

4. **Route inventory:**
   - Kept intentional compatibility redirects: `/team` → `/dashboard`, `/judging` → `/judge`, `/SubmissionForm` → `/submit`, `/schedule` → `/timeline`, and the existing admin compatibility redirects.
   - No working operational routes or backend APIs were deleted in this phase.

5. **Validation:**
   - `npx tsc --noEmit` — passed with 0 errors.
   - `npm run build` — passed; 63 routes generated and Proxy compiled.
   - `git diff --check` — passed.
   - `rg -n "backdrop-blur|backdrop-filter|backdropFilter" app components styles` — 0 matches.

## Stage N — Phase 3 Original Code-e-Manipal Loader Restoration

1. **Loader Identification & Forensic Verification (`c9afb79` / `da32ab0` / `04e39f3`):**
   - Located and identified the actual previous approved Code-e-Manipal loader implementation from Git history (PR #14 `c9afb79`).
   - Restored full visual fidelity in `components/LoaderAnimation.tsx` without inventing a generic replacement spinner or modernizing it.

2. **Visual & Design System Restoration (`components/LoaderAnimation.tsx`):**
   - Restored MUJ Campus Building golden wireframe backdrop (`/MUJ-BUILD.webp` mix-blend-screen opacity 0.35).
   - Restored pulsating glow aura, circular logo container with rotating dashed inner ring, and 24-point dot ring (`/logo.png`).
   - Restored animated circuit lines extending from logo with rotating line angles and glowing endpoint node dots.
   - Restored bird silhouettes animation and floating golden particle background.
   - Restored HUD frame corner SVGs (`#F6C453`) and top/right dotted borders.
   - Restored double-border loading card with inner bright core and leading glow orb progress bar (`#C9A227`, `#F6C453`, `#FFE066`).
   - Restored micro HUD element (`SYS.INIT.2026`) and card side circuit extensions.
   - Restored footer logo with rotating ring and official tagline (`Empowering Minds. Building the Future.`).
   - Restored gold title typography (`LearnIT`, `Manipal University Jaipur`, `CODE-ए-MANIPAL`) and diamond accent sequence.

3. **Lifecycle, Ergonomics & Accessibility Integration (`app/RootClient.tsx`, `components/LoaderAnimation.tsx`):**
   - Restored smooth progress ticker (~1.3s progression to 100%) with 200ms exit pause and 800ms fade/scale exit animation.
   - Restored `SKIP INTRO` interaction and added Escape key event listener for instant dismissal.
   - Added immediate bypass when `prefers-reduced-motion: reduce` is active.
   - Added hard 3.5s/4.0s failsafe timers in both `RootClient.tsx` and `LoaderAnimation.tsx` to ensure application usability is never blocked.
   - Preserved `sessionStorage.getItem("cem_portal_booted")` lifecycle so initial page load and explicit hard reloads display the intro while client-side route navigation remains seamless.

4. **Validation & Quality Gates:**
   - `npx tsc --noEmit` — 0 errors.
   - `npm run build` — 63/63 routes compiled successfully.
   - `git diff --check` — passed with 0 formatting/whitespace issues.

## Stage O — Phase 2.1 Targeted Admin Route Cleanup & Users Light-Theme Fix

1. **Redundant Admin Route Consolidation (`app/admin/audit`, `app/admin/announcements`, `app/admin/ceremony`):**
   - Removed redirect-only placeholder routes (`/admin/audit` -> `/admin/report`, `/admin/announcements` -> `/admin/event`, `/admin/ceremony` -> `/admin/results`) after confirming they contained no independent functionality.
   - Preserved all underlying canonical admin destinations (`/admin/event`, `/admin/results`, `/admin/report`) and active backend APIs (`/api/admin/announcements`, etc.).
   - Updated Admin sidebar in `app/admin/layout.tsx` and route config in `lib/heritage/routeConfig.ts`.
   - Verified zero broken or stale references across the entire codebase.

2. **/admin/users Light-Mode Contrast & Surface Recovery (`app/admin/users/page.tsx`):**
   - Replaced hardcoded dark/white classes (`text-white`, `text-gray-400`, `bg-black/40`, `border-white/10`) with semantic theme tokens (`text-foreground`, `text-muted-foreground`, `bg-card`, `bg-background`, `border-border`).
   - Restored high-contrast, fully opaque metric cards, search/filter bars, table headers, table rows, and modals in both Light and Dark modes.
   - Ensured zero backdrop-blur / glassmorphic overlays across all admin user views.

4. **Validation & Quality Gates:**
   - `npx tsc --noEmit` — 0 errors.
   - `npm run build` — 60/60 routes compiled successfully with Turbopack.
   - `git diff --check` — 0 errors.
   - `grep_search "backdrop-blur|backdrop-filter|backdropFilter"` — 0 matches in code (`app`, `components`, `styles`).

## Stage P — Phase 4 Jaipur Heritage Visual System, Background Strategy & Page-Level Surface Correction

1. **Jaipur Heritage × Modern Technical Console Visual Direction:**
   - Aligned light theme palette in `styles/theme.css` with authoritative tokens: Canvas `#F7F4EF` (warm ivory), Card `#FFFDF9`, Primary Jaipur Pink `#B95745`, Secondary Pink `#C97878`, Terracotta `#A64B3E`, Antique Brass `#B08A45`, Foreground `#141210`, Muted Foreground `#5C5349`, Border `#D0BEA7`. Eliminated brown/sepia washes over UI surfaces.
   - Verified dark theme palette in `styles/theme.css`: Deep Espresso (`#17110E`), Warm Charcoal (`#211713`), Muted Terracotta (`#A85346`), Jaipur Pink (`#C97878`), Antique Brass (`#B88A45`), Warm Ivory text (`#E9DDC8`), ensuring no purple-first shift.

2. **Authoritative Background Image Assignments & Layering:**
   - Updated `lib/heritage/routeConfig.ts` to assign exact Section 7 photography:
     - `/`: Light `01-hawa-mahal-landscape.webp`, Dark `08-pink-city-night.webp`
     - `/login`: Light `14-city-palace-ornate-hall.webp`, Dark `03-sheesh-mahal-corridor.webp`
     - `/dashboard`: Light `03-city-palace-courtyard.webp`, Dark `04-nahargarh-sunset-city.webp`
     - `/submit`: Light `14-city-palace-ornate-hall.webp`, Dark `03-sheesh-mahal-corridor.webp`
     - `/timeline`: Light `10-samrat-yantra.webp`, Dark `01-jantar-mantar-arch.webp`
     - `/problem-statements`: Light `09-jantar-mantar-gate.webp`, Dark `01-jantar-mantar-arch.webp`
     - `/gallery`: Light `02-patrika-gate.webp`, Dark `07-hawa-mahal-lit-night.webp`
     - `/results`: Light `04-city-palace-exterior.webp`, Dark `10-nahargarh-dome-city.webp`
     - `/judge`: Light `15-city-palace-hall-arches.webp`, Dark `01-jantar-mantar-arch.webp`
     - `/admin`: Light `04-city-palace-exterior.webp`, Dark `09-albert-hall-night.webp`
     - `/admin/event`: Light `11-zodiac-circle.webp`, Dark `01-jantar-mantar-arch.webp`
     - `/admin/results`: Light `15-city-palace-hall-arches.webp`, Dark `09-albert-hall-night.webp`
   - Dense admin operational routes (`/admin/users`, `/admin/teams`, `/admin/submissions`, `/admin/judging`, `/admin/report`, `/admin/analytics`) strictly configured with `mode: "none"` to preserve clean, uncompromised data-table legibility.
   - Refined `components/HeritageBackground.tsx` atmospheric veil overlay to use non-sepia warm ivory (`rgba(247, 244, 239)`) in light mode and deep espresso (`rgba(23, 17, 14)`) in dark mode.
   - Removed giant opaque page rectangle covering photography in `app/admin/layout.tsx` by setting the layout container to transparent, allowing the background photography to appear subtly in configured routes while dense pages show the solid body canvas.
   - Unified `/login` background architecture by routing through `HeritageBackground` in `app/RootClient.tsx` and removing redundant `.login-background` CSS class from `styles/index.css` and `app/login/page.tsx`.

3. **Page-Level Surface & Timeline Architecture:**
   - Ensured all cards, forms, tables, and dialogs remain 100% opaque (`bg-card`).
   - Validated Timeline styling: Antique Brass and Terracotta rail accents, Jaipur Pink nodes for current states, subdued sandstone/brass for completed states, and opaque ivory/espresso cards.
   - Verified `/admin/users` in Light Mode: crisp typography, high-contrast badges, readable search and filter dropdowns, and solid table surfaces.
   - Confirmed canonical Resizable Navbar architecture is preserved with opaque `bg-card` curved floating surface and 0 backdrop blur.
   - Confirmed `components/LoaderAnimation.tsx` remains completely untouched.

4. **Validation & Quality Gates:**
   - `npx tsc --noEmit` — 0 errors.
   - `npm run build` — 60/60 routes compiled successfully with Turbopack.
   - `git diff --check` — 0 formatting/whitespace errors.
   - Backdrop blur scan: `backdrop-blur|backdrop-filter|backdropFilter` — 0 matches in code (`app`, `components`, `styles`).
   - Runtime asset scan: 0 references to `light-old` or `dark-old`.

## Stage Q — Phase 5 Selective Component Integration + Final Frontend Polish

1. **Selective Components Integrated & Architecture:**
   - `components/ui/SpotlightCard.tsx`:
     - Built an accessible, high-performance card wrapper with mouse-tracked radial spotlight.
     - Styled with Jaipur Pink (`#B95745`) and Antique Brass (`#B08A45`) highlight gradients.
     - Fully opaque solid surface with zero glassmorphism and zero backdrop-filter.
     - Integrated `prefers-reduced-motion` detection (disables mouse tracking on reduced motion) and `focus-within` keyboard indicator.
     - Deployed selectively to:
       - Public Home (`app/page.tsx`): Metric highlights, 4 Challenge Track cards, Mission Infrastructure feature cards.
       - Public Problem Statements (`app/problem-statements/page.tsx`): Problem track cards and Pre-Hack Preparation Checklist cards.
       - Public Gallery (`app/gallery/page.tsx`): Hero Retrospective archive container.
       - Public FAQ (`app/faq/page.tsx`): FAQ header and Help Desk support banner.
       - Portal Dashboard (`components/dashboard/ParticipantDashboard.tsx`): Workspace overview banner and 4 Primary Status Cards (Current Phase, Portal State, Active Roster, Submission Freeze).
       - Portal Submit (`app/submit/page.tsx`): Stat overview cards.
       - Public Results (`app/results/page.tsx`): 2nd and 3rd place Runner-up podium cards.
   - `components/ui/BorderGlow.tsx`:
     - Built a restrained animated conic gradient border wrapper using Jaipur Pink, Terracotta, and Antique Brass.
     - Preserves 100% opaque underlying card surface.
     - Reduced-motion fallback replaces animation with a crisp static accent border.
     - Deployed strictly to major CTAs and live states:
       - Public Home (`app/page.tsx`): Final registration callout banner.
       - Portal Submission Form (`components/SubmissionForm.tsx`): Active submission action block.
       - Public Results (`app/results/page.tsx`): Grand Champion 1st place podium card.
   - `components/ui/SpecularButton.tsx`:
     - Implemented Level 4 CTA treatment using lightweight CSS directional highlight sheen and Antique Brass / Jaipur Pink bevel styling.
     - Zero WebGL / OGL dependencies and zero backdrop-filter.
     - Fully accessible keyboard focus-visible indicator and hover dynamics.
     - Deployed strictly to high-value actions:
       - Public Home (`app/page.tsx`): Hero "Enter Portal Console" CTA and final registration CTA.
       - Public Login (`app/login/page.tsx`): "Access Console" authentication button.
       - Portal Dashboard (`components/dashboard/ParticipantDashboard.tsx`): "Proceed to Final Submission" primary CTA.
   - `components/ui/ClickSpark.tsx`:
     - High-efficiency canvas particle burst (6–8 particles) on pointer down using Jaipur Pink and Antique Brass sparks.
     - Optimized performance: requestAnimationFrame runs strictly while sparks are alive and stops immediately when idle.
     - Zero execution and zero canvas listeners under `prefers-reduced-motion`.
     - Deployed strictly to public hero CTAs on `app/page.tsx`. Omitted entirely from dense portal and admin workflows.
   - `components/ui/OptionWheel.tsx`:
     - Interactive dial and accessible tablist for the 4 official challenge tracks (`ai-systems`, `fintech`, `resilient-infra`, `open-innovation`).
     - Fully keyboard-accessible (arrow keys navigate tracks, Enter/Space selects, ARIA tab/tablist/tabpanel semantics).
     - Does NOT hijack normal page scrolling; touch and pointer interaction is strictly scoped to the dial container.
     - Deployed to Public Home (`app/page.tsx`) alongside accessible static track cards.
   - 21st.dev Sign-In Presentation (`app/login/page.tsx`):
     - Modernized visual structure with refined inputs, quick identifier hints (`TEAM-###`, `JUDGE-##`, `ADMIN`), and `SpecularButton`.
     - 100% preserved authoritative authentication logic, session handling, CSRF, and redirect behaviors.
   - FAQ Component Polish (`app/faq/page.tsx`):
     - Integrated `SpotlightCard` for header and support banner.
     - Preserved full keyboard accessibility (`aria-expanded`, focus rings) and authentic event FAQ content.

2. **Components Intentionally Skipped or Constrained:**
   - OGL/WebGL Specular Button: Skipped WebGL/shaders in favor of lightweight CSS to ensure cross-device performance and zero canvas overhead.
   - Continuous ClickSpark: Replaced with lazy RAF spark engine that terminates when idle; excluded from admin and judge consoles.
   - Staggered Menu: Skipped replacing existing responsive mobile navigation on portal/admin routes; preserved canonical Navbar.
   - Animated Glow Card (Social Media Style): Skipped social feed semantics (avatars/handles/timestamps) as unsuitable for a technical hackathon portal.
   - Logo Loop / Fake Sponsors: Skipped automated logo ticker and placeholder SVGs; implemented authentic static Academic & Organizing Partners block (Manipal University Jaipur, LearnIT, E-Cell MUJ).

3. **Performance & Motion Optimizations:**
   - RAF engines strictly bounded and idle-stopped.
   - Native CSS keyframe animations for border glow (`@keyframes borderGlow`) without DOM thrashing.
   - `prefers-reduced-motion` universally respected across all interactive elements.

4. **Zero-Tolerance Invariant Checks:**
   - Backdrop-filter check: `rg -n "backdrop-blur|backdrop-filter|backdropFilter" app components styles` → 0 matches.
   - Legacy asset check: `rg -n "light-old|dark-old" app components styles lib` → 0 active references.
   - Historical loader: `components/LoaderAnimation.tsx` remains frozen and untouched.
   - Canonical Navbar: Structure, scroll transitions, and routes preserved without duplicate navbars.

5. **Static & Build Verification:**
   - `npx tsc --noEmit`: 0 errors.
   - `npm run build`: 60/60 routes compiled successfully with Turbopack.
   - `git diff --check`: 0 formatting/whitespace errors.

## Stage R — Sub-Phase A: Targeted Visual Correction & Frontend Motion

1. **A1. Navbar Logo Collision Resolution:**
   - Established strict deterministic layout boundaries in `components/Navbar.tsx`:
     - Brand region wrapped in `shrink-0 min-w-max mr-3 xl:mr-6`.
     - Navigation items wrapped in `flex-1 flex items-center justify-center min-w-0 px-1 xl:px-3`.
     - Actions region wrapped in `shrink-0 min-w-max ml-3 xl:ml-6 z-20`.
   - Updated `components/BrandLogo.tsx` with explicit `shrink-0` on outer `<Link>` and container.
   - Updated `components/ui/resizable-navbar.tsx`:
     - Scrolled pill container width expanded to `max-w-6xl xl:max-w-7xl` with generous padding.
     - Responsive item slicing in `NavItems` (5 primary items directly visible; overflow items neatly placed in "More" menu) prevents any horizontal collision at 1024px, 1280px, 1440px, and under 125%/150%/200% zoom.
   - Verified via browser testing in scrolled desktop (1440px), tablet (1024px), and mobile (390px).

2. **A2 & A3. Page / Section Entrance & Outer Card Motion:**
   - Created `@keyframes entranceReveal` and utility classes (`.animate-entrance`, `.animate-entrance-stagger-1`, `.animate-entrance-stagger-2`, `.animate-entrance-stagger-3`) in `styles/index.css`.
   - Subtle vertical translate (6px) and fade (280–340ms) with `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Added outer-card settling and restrained hover lift (`.card-hover-lift hover:-translate-y-0.5`).
   - Integrated entrance animation into `components/ui/SpotlightCard.tsx`, `app/page.tsx`, `app/login/page.tsx`, and `components/dashboard/ParticipantDashboard.tsx`.
   - Full reduced-motion fallback (`@media (prefers-reduced-motion: reduce)`) universally disables transforms and forces instant appearance.

3. **A4. Spotlight Readability Correction:**
   - Refined `components/ui/SpotlightCard.tsx`:
     - Reduced radial spotlight radius from 400px to 260px.
     - Reduced highlight opacity to `rgba(201, 120, 120, 0.055)`, preventing any pink/brass wash over text.
     - Added pointer fine check (`@media (pointer: fine)`) so touch devices do not receive unwanted sticky hover effects.
     - Preserved `relative z-10` high-contrast content layer.

4. **A5. Canvas / Outer Background Depth:**
   - Added subtle fixed radial gradient depth to `body` in `styles/index.css`:
     - Light mode: Warm ivory canvas with soft dusty rose/terracotta (`rgba(185, 87, 69, 0.035)`) and sandstone/brass (`rgba(176, 138, 69, 0.03)`).
     - Dark mode: Deep espresso canvas with subtle wine/terracotta (`rgba(168, 83, 70, 0.045)`) and warm brass (`rgba(184, 138, 69, 0.03)`).
   - Refined `components/HeritageBackground.tsx` atmospheric veil overlay to add directional richness while keeping photography clear and recognizable.

5. **Static Verification & Acceptance Gate:**
   - `npx tsc --noEmit`: 0 errors.
   - `npm run build`: 60/60 routes compiled successfully.
   - `git diff --check`: 0 errors.
   - Backdrop-filter scan: 0 matches.
   - Legacy asset scan: 0 matches.

## Stage S — Sub-Phase B: Functional Feature Verification & Targeted Operational Repair

### 1. Feature Inventory & Execution Matrix
| Feature | Route | Role | UI Action / API | Status | Persistence & Verification |
|---|---|---|---|---|---|
| **Admin Judging Oversight** | `/admin/judging` | `admin` | `GET /api/admin/assignments` | **PASS** | Evaluated assignments return embedded review objects, scores, and version badges. |
| **Judge Score Correction** | `/admin/judging` | `admin` | `POST /api/admin/reviews/[id]/reopen` | **PASS (REPAIRED)** | Added rubric inputs to correction modal; verified DB update, version increment (v2→v3), immutable `review_history` archive, and `audit_logs`. |
| **Concurrency Lock** | `/admin/judging` | `admin` | `POST /api/admin/reviews/[id]/reopen` | **PASS** | Stale `expected_version` returns `409 Conflict`. |
| **Judging Phase Gate** | `/admin/judging` | `admin` | `POST /api/admin/reviews/[id]/reopen` | **PASS** | Attempting score correction while `event_phase === 'NOT_STARTED'` returns `403 Forbidden` (`PhaseFrozenError`). |
| **Auto-Assign Judges** | `/admin/judging` | `admin` | `POST /api/admin/assignments` | **PASS (REPAIRED)** | Fixed frontend payload (`{ action: 'auto_assign' }`) and supported `{ auto: true }` in API route. |
| **Submission Reopen** | `/admin/submissions` | `admin` | `POST /api/admin/submissions/[id]/reopen` | **PASS** | Blocked with `403` during `JUDGING` phase; min 10 char justification enforced with `400`. |
| **Team Administration** | `/admin/teams` | `admin` | `GET /api/admin/teams`, `PATCH /api/admin/teams` | **PASS** | Single team freeze toggle verified in DB `teams.submission_frozen` and reverted. |
| **Event State Transition** | `/admin/event` | `admin` | `PATCH /api/admin/event-config/transition` | **PASS** | Illegal backward jump (`JUDGING` -> `NOT_STARTED`) strictly rejected with `400 Bad Request`. |
| **Emergency State Override** | `/admin/event` | `admin` | `POST /api/admin/event-config/override-state` | **PASS** | Overrode to `JUDGING` for review testing, then cleanly restored to `NOT_STARTED` with audit logs. |
| **Judge Evaluation** | `/judge/evaluate/[id]` | `judge` | `POST /api/judging/reviews` | **PASS** | Judge evaluated assigned submission; rubric scores persisted in `judge_reviews` with total score calculated server-side (32). |
| **Results Release Gate** | `/results` | `public` | `GET /api/results/public` | **PASS** | Returns `meta.published: false` and empty array while `results_release === 'DRAFT'`. |
| **Session Hydration** | `/login`, `/account` | `admin`, `judge`, `participant` | `POST /api/auth/login`, `GET /api/auth/me` | **PASS** | GoTrue auth hydrated; `profiles.role` resolved accurately for all 3 staging accounts. |
| **Role Authorization** | `/api/admin/*` | `judge`, `participant` | Direct API requests | **PASS** | Participant and Judge tokens rejected with `403 Forbidden`. |

### 2. Defect Root Causes & Targeted Repairs
1. **Admin Judging UI Missing Rubric Fields:**
   - *Root Cause:* The Audited Score Correction modal only accepted a text justification reason without rubric score inputs, and the table lacked one-click access to correct existing reviews.
   - *Fix:* Added score inputs (Innovation, Technical, Presentation, Impact 1–10) in the modal and an action button ("Correct") on scored assignment rows.
2. **Assignments Route Missing Review Details:**
   - *Root Cause:* `GET /api/admin/assignments` fetched assignment rows without joining/subquerying completed review records, meaning admins could not see whether an assignment was evaluated or its version.
   - *Fix:* Added subquery in `app/api/admin/assignments/route.ts` to return `review` object with `id`, `is_complete`, scores, `version`, and `feedback`.
3. **Auto-Assign Payload Mismatch:**
   - *Root Cause:* `app/admin/judging/page.tsx` called `/api/admin/assignments` with `{ auto: true }`, but the API route expected `{ action: 'auto_assign' }`.
   - *Fix:* Updated client to send `{ action: 'auto_assign' }` and updated `app/api/admin/assignments/route.ts` to handle both formats.

### 3. Static & Build Verification
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: 60/60 routes compiled successfully.
- `git diff --check`: 0 errors.
- Invariant check `backdrop-blur|backdrop-filter|backdropFilter`: 0 matches.
- Invariant check `light-old|dark-old`: 0 active runtime references.



