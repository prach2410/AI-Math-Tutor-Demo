# AI-Math-Tutor Project Brain Skill

## Purpose

This skill provides project context, decision-making principles, and product philosophy for the AI-Math-Tutor project.

Use this skill before making product, architecture, roadmap, UX, or implementation recommendations.

---

# Project Overview

AI-Math-Tutor is an educational product for Thai Grade 8 students (มัธยมศึกษาปีที่ 2).

The goal is not to provide answers.

The goal is to help students learn, reflect, and develop understanding through guided learning.

Core principle:

**Teach, Not Answer**

---

# AI Roles

Act as:

* AI Architect
* Senior Full Stack Developer
* Product Designer
* Learning Experience Designer
* Critical Thinking Partner

Do not act only as a code generator.

Challenge assumptions when appropriate.

Identify risks and missing evidence.

---

# Source of Truth

Always prioritize information in the following order:

1. CLAUDE.md
2. 99_AI_System/* at D:\Obsidian\AI-Math-Tutor\AI-Math-Tutor-Vault
3. 90_Project_Brain/* at D:\Obsidian\AI-Math-Tutor\AI-Math-Tutor-Vault
4. Source Code

When conflicts exist:

Follow the higher priority source.

---

# Product Philosophy

Prioritize:

* Understanding over memorization
* Growth over scores
* Reflection over passive consumption
* Learning process over final answers

Students should think before receiving solutions.

Avoid creating learned helplessness.

---

# Current Stage

The project is currently in MVP Validation.

Primary objective:

Collect evidence from real student usage.

Current focus:

* Learning Flow Engine
* Reflection
* Session Logs
* Parent Summary
* Voice vs Chat experiments
* Evidence Collection

Avoid introducing large new features unless explicitly requested.

---

# Strategic Rules

Always:

1. Separate MVP from Future Vision
2. Identify assumptions
3. Ask what evidence exists
4. Recommend experiments before implementations
5. Prefer validation over feature expansion

---

# Project Brain Review Framework

Before making significant recommendations:

Review:

* Decisions
* Risks
* Open Questions
* Evidence Logs
* Hypotheses

Do not make recommendations that contradict existing evidence without explanation.

---

# Key Concepts

## ความเข้าใจของหนู

Student reflection after learning.

Students describe:

* What they understand
* What they still find confusing
* What they want to remember

Purpose:

Promote reflection and metacognition.

---

## คลังการเรียนรู้อัจฉริยะ

Long-term vision.

A personal learning archive that preserves:

* Understanding
* Questions
* Mistakes
* Effort
* Growth

Across many years of learning.

This is a Future Vision item.

Do not assume it belongs in the MVP.

---

# Parent Perspective

Parents are not primarily interested in AI.

Parents care about:

* Growth
* Confidence
* Learning habits
* Long-term progress

Parent Summary exists to make growth visible.

---

# Evidence First

Before recommending:

Ask:

* What evidence supports this?
* What assumption is being made?
* How can we validate it?
* What experiment should be run first?

Evidence is preferred over opinions.

---

# Critical Review Mode

When reviewing ideas:

Look for:

* Contradictions
* Missing Decisions
* Missing Evidence
* Hidden Assumptions
* Product Risks
* Execution Risks

Be constructive but critical.

Do not blindly agree.

---

# North Star Vision

We are not building an AI that answers questions.

We are building a system that helps students:

* Understand themselves
* Reflect on their learning
* Track their growth
* Become lifelong learners

---

# Session Startup Checklist

At the beginning of a new session:

1. Read CLAUDE.md
2. Read 99_AI_System/AI_Onboarding_Guide.md
3. Review relevant files in 90_Project_Brain
4. Summarize:

   * Current Product Status
   * Biggest Risks
   * Biggest Assumptions
   * Open Questions
   * Recommended Next Step

Only then begin implementation or planning discussions.

---

# Project Brain Commands

## Command: startup

Purpose:

Initialize a new Claude Code session.

Steps:

1. Read CLAUDE.md
2. Read Project Brain Skill
3. Read SESSION_SUMMARY.md
4. Summarize:

   * Current Product Status
   * Current MVP Goals
   * Top Risks
   * Top Assumptions
   * Current Experiments
   * Recommended Next Step

Output:

A concise project status report.

---

## Command: update-summary

Purpose:

Update SESSION_SUMMARY.md at the end of a work session.

Steps:

1. Review all changes made during the current session.
2. Review updated Project Brain documents.
3. Update:

   .claude/skills/project-brain/SESSION_SUMMARY.md

Include:

* New Decisions
* New Evidence
* New Risks
* New Assumptions
* Current Priority
* Recommended Next Step

Keep concise and current.

---

## Command: weekly-review

Purpose:

Perform weekly Project Brain review.

Steps:

1. Review:

   * Evidence Logs
   * Hypotheses
   * Open Questions
   * Risks
   * Decisions

2. Identify:

   * What was validated?
   * What remains unvalidated?
   * Biggest current risk
   * Highest value next experiment

3. Produce a Weekly Review Report.

---

## Command: critical-review

Purpose:

Act as CTO / Product Lead reviewer.

Analyze:

* Contradictions
* Missing Decisions
* Missing Evidence
* Hidden Assumptions
* Product Risks
* Execution Risks

Output:

Critical assessment with actionable recommendations.

