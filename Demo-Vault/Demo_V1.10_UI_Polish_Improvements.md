---

## status: approved  
version: Demo V1.10  
category: UI_UX  
priority: medium  
source: product_review  
owner: Product  
last_updated: 2026-06

# Demo_V1.10_UI_Polish_Improvements

Status: Approved

Priority: Medium

Purpose:

ปรับปรุงรายละเอียด UI เพื่อให้ AI Tutor มีความรู้สึกเป็น

```text
Tutor
```

มากกว่า

```text
Application
```

---

# Background

หลังจากปรับ

- Sidebar Collapse
    
- Empty State Onboarding
    

พบว่า User Experience ดีขึ้นมาก

อย่างไรก็ตาม ยังมีรายละเอียดเล็กน้อยที่ช่วยเพิ่มความเป็น

```text
Learning Companion
```

ได้อีก

---

# UI-POLISH-001

Use Teacher Voice Instead Of System Voice

Priority: Medium

Status: Ready

---

# Current Text

```text
หนูสามารถกดปุ่มด้านล่างได้เลย
```

---

# Problem

ลักษณะข้อความเหมือน

```text
System Instruction
```

มากกว่า

```text
Teacher Guidance
```

---

# Goal

ทำให้ AI Tutor มีบุคลิกเป็น

```text
Friendly Teacher
```

---

# Recommended Copy

Option A

```text
😊 ถ้ายังไม่แน่ใจ ไม่เป็นไรนะ

AI Tutor จะช่วยหนูคิดทีละขั้น
```

---

Option B

```text
😊 ติดตรงไหนก็ขอความช่วยเหลือได้เลย
```

---

Option C

```text
😊 ไม่จำเป็นต้องตอบถูกทันที

ค่อย ๆ คิดไปด้วยกันนะ
```

---

# Acceptance Criteria

- ภาษาดูเป็นครู
    
- ลดความเป็น System
    
- เหมาะสำหรับนักเรียน ม.2
    

---

# UI-POLISH-002

Convert Help Cards To Information Cards

Priority: Medium

Status: Ready

---

# Current State

Cards มีลักษณะคล้าย Button

```text
💡 ขอคำใบ้

🆘 ช่วยเริ่มให้หน่อย

👀 ทำตัวอย่างให้ดู
```

---

แต่จริง ๆ แล้ว

Card เหล่านี้ไม่ได้กดได้

Action จริงอยู่ที่ปุ่มด้านล่าง

---

# Problem

ผู้ใช้ใหม่อาจเข้าใจผิดว่า

Card สามารถกดได้

---

# Goal

ทำให้ Card เป็น

```text
Information Card
```

อย่างชัดเจน

---

# Recommended Content

---

## Card 1

```text
💡 ขอคำใบ้

ช่วยบอกแนวทาง
โดยไม่เฉลยคำตอบ
```

---

## Card 2

```text
🆘 ช่วยเริ่มให้หน่อย

เหมาะเมื่อไม่รู้ว่าจะเริ่มตรงไหน
```

---

## Card 3

```text
👀 ทำตัวอย่างให้ดู

เมื่ออยากดูตัวอย่างคล้ายกัน
```

---

# Visual Changes

- ลดความรู้สึกเหมือน Button
    
- ใช้สีพื้นแบบ Information Panel
    
- ไม่มี Hover Effect
    
- ไม่มี Pointer Cursor
    

---

# Acceptance Criteria

- ผู้ใช้เข้าใจว่าเป็นคำอธิบาย
    
- ไม่สับสนกับปุ่มจริงด้านล่าง
    

---

# UI-POLISH-003

Keep Chat Space Open

Priority: Low

Status: Approved

---

# Observation

หลังปรับ Empty State

พื้นที่ว่างใน Chat ยังมีอยู่

---

# Decision

ไม่ต้องเพิ่ม Content เพิ่มเติม

---

# Reason

พื้นที่ว่างช่วยเรื่อง

```text
Focus
```

และ

```text
Readability
```

---

# Product Principle

Chat Area

ควรเป็นพื้นที่สำหรับ

```text
Learning Conversation
```

ไม่ใช่พื้นที่สำหรับ

```text
Marketing Content
```

---

# Acceptance Criteria

- ไม่เพิ่ม Banner ใหม่
    
- ไม่เพิ่ม Widget ใหม่
    
- รักษาความเรียบง่าย
    

---

# Product Principle

Small UI Changes

Should Reinforce

```text
Teach, Don't Answer
```

Every Element

Should Feel Like

```text
A Helpful Teacher
```

Not

```text
A Software System
```