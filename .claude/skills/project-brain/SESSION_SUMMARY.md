# PROJECT BRAIN — SESSION SUMMARY

**Generated:** 2026-06-06  
**Source:** Full analysis of 90_Project_Brain/* + 01_Dashboard + Evidence_Log + Hypotheses  
**Purpose:** Single-file context for AI sessions — current truth only, no history

---

## 1. What This Project Is

An AI math tutor for Thai Grade 8 students (ม.2). It teaches volume and surface area through guided Socratic questioning — not by giving answers.

**North Star:** "Help students learn independently every day."  
**Core Principle:** Teaching Flow > AI Capability. The Learning Flow Engine is the product differentiator, not the LLM.

**Stack:**
- Frontend: Angular 20, standalone components, signals, `localhost:4200`
- Backend: ASP.NET Core 8 + EF Core + SQLite, `localhost:5000`
- Production backend: `https://ai-math-tutor-api-demo-production.up.railway.app`
- LLM: Claude / OpenAI / Mock (swappable)

---

## 2. Current Phase

**Phase 1 — Demo & Discovery**  
**Status: Feature Complete → Waiting for user sessions**

All P0/P1 features are built and deployed. The single active blocker is collecting **20–50 real user sessions** to validate hypotheses before Phase 2 planning begins.

Do NOT add major features. The decision to freeze is formal and recorded in Decisions.md.

---

## 3. What Is Built (Feature Complete)

| Feature | Status |
|---|---|
| Learning Flow Engine (3-scenario step engine) | ✅ |
| 3 Scenarios: Fish Tank / Parcel / Water Tank | ✅ |
| 4-level Assistance Ladder: Hint → Help Me Start → Worked Example → Solution | ✅ |
| Scenario 0 Onboarding (teaches UI before math) | ✅ |
| Free Talk mode (student can pause lesson to chat) | ✅ |
| Student Notes (auto-generated learning asset) | ✅ |
| Parent Summary | ✅ |
| AI Feedback (growth mindset language) | ✅ |
| Lesson Complete Screen | ✅ |
| Learning Session Logging (server-side, anonymous) | ✅ |
| Event Tracking (hint_clicked, session_abandoned, etc.) | ✅ |
| Discovery Batch Review (admin tool `/admin/discovery-batches`) | ✅ |
| Voice interaction mode (STT/TTS, Chrome/Edge only) | ✅ |
| Mobile-responsive layout + bottom nav + notes bottom sheet | ✅ |

**Explicitly Out of Scope (demo phase):** Auth, RAG, Qdrant, gamification, scores, teacher portal, adaptive learning, complex DB schema.

---

## 4. Architecture Constraints

- **Learning Flow Engine controls correctness** — LLM only generates language. Expected answers are hardcoded in scenario JSON.
- **No authentication** — anonymous session IDs (UUID + Student-001 alias). Students are minors; no PII collected.
- **SQLite (not PostgreSQL)** — current implementation uses SQLite despite Architecture docs saying PostgreSQL. SQLite is acceptable for demo scale.
- **Session storage:** full JSON blob in `SessionJson` column — flexible, no migrations needed during discovery.
- **No mock provider** yet — API unavailability blocks dev/testing (Risk T3, unmitigated).

---

## 5. Evidence State (as of 2026-06-06)

**Sessions analyzed: ~1–2 (pre-framework). Nowhere near the 20 needed.**

| Hypothesis | Status | Evidence |
|---|---|---|
| H-01 Parent Summary creates value | 🔲 Unvalidated | None |
| H-02 Help Me Start > Hint | 🔲 Unvalidated | None |
| H-03 Students return for more sessions | 🔲 Unvalidated | None |
| H-04 Assistance ladder reduces solution-seeking | 🟡 Anecdotal | EL-001: 1 student used hints 3×, never clicked Solution |
| H-05 Flow Engine > plain LLM | 🔲 Unvalidated | None — **never tested** |
| H-06 Real-world connection increases engagement | 🔲 Unvalidated | None |
| H-07 Students have sufficient prerequisites | 🟡 Partial — gaps found | EL-002: some students struggle with 3-number multiplication and cm/m units, not the concept itself |
| H-08 Scenario 0 reduces UI confusion | 🔲 Unvalidated | None |
| H-09 Growth mindset language reduces anxiety | 🔲 Unvalidated | None |
| H-10 Voice vs text preference | 🟡 Testing | Experiment E-01 is designed but not yet run |
| H-11 Abandonment clusters at specific steps | 🔲 Unvalidated | None |

**Critical gap:** H-05 (Flow Engine vs plain LLM) is the core product claim and has **never been tested**. This is a significant unacknowledged risk.

---

## 6. Open Questions (Must Answer Before Phase 2)

Priority order — all require session data:

1. **Q1** Do parents actually open and act on the Parent Summary? → track `parent_summary_opened`
2. **Q2** Does Help Me Start create more value than a plain Hint? → compare event rates
3. **Q3** Where do students abandon the lesson? → `session_abandoned` by step
4. **Q4** Do students return for a second session? → device UUID tracking
5. **Q5** Are prerequisite gaps (multiplication, units) blocking progress? → session message review
6. **Q11** Does voice produce better outcomes than text? → Experiment E-01

---

## 7. Active Risks

| Risk | Severity | Mitigation Status |
|---|---|---|
| **P1** Cannot collect 20+ sessions (blocks all Phase 2 decisions) | Very High | ⚠️ No concrete recruitment plan documented |
| **H-05 never tested** (core product claim unvalidated) | High | ⚠️ No A/B test planned — architectural constraint |
| **E1** Learned helplessness (students skip straight to solution) | High | Partial — ladder design + event tracking |
| **E2** Prerequisite gaps (EL-002 weak signal) | Medium | Worked Example covers basics — not a systematic fix |
| **T1** LLM inconsistency in math guidance | Medium | Mitigated — Flow Engine owns correctness |
| **O1** Solo developer dependency | High | Mitigated by vault documentation |
| **T3** No mock LLM provider | Medium | ⚠️ Unmitigated — API down = dev blocked |

---

## 8. Decisions That Are Locked (Do Not Re-debate)

- No authentication in demo phase
- No gamification (scores, XP, badges) — ever, conflicts with philosophy
- 4-level help ladder over single hint
- No RAG / Qdrant until LLM limitations appear
- JSON blob storage during discovery phase
- Growth mindset language throughout (vocabulary rules in AI_Onboarding_Guide.md)
- Feature freeze — no major features until 20+ sessions analyzed

---

## 9. Contradictions & Inconsistencies Found

| Issue | Detail |
|---|---|
| **Architecture says PostgreSQL, code uses SQLite** | `CLAUDE.md` and `AppDbContext` use SQLite. Architecture docs say PostgreSQL. Current state: SQLite. Acceptable for demo. |
| **H-05 is P0 but untestable with current design** | The core claim (Flow Engine > plain LLM) requires an A/B test that doesn't exist and would require a separate code path. No plan to resolve this in Phase 1. |
| **Voice mode on mobile** | Voice uses Web Speech API (Chrome/Edge only). Mobile Chrome on Android supports it; iOS Safari does not. The UI shows "Chrome/Edge only" warning but does not distinguish iOS vs Android. |
| **`session_abandoned` event** | Listed as a tracked event in Feature Catalog and Hypotheses. Unclear if backend is actually emitting this event consistently — needs verification before batch analysis. |

---

## 10. Recommended Next Actions

**Immediate (this week):**
1. Recruit 5–10 ม.2 students for user testing sessions (20–30 min each)
2. Verify event tracking pipeline end-to-end: confirm `session_started`, `hint_clicked`, `help_me_start_clicked`, `lesson_completed`, `session_abandoned` reach the DB
3. Run one test session and export via `GET /api/admin/learning-sessions/export` to validate data quality

**After 10 sessions:**
4. First Discovery Batch Review via `/admin/discovery-batches`
5. Log findings as EL-003+ in Evidence_Log.md
6. Update Hypothesis Status Dashboard in Evidence_Summary.md

**After 20+ sessions:**
7. Answer Q1–Q5 from Open Questions
8. Lock Phase 2 MVP scope in Decisions.md
9. Begin Phase 2 planning (persistent sessions, more scenarios, student identity strategy)

---

## 11. Language Rules (Always Apply)

| Avoid | Use Instead |
|---|---|
| อ่อน, อ่อนแอ, ผิด, ไม่เก่ง, weak, failed | กำลังพัฒนา, กำลังเติบโต, ลองอีกครั้ง, growing, practicing |
| คะแนน, เกรด, score | ความก้าวหน้า, การเรียนรู้ |

No scores, percentages, or rankings anywhere in the product.

---

## 12. Working Rules for AI Sessions

1. Read this file first. Do not re-derive context from scratch.
2. Before implementing anything, check MVP_Scope.md and Decisions.md.
3. Feature freeze is active — no new features without evidence justification.
4. The Flow Engine owns correctness; the LLM owns language only.
5. All session data is anonymous — no PII, no names, no emails.
6. Backend path: `D:\_AI-Math-Tutor-Demo\AI-Math-Tutor-API-Demo`
7. Frontend path: `D:\_AI-Math-Tutor-Demo\AI-Math-Tutor-Demo`
8. Run `npm start` (frontend) and `dotnet run` (backend) separately.
9. For technical implementation details: `06_Technical/AI-Agent-Instructions.md` in vault.
10. For reasoning workflow: `99_AI_System/AI_Workflow.md` in vault.
