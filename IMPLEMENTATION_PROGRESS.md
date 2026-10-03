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

Commit: pending participant workflow checkpoint
