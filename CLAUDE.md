# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at http://localhost:4200 (hot reload)
npm run build    # Production build → dist/frontend/
ng test          # Unit tests (Jasmine/Karma)
ng lint          # ESLint
```

The frontend expects a backend API running at `http://localhost:5000/api/learning`.

## Backend API Project

**Path:** `D:\_AI-Math-Tutor-Demo\AI-Math-Tutor-API-Demo`  
**Tech:** ASP.NET Core 8, EF Core 8 + SQLite  
**Production:** `https://ai-math-tutor-api-demo-production.up.railway.app`

```bash
# From D:\_AI-Math-Tutor-Demo\AI-Math-Tutor-API-Demo
dotnet run       # Dev server at http://localhost:5000
dotnet build     # Build check
```

### Backend Endpoints

| Endpoint | Purpose |
|---|---|
| `GET  /api/learning/start/{scenarioId}` | Start lesson |
| `POST /api/learning/evaluate` | Evaluate student answer |
| `GET  /api/learning/assist/{scenarioId}/{step}/{type}` | Get hint/guided/worked-example |
| `POST /api/learning-sessions` | Create session (called on lesson start) |
| `POST /api/learning-sessions/{id}/complete` | Save completed session |
| `POST /api/learning-sessions/{id}/parent-feedback` | Save parent feedback |
| `GET  /api/admin/learning-sessions/export` | Export all sessions as JSON |

### Backend Structure

```
AI-Math-Tutor-API-Demo/
├── Controllers/
│   ├── LearningFlowController.cs      # /api/learning endpoints
│   └── LearningSessionController.cs   # /api/learning-sessions endpoints
├── Services/
│   ├── LearningFlowService.cs         # Lesson logic, scenarios, answer evaluation
│   └── LearningSessionService.cs      # Session CRUD, parent feedback, export
├── Models/
│   ├── Dtos.cs                        # Learning flow request/response DTOs
│   ├── SessionDtos.cs                 # Session collection DTOs
│   ├── LearningSessionEntity.cs       # EF Core entity (DB table)
│   ├── LearningStep.cs
│   └── ScenarioDefinition.cs
├── Data/
│   └── AppDbContext.cs                # SQLite DB context
├── Program.cs
└── backend.csproj
```

### Database

SQLite file: `learning_sessions.db` (auto-created on first run, in project root)  
Table: `LearningSessions` — columns: `SessionId`, `Topic`, `StudentAlias`, `CreatedAt`, `CompletedAt`, `Completed`, `SessionJson` (full JSON blob)

## Architecture

Angular 20 single-page app using **standalone components** and **Angular signals** for state. No NgModules.

### Layers

**Service** (`src/app/services/tutor.service.ts`)  
Single central service holding all reactive state via `signal()`. Sends HTTP POST to `http://localhost:5000/api/learning` and manages: selected scenario, chat messages, current step, error count, and generated learning artifacts (notes, summary, reflections).

**Models** (`src/app/models/learning.model.ts`)  
Request/response interfaces for the API. Three learning scenarios: `fish-tank`, `parcel`, `water-tank`. Feedback types: hints, guided assistance, worked examples (triggered after ≥2 wrong attempts).

**Components** (all standalone, in `src/app/components/`)  
- `ChatComponent` — main interaction panel with progress bar, message bubbles, and assist buttons
- `LearningReflectionComponent`, `StudentNoteComponent`, `ParentSummaryComponent` — display generated learning artifacts from the tutor service
- `RealWorldComponent` — shows real-world applications of the math concept
- `AppComponent` — layout root: 3-column flex grid (chat left/center, sidebar right)

### Layout

3-column responsive grid defined in `app.component.css`:
- Left + center: chat area (`flex: 3`)
- Right sidebar: notes, summary, real-world panel (`flex: 2`)
