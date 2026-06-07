# PROJECT BRAIN — SESSION SUMMARY

**Generated:** 2026-06-07 (updated end-of-session)
**Source:** Full analysis of 90_Project_Brain/* + session changes
**Purpose:** Single-file context for AI sessions — current truth only, no history

---

## 1. What This Project Is

An AI math tutor for Thai Grade 8 students (ม.2). It teaches volume and surface area through guided Socratic questioning — not by giving answers.

**North Star:** "Help students learn independently every day."  
**Core Principle:** Teaching Flow > AI Capability. The Learning Flow Engine is the product differentiator, not the LLM.

**Stack:**
- Frontend: Angular 20, standalone components, signals, `localhost:4200`
- Backend: ASP.NET Core 8 + EF Core + SQLite, `localhost:5000`
- Production: Frontend + Backend both on Railway (HTTPS)
- LLM: Claude / OpenAI / Mock (swappable)

---

## 2. Current Phase

**Phase 1 — Demo & Discovery**  
**Status: Feature Complete → Waiting for user sessions**

All P0/P1 features are built. The single active blocker is collecting **20–50 real user sessions** to validate hypotheses before Phase 2 planning begins.

**Feature freeze is active.** Changes this session were evidence collection improvements and bug fixes — not new features.

---

## 3. What Is Built (Feature Complete)

| Feature | Status |
|---|---|
| Learning Flow Engine (3-scenario step engine) | ✅ |
| 3 Scenarios: Fish Tank / Parcel / Water Tank | ✅ |
| 4-level Assistance Ladder: Hint → Help Me Start → Worked Example → Solution | ✅ |
| Scenario 0 Onboarding (teaches UI before math) | ✅ |
| Free Talk mode | ✅ |
| Student Notes (auto-generated) | ✅ |
| Parent Summary | ✅ |
| AI Feedback (growth mindset language) | ✅ |
| Lesson Complete Screen | ✅ |
| Learning Session Logging (server-side, anonymous) | ✅ |
| Event Tracking | ✅ |
| Discovery Batch Review (`/admin/discovery-batches`) | ✅ |
| Voice interaction mode (STT/TTS, Chrome/Edge only) | ✅ |
| Mobile-responsive layout (iOS keyboard, touch targets, bottom sheet) | ✅ |
| **ความเข้าใจของหนู — Reflection Capture (3 free-text questions)** | ✅ NEW |
| **AI Role Reflection Question (H-10 evidence chip)** | ✅ NEW |

**Explicitly Out of Scope (demo phase):** Auth, RAG, Qdrant, gamification, scores, teacher portal, adaptive learning.

---

## 4. Architecture Constraints

- **Learning Flow Engine controls correctness** — LLM only generates language.
- **No authentication** — anonymous session IDs (UUID + Student-001 alias).
- **SQLite** — acceptable for demo scale. Production on Railway uses SQLite.
- **Session storage:** full JSON blob in `SessionJson` — flexible schema, no migrations.
- **Reflection data** stored as `reflection` field in `SessionJson` blob via `POST /api/learning-sessions/{id}/reflection`.
- **No mock provider** — API unavailability blocks dev/testing (Risk T3, unmitigated).

---

## 5. Evidence State (as of 2026-06-06)

**Sessions analyzed: ~1–2 (pre-framework). Target: 20+**

| Hypothesis | Status | Evidence |
|---|---|---|
| H-01 Parent Summary creates value | 🔲 Unvalidated | None |
| H-02 Help Me Start > Hint | 🔲 Unvalidated | None |
| H-03 Students return for more sessions | 🔲 Unvalidated | None |
| H-04 Assistance ladder reduces solution-seeking | 🟡 Anecdotal | EL-001: 1 student used hints 3×, never clicked Solution |
| H-05 Flow Engine > plain LLM | 🔲 Unvalidated | None — never tested |
| H-06 Real-world connection increases engagement | 🔲 Unvalidated | None |
| H-07 Students have sufficient prerequisites | 🟡 Partial | EL-002: some students struggle with multiplication and units |
| H-08 Scenario 0 reduces UI confusion | 🔲 Unvalidated | None |
| H-09 Growth mindset language reduces anxiety | 🔲 Unvalidated | None |
| H-10 AI as Thinking Partner | 🔲 Unvalidated | Evidence collection now enabled via reflection + AI role question |
| H-11 Abandonment clusters at specific steps | 🔲 Unvalidated | None |

---

## 6. Open Questions (Must Answer Before Phase 2)

1. **Q1** Do parents actually open and act on the Parent Summary? → track `parent_summary_opened`
2. **Q2** Does Help Me Start create more value than a plain Hint? → compare event rates
3. **Q3** Where do students abandon the lesson? → `session_abandoned` by step
4. **Q4** Do students return for a second session? → device UUID tracking
5. **Q5** Are prerequisite gaps blocking progress? → session message review
6. **Q11** Does voice produce better outcomes than text? → Experiment E-01

---

## 7. Active Risks

| Risk | Severity | Mitigation Status |
|---|---|---|
| **P1** Cannot collect 20+ sessions | Very High | ⚠️ No concrete recruitment plan |
| **H-05 never tested** (core product claim) | High | ⚠️ No A/B test planned |
| **E1** Learned helplessness | High | Partial — ladder + event tracking |
| **E2** Prerequisite gaps | Medium | Worked Example covers basics |
| **T1** LLM inconsistency | Medium | Mitigated — Flow Engine owns correctness |
| **O1** Solo developer dependency | High | Mitigated by vault documentation |
| **T3** No mock LLM provider | Medium | ⚠️ Unmitigated |
| **NEW — Follow-up question detection false negatives** | Low | Heuristic pattern matching may miss some questions — manual session review needed to calibrate |

---

## 8. Decisions That Are Locked (Do Not Re-debate)

- No authentication in demo phase
- No gamification (scores, XP, badges) — ever
- 4-level help ladder over single hint
- No RAG / Qdrant until LLM limitations appear
- JSON blob storage during discovery phase
- Growth mindset language throughout
- Feature freeze — no major features until 20+ sessions analyzed

---

## 9. Session Changes (2026-06-07)

### Mobile UX Fixes

Critical bugs that would have blocked user testing on mobile devices.

| Fix | Files | Detail |
|---|---|---|
| iOS keyboard hides input | `app.component.ts`, `index.html` | `height: 100dvh` + `viewport-fit=cover` — layout now shrinks correctly when keyboard opens |
| Auto-focus opens keyboard unexpectedly | `onboarding.component.ts`, `chat.component.ts` | Focus skipped on touch devices (`hover: none and pointer: coarse`) |
| iOS zoom on input tap | `chat.component.ts`, `onboarding.component.ts` | `font-size: 16px` on all inputs — iOS Safari no longer auto-zooms |
| Touch targets too small | Both components | `min-height: 44px` on all buttons and inputs (Apple/Android guideline) |
| Full keyboard for math answers | Both components | `inputmode="decimal"` — number pad shown instead |
| iPhone home indicator overlap | `app.component.ts` | `env(safe-area-inset-bottom)` now applied to both nav padding and layout padding |

### Mobile Layout Changes

| Change | Detail |
|---|---|
| Side panels → bottom sheet | ใช้ในชีวิตจริง / บันทึกของหนู / สรุปสำหรับผู้ปกครอง hidden from main scroll on mobile. Accessible via 📋 บันทึก tab in bottom nav. Slides up with backdrop + close button. |
| Bottom nav: เกี่ยวกับ → 📋 บันทึก | เกี่ยวกับ still accessible from the header `<app-about>` component |
| Onboarding learn-or-talk | `.mode-descs` (2-line descriptions) hidden on mobile — only prompt text + 2 buttons remain |

### No New Features, No New Evidence, No New Risks

These are bug fixes and UX improvements to ensure the product works correctly on mobile before user testing begins. Feature freeze remains active.

---

## 10. Session Changes (2026-06-06)

### Bug Fixes
| Fix | Detail |
|---|---|
| Voice `network` error | Added specific Thai error message + `networkError` signal + auto-fallback to text mode + `voice_network_error_fallback_to_text` event |
| Follow-up question count | Removed incorrect total-message counter. Now detects real follow-up questions via pattern matching (`?`, "ทำไม", "อธิบาย" etc.) → logs `student_follow_up_question:{text}` |

### DEC-010 Messaging Changes
| Location | Before | After |
|---|---|---|
| Lesson complete hero | "เรียนจบบทนี้แล้ว" | "เราคิดด้วยกันครบแล้วครับ" |
| Feedback section title | "⭐ Feedback จาก AI Tutor" | "⭐ เราเรียนรู้ด้วยกันเป็นยังไงบ้าง" |
| Backend WorkedExample | "ครูช่วยเริ่มให้ก่อนนะ" | "มาลองด้วยกันก่อนนะครับ" |

### New Event Tracking
| Event | Trigger |
|---|---|
| `voice_selected` | Switch to voice mode |
| `chat_selected` | Switch to text mode |
| `reflection_ai_role:{answer}` | AI role chip selected |
| `reflection_completed` | AI role chip selected |
| `reflection_submitted` | ความเข้าใจของหนู submitted |
| `reflection_skipped` | ความเข้าใจของหนู skipped |
| `student_follow_up_question:{text}` | Real follow-up question detected |
| `voice_network_error_fallback_to_text` | Voice network error occurred |

### New Feature: ความเข้าใจของหนู
- 3 free-text questions after lesson complete (what I learned / hardest part / want to remember)
- Stored in `SessionJson.reflection` via new endpoint `POST /api/learning-sessions/{id}/reflection`
- Supports H-04, H-07, H-10 evidence collection

---

## 10. Recommended Next Actions

**Immediate (this week):**
1. Recruit 5–10 ม.2 students for user testing sessions (20–30 min each)
2. Verify event tracking pipeline end-to-end: confirm all new events reach the DB
3. Run one test session — verify `reflection` field appears in export JSON

**After 10 sessions:**
4. First Discovery Batch Review via `/admin/discovery-batches`
5. Check `reflection_completed` rate vs `reflection_skipped` rate (target: >50% completion)
6. Review `student_follow_up_question` events manually — calibrate pattern matching if needed

**After 20+ sessions:**
7. Answer Q1–Q5 from Open Questions
8. Lock Phase 2 MVP scope in Decisions.md

---

## 11. Language Rules (Always Apply)

| Avoid | Use Instead |
|---|---|
| อ่อน, อ่อนแอ, ผิด, ไม่เก่ง, weak, failed | กำลังพัฒนา, กำลังเติบโต, ลองอีกครั้ง |
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
8. Production: both frontend + backend on Railway (HTTPS) — voice network errors are client-side, not server-side.
9. Run `npm start` (frontend) and `dotnet run` (backend) separately.
10. For technical implementation details: `06_Technical/AI-Agent-Instructions.md` in vault.
