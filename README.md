# FleetTrack

FleetTrack is an internal fleet management app for tracking vehicles and their maintenance history.

## Stack

- **Backend:** .NET 10 Web API using MVC controllers (no minimal APIs)
- **Data:** EF Core with the Npgsql provider against PostgreSQL hosted on Supabase
- **Auth:** ASP.NET Identity for users plus JWT bearer authentication
- **Frontend:** Angular (standalone components only, no NgModules) with Tailwind CSS v4 (CSS-first, no `tailwind.config.js`)
- **Charts:** Chart.js rendered through ng2-charts
- **Icons:** @lucide/angular

## Repo layout

- `backend/FleetTrack.Api` — the C# API
- `frontend/fleettrack-app` — the Angular SPA

The two run side-by-side at the repository root.

## Prerequisites

- .NET 10 SDK
- Node.js (the frontend pins its package manager via `packageManager` in `package.json`)
- npm

## Running the backend

The connection string and JWT signing keys are stored in .NET user-secrets (never committed). Configure them once:

```bash
cd backend/FleetTrack.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<connection string>"
dotnet user-secrets set "Jwt:Key" "<key>"
dotnet user-secrets set "Jwt:Issuer" "FleetTrackApi"
dotnet user-secrets set "Jwt:Audience" "FleetTrackClient"
dotnet user-secrets set "Jwt:ExpiryMinutes" "1440"
```

The connection string uses the Supabase IPv4-compatible **Connection Pooler** host so the API can be reached over IPv4 (the direct `db.*.supabase.co` host resolves only to IPv6). Use the pooler username format `postgres.<project-ref>` and the transaction-pooler port `5432`.

Run the API (Development environment is required to load user-secrets):

```bash
cd backend/FleetTrack.Api
dotnet run --project .
```

The API listens on `http://localhost:5295`. A Scalar API reference is available at `/scalar/v1` in Development.

## Running the frontend

`ng` is not installed globally — use `npx ng` or the npm scripts from inside `frontend/fleettrack-app`.

```bash
cd frontend/fleettrack-app
npm install
npm start        # ng serve on http://localhost:4200
```

The dev server proxies API calls to `http://localhost:5295` via the environment files in `src/environments/`.

Build:

```bash
npm run build    # ng build (production by default)
```

Test:

```bash
npm test         # ng test (Vitest)
```

## Secrets policy

- Never commit real connection strings, JWT signing keys, or passwords.
- Backend: use `dotnet user-secrets` locally (see above).
- Frontend: use a gitignored `.env`-style file if needed.
- Build artifacts (`bin/`, `obj/`, `dist/`, `node_modules/`) are excluded via the root `.gitignore`.
