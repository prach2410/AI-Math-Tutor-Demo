---
status: approved
version: Demo V1.10
category: Product Discovery
priority: high
source: learning_session_analysis
owner: Product
last_updated: 2026-06
---

# UX-005 Validated Learning Signals

Status: Approved

Priority: High

Category: Product Discovery

---

# Background

หลังจากวิเคราะห์ Learning Session Logs

พบสัญญาณสำคัญที่สนับสนุนสมมติฐานหลักของ AI Tutor

---

Analyzed Sessions

2

Status

Initial Validation

---

# Observation #1

Help Me Start Creates Value

---

Evidence

นักเรียนไม่สามารถเริ่มตอบได้

เลือก

🆘 ช่วยเริ่มให้หน่อย

จากนั้นสามารถเรียนต่อและจบบทเรียนได้

---

Discovery Supported

Discovery #2

Hint Alone Is Not Enough

Students Need Help Me Start

---

Conclusion

Help Me Start

ไม่ใช่ Feature เสริม

แต่เป็น Core Teaching Action

---

Product Decision

Keep

🆘 ช่วยเริ่มให้หน่อย

as a permanent feature

---

Future Requirement

Track

help_me_start_clicked

in all learning sessions

---

# Observation #2

Worked Example Creates Value

---

Evidence

นักเรียนเลือก

👀 ทำตัวอย่างให้ดู

ก่อนตอบคำถามจริง

และสามารถทำบทเรียนจนจบได้

---

Conclusion

Worked Example

เป็น Learning Strategy

ไม่ใช่เพียง Convenience Feature

---

Product Decision

Keep

👀 ทำตัวอย่างให้ดู

as a permanent feature

---

Future Requirement

Track

example_clicked

in all learning sessions

---

# Observation #3

Students May Struggle With Prerequisite Skills

---

Evidence

โจทย์หลักคือ

ปริมาตรทรงสี่เหลี่ยมมุมฉาก

แต่ความผิดพลาดเกิดขึ้นที่

20 × 40

800 × 30

มากกว่าความเข้าใจเรื่องปริมาตร

---

Important Insight

Student failed arithmetic

Not volume concept

---

Conclusion

AI Tutor should identify

Root Cause

instead of only marking answers as wrong

---

Future Direction

Student State Model

should distinguish

- Concept misunderstanding
- Arithmetic mistake
- Reading mistake
- Careless mistake

---

Current Action

Store as future design direction

Do not expand MVP yet

---

Reason

Need more session data

before implementing diagnosis engine

---

# Product Impact

Validated Signals

✅ Help Me Start

✅ Worked Example

✅ Scaffolding

Emerging Signal

🟡 Root Cause Detection

Needs More Evidence

---

# Acceptance Criteria

- Help Me Start remains visible
- Worked Example remains visible
- Session logs continue collecting usage
- example_clicked tracked correctly
- help_me_start_clicked tracked correctly

---

# Technical Note

Bug Found

example_clicked event exists

but

summary.exampleUsed = 0

---

Developer should fix summary aggregation logic

Expected

example_clicked

↓

exampleUsed += 1

---

# Product Principle

Teach, Don't Answer

Support Student Thinking

Before Giving Answers