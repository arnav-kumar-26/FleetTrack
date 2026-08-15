# AGENTS.md

## Project
FleetTrack is an internal fleet management app for tracking vehicles and their maintenance history.

## Stack (locked)
- .NET 10 Web API using MVC controllers (no minimal APIs)
- EF Core with the Npgsql provider against PostgreSQL hosted on Supabase
- ASP.NET Identity for users plus JWT bearer auth
- Angular with standalone components only (no NgModules anywhere)
- Tailwind CSS v4 configured purely in CSS (no tailwind.config.js)
- Chart.js rendered through ng2-charts

## Repo layout
- `backend/FleetTrack.Api` — the C# API
- `frontend/fleettrack-app` — the Angular SPA
- The two live side-by-side at the repository root

## C# conventions
- Root namespace: `FleetTrack.Api`
- Folders: `Controllers/`, `Models/`, `Dtos/`, `Data/`, `Services/`, `Common/`
- Controllers stay thin: route + bind + validate, then delegate to Services/

## Angular conventions
- Feature code under `src/app/features/`
- Shared infrastructure under `src/app/core/`, reusable bits under `src/app/shared/`
- Every component standalone
- No `any` types on service method signatures
- Models mirror the backend DTOs exactly

## Secrets policy
- Never commit real connection strings, JWT signing keys, or passwords
- Backend: use `dotnet user-secrets` locally
- Frontend: use a gitignored `.env`-style file if needed

## Background Process Execution Rules for Windows

1. **Full Process Detachment:**
   Never use standard `Start-Process` for long-running servers. Always launch background executables using `cmd /c start /b` or completely close stdout/stderr handles so the tool runner returns immediately:
   ```powershell
   cmd /c start /b "" "C:\Projects\FleetTrack\backend\FleetTrack.Api\bin\Debug\net10.0\FleetTrack.Api.exe" > NUL 2>&1
   ```

2. **Environment before launch:** Set `ASPNETCORE_ENVIRONMENT=Development`, `DOTNET_ENVIRONMENT=Development`, and `ASPNETCORE_URLS=http://localhost:5295` in the current PowerShell session before launching the API. Launching the exe directly ignores `launchSettings.json` profiles and user-secrets are only loaded in the Development environment.

3. **Redirect I/O to files, never to the tool pipe:** If you need logs, redirect to a file (`> log.txt 2>&1` or `-RedirectStandardOutput`), never leave stdout/stderr attached to the tool runner, or the shell command blocks and times out.

4. **Verify the port before proceeding:** After launching, confirm the expected port is listening (`Get-NetTCPConnection -State Listen -LocalPort 5295`) and hit a real endpoint (e.g. `POST /api/auth/login`) before considering the backend "up".

## Working discipline
- After generating code for a step, stop and let the human verify.
- Do not move on to unrelated work in the same step.