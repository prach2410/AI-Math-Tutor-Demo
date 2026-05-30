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
