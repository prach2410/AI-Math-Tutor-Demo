---

## status: approved  
version: Demo V1.10  
category: Testing  
priority: high  
source: discovery_validation  
owner: Product  
last_updated: 2026-06

# Parent Feedback Collection

Status: Approved

Priority: High

Category: User Testing

Related Discovery

```text
Parent Summary Creates Value
```

---

# Background

AI Tutor มี

```text
👨‍👩‍👧 สรุปสำหรับผู้ปกครอง
```

เป็นส่วนสำคัญของ Learning Experience

---

อย่างไรก็ตาม

ปัจจุบันยังไม่มีข้อมูลเพียงพอที่จะยืนยันว่า

```text
Parent Summary
```

มีคุณค่าต่อผู้ปกครองจริงหรือไม่

---

# Goal

เก็บ Feedback จากผู้ปกครอง

เพื่อใช้ตอบคำถาม

```text
ผู้ปกครองเข้าใจสิ่งที่ลูกเรียนมากขึ้นหรือไม่?

Parent Summary มีคุณค่าหรือไม่?

ควรพัฒนาต่อหรือไม่?
```

---

# Product Principle

Validate Discovery

Before Building Features

---

# Recommended UX

Placement

ใต้

```text
👨‍👩‍👧 สรุปสำหรับผู้ปกครอง
```

---

# Question 1

Usefulness

---

Question

```text
สรุปนี้ช่วยให้คุณเข้าใจสิ่งที่ลูกเรียนมากขึ้นหรือไม่?
```

---

Options

```text
😊 เข้าใจมากขึ้น

😐 พอเข้าใจ

😕 ยังไม่ค่อยเข้าใจ
```

---

Required

```text
Yes
```

---

# Question 2

Parent Value

---

Question

```text
ส่วนไหนมีประโยชน์มากที่สุด?
```

---

Options

```text
สิ่งที่ลูกเรียนรู้

จุดที่ลูกทำได้ดี

สิ่งที่ควรฝึกเพิ่ม

การเชื่อมโยงกับชีวิตจริง

ทั้งหมดมีประโยชน์
```

---

Required

```text
No
```

---

# Question 3

Optional Comment

---

Question

```text
มีอะไรที่อยากเห็นเพิ่มเติมไหม?
```

---

Type

```text
Textarea
```

---

Required

```text
No
```

---

# Event Logging

## Summary Opened

```json
{
  "type": "parent_summary_opened",
  "timestamp": "..."
}
```

---

## Feedback Started

```json
{
  "type": "parent_feedback_started",
  "timestamp": "..."
}
```

---

## Feedback Submitted

```json
{
  "type": "parent_feedback_submitted",
  "timestamp": "..."
}
```

---

# Session Structure

Add

```json
{
  "parentFeedback": {
    "summaryOpened": true,
    "summaryOpenedAt": "...",

    "feedbackSubmitted": true,
    "feedbackSubmittedAt": "...",

    "understandingLevel": "more_understanding",

    "mostValuableSection": "learning_outcomes",

    "comment": "เข้าใจมากขึ้นว่าลูกเรียนอะไร"
  }
}
```

---

# Allowed Values

## understandingLevel

```text
more_understanding

somewhat_understanding

still_unclear
```

---

## mostValuableSection

```text
learning_outcomes

strengths

improvements

real_world_connection

all_sections
```

---

# API Model

ParentFeedbackDto

```json
{
  "sessionId": "uuid",
  "understandingLevel": "more_understanding",
  "mostValuableSection": "all_sections",
  "comment": "..."
}
```

---

# Analysis Examples

Question

```text
Parent Summary ถูกเปิดกี่ครั้ง?
```

Use

```text
parent_summary_opened
```

---

Question

```text
ผู้ปกครองเห็นคุณค่าหรือไม่?
```

Use

```text
understandingLevel
```

---

Question

```text
ส่วนไหนมีคุณค่าที่สุด?
```

Use

```text
mostValuableSection
```

---

# Success Criteria

After 20-50 Sessions

สามารถตอบได้ว่า

```text
Parent Summary Creates Value
```

เป็น

```text
Validated

Partially Validated

Rejected
```

---

# Explicitly Out Of Scope

Demo V1.10

Do Not Build

```text
Parent Account

Parent Dashboard

Weekly Email Reports

Notifications

Progress Tracking
```

---

Reason

Current Goal

```text
Discovery Validation
```

Not

```text
Parent Platform
```

---

# Acceptance Criteria

- Parent Summary Open Event Logged
    
- Parent Feedback Submitted Event Logged
    
- Understanding Level Stored
    
- Most Valuable Section Stored
    
- Optional Comment Stored
    
- Linked To Learning Session
    
- Stored On Server
    

---

# Product Principle

Parent Summary

Should Help Parents

Understand Learning

Not Monitor Performance