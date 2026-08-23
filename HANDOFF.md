# FleetTrack — Design System Rollout Handoff

Handoff prepared at end of session. Work is on branch `feature/design-system-rollout` and is **uncommitted**.

## Git state
- Branch: `feature/design-system-rollout` (pushed to origin, tracking set)
- Modified: `frontend/fleettrack-app/src/styles.css`, `src/app/app.component.{ts,html,css}`, `src/app/app.config.ts`
- Untracked (new): `frontend/fleettrack-app/src/app/layout/` (sidebar + header components)
- No commits yet on this branch (base is `main` @ `36467ec`).

## Build / verify
```powershell
cd frontend/fleettrack-app
npm run build        # succeeds (one non-blocking warning below)
```
Known warning: `bundle initial exceeded maximum budget` (700 kB budget, ~710 kB). Purely a size budget warning, build still succeeds; not introduced by this work specifically but grew as tokens/icons were added. No TS or CSS errors.

## Completed work

### Task 1 — Theme tokens (`src/styles.css`)
- Extended the existing Tailwind v4 `@theme` block as **`@theme static`** (NOT plain `@theme` — plain `@theme` tree-shakes unused vars and they were vanishing from compiled CSS; `static` forces emission of all theme variables, which later tasks need as `var(--color-*)`).
- Added 23 `--color-*`, 4 `--radius-*`, 2 `--shadow-*`, 3 `--spacing-*`, `--font-sans` (overrides Tailwind default → all `font-sans` usages pick it up), 4 `--text-*`.
- Added standalone `:root { --sidebar-width: 270px; }` outside the theme block (fixed layout dim, intentionally not a theme token).
- Light-mode only. No `tailwind.config.js` (v4 CSS-first).

### Task 2 — Sidebar extraction + app shell (`src/app/layout/sidebar/`, `app.component.*`)
- New `layout/sidebar/sidebar.component.{ts,html,css}` — standalone, `ChangeDetectionStrategy.OnPush`, classic `@Input()/@Output()` decorators (matches the only existing output convention: drawer `@Output() saved`).
- `app.component.html` shell: page bg (`bg-page`), shell container (`.shell` in `app.component.css` = `bg-shell`/`rounded-shell`/`shadow-shell`/`overflow-hidden`, `z-10`), canvas backdrop (`.canvas` = `bg-canvas`, `z-20`, `overflow-y-auto`). Fixed height `h-[calc(100vh_-_2rem)]` keeps sidebar always visible; content scrolls in canvas.

### Task 3 — Header extraction (created net-new; FleetTrack had no header markup)
- `layout/header/header.component.{ts,html,css}` — standalone, OnPush, classic decorators. Search pill (left), mail/bell circular icon buttons + profile block (right).
- **Bug found & fixed**: lucide icons are registered via an explicit allowlist in `app.config.ts` (`provideLucideIcons`). Any `lucideIcon="name"` not in that list makes `LucideDynamicIcon` **throw `Unable to resolve icon '...'` at runtime** during change detection — this broke the app (dashboard data not painting, nav latency, login flash). Registered `LucideSearch` + `LucideBell`.
- **Always register every new lucide icon** in `app.config.ts` (`LucideSettings` was also added later). Verify by scanning all `lucideIcon="..."` usages against the allowlist.

### Header/Sidebar enhancement (post-Task-3, requested ad hoc)
1. **Removed duplicate profile** from sidebar footer (avatar/name/email + logout) — the top-right header profile is the single user icon.
2. **Header profile dropdown**: clicking the profile block toggles a menu (Settings → emits `settings`; Logout → emits `logout`), absolutely positioned `right: 0` under the block, closes on item click or click-away.
3. **Bell & Mail dropdowns**: each icon toggles its own dropdown (`right: 0` under its `.menu-anchor`). Single `openMenu` signal of type `'profile' | 'messages' | 'notifications' | null` guarantees mutual exclusivity. New optional inputs `messages` / `notifications` (`HeaderMessage[]` / `HeaderNotification[]`, default `[]`) — render `@for` list or a styled empty state ("No messages" / "No notifications"). `AppComponent` passes no such data yet → empty states show; **no new service/state/HTTP added**.
4. **Click-away**: one fixed transparent `.menu-backdrop` at header root when `openMenu() !== null` closes all menus. `:host { position: relative; z-index: 30 }` so dropdowns paint above the z-20 canvas.
5. **Sidebar category groups**: nav now has two uppercase/muted section titles — **MENU** (Dashboard, Vehicles routerLinks) and **GENERAL** (Settings, Logout buttons). Sidebar gained `settings`/`logout` outputs; `logout` wired to `app.component.logout()` (same handler as header), `settings` emitted unbound (no settings route exists in `app.routes.ts`).

## Conventions locked in (follow for all remaining tasks)
- **Inputs/Outputs**: classic `@Input()`/`@Output()` + `EventEmitter` decorators. Internal state: `signal()`. `inject()` for DI.
- **Templates/styles**: existing feature components (e.g. `vehicle-list`) use inline `template`; layout components (`sidebar`, `header`) use separate `templateUrl`/`styleUrl`/`.css` files. New shared atoms (Tasks 4–7) must **match vehicle-list's inline convention** per the task sequence.
- **ChangeDetectionStrategy.OnPush** on all new components.
- Angular 22 — `@if` / `@for` / `@empty` control flow available.
- Lucide icons must be registered in `app.config.ts`.
- `z-20` sidebar/header, `z-10` shell, `z-50` reserved for tooltip (Task 9) & overlays.

## Remaining tasks (execute one at a time, stop for human review after each)
- Task 4 — `shared/ui/button/` (`app-button`, `variant: 'filled' | 'outlined'`, `@Input()`)
- Task 5 — `shared/ui/status-pill/` (`app-status-pill`, `status: 'completed' | 'in-progress' | 'pending'`)
- Task 6 — `shared/ui/avatar/` (`app-avatar`, optional `src`/`name` inputs)
- Task 6b — retrofit header profile avatar to `<app-avatar>`
- Task 7 — `shared/ui/icon-chip/` (`app-icon-chip`, `color: 'blue' | 'teal' | 'violet' | 'amber'`)
- Tasks 8–10 — Dashboard (stat cards, Chart.js chart + custom HTML tooltip, reminders card)
- Tasks 11–14 — Vehicle list / detail / drawer / form restyle
- Tasks 15–16 — Maintenance-log drawer / form restyle
- Task 17 — Login restyle

Dashboard uses inline template in `dashboard.component.ts` (no `.html` file); has sections: stat cards, cost-trend chart, recent-activity card (NOT the 3-section assumption in the task doc — the third section is "Recent activity", not "Reminders"; Task 8's pre-check must flag this).

## Notes / gotchas for the new session
- `@theme static` in `styles.css` is deliberate — do not revert to plain `@theme`.
- Chart.js canvas colors can't read `var()` — Task 9 must resolve tokens via `getComputedStyle(document.documentElement)`.
- `app.component.ts` exposes `isAuthenticated()` (signal), `currentUser()` (signal), `initials()` (method), `logout()`. Reuse these; do not add new services/state/HTTP for data already available.
- Do not touch `backend/FleetTrack.Api/**`, `core/styles/motion.css`, `core/directives/count-up.directive.ts`, `core/utils/stagger.util.ts`.