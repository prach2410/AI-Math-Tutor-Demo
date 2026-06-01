---

## status: approved  
version: Demo V1.10  
category: UI_UX  
priority: high  
source: product_review  
owner: Product  
last_updated: 2026-06

# Demo_V1.10_Next_UI_Improvements

Status: Approved

Priority: High

---

# Background

หลังจากปรับปรุง

- UI-001 Sidebar Collapse
    
- UI-002 Empty State & Onboarding
    

พบว่า Learning Experience ดีขึ้นอย่างชัดเจน

อย่างไรก็ตาม ยังมีจุดที่สามารถปรับปรุงได้เพิ่มเติมเพื่อให้ AI Tutor มีความเป็น "Tutor" มากกว่า "Chat Application"

---

# Priority 1

UI-003 Lesson Complete Experience

Priority: Very High

Status: Ready For Implementation

---

# Problem

ปัจจุบันเมื่อบทเรียนจบ

ระบบจบที่คำตอบสุดท้าย

---

Current Flow

```text
Question

↓

Answer

↓

End
```

---

แต่ AI Tutor มีข้อมูลที่มีคุณค่าอยู่แล้ว

- บันทึกของหนู
    
- Feedback จาก AI Tutor
    
- ใช้ในชีวิตจริง
    
- สรุปสำหรับผู้ปกครอง
    

---

ข้อมูลเหล่านี้ควรถูกนำเสนอเป็น

```text
Lesson Complete Experience
```

---

# Solution

หลังจบบทเรียน

แสดง Summary Screen

---

Sections

```text
🎉 วันนี้หนูได้เรียนรู้อะไร

📒 บันทึกของหนู

⭐ Feedback จาก AI Tutor

💡 ใช้ในชีวิตจริง

👨‍👩‍👧 สรุปสำหรับผู้ปกครอง
```

---

# CTA

```text
📚 เรียนบทถัดไป

🔁 ทบทวนอีกครั้ง

🏠 กลับหน้าหลัก
```

---

# Product Principle

A Lesson Should End With Learning

Not With The Last Answer

---

# Acceptance Criteria

- มี Summary Screen หลังเรียนจบ
    
- ดึงข้อมูลจาก Sidebar มาแสดงรวม
    
- มี Reflection Feeling
    
- แสดง Learning Outcome ชัดเจน
    

---

# Priority 2

Improve Help Action Cards

Priority: High

Status: Ready For Implementation

---

# Problem

Cards

```text
💡 ขอคำใบ้

🆘 ช่วยเริ่มให้หน่อย

👀 ทำตัวอย่างให้ดู
```

มีลักษณะคล้ายข้อความ

ผู้ใช้ใหม่อาจไม่เข้าใจว่า

```text
สามารถกดได้
```

---

# Solution

เพิ่ม Visual Affordance

---

# UI Requirements

Cards ต้องมี

```text
cursor: pointer
```

---

Hover State

```text
background change
subtle shadow
border highlight
```

---

Click State

```text
pressed effect
```

---

Optional

เพิ่มข้อความ

```text
แตะเพื่อใช้งาน
```

หรือ

Arrow Icon

```text
→
```

---

# Expected Outcome

ผู้ใช้เข้าใจทันทีว่า

```text
เป็นปุ่ม
```

ไม่ใช่ข้อความอธิบาย

---

# Acceptance Criteria

- Hover Effect
    
- Pointer Cursor
    
- Click Feedback
    
- Mobile Friendly
    

---

# Priority 3

Reduce Empty State Height

Priority: Medium

Status: Ready For Implementation

---

# Problem

Empty State ปัจจุบันใช้พื้นที่แนวตั้งมาก

โดยเฉพาะบนหน้าจอขนาดเล็ก

---

Current Goal

```text
Onboarding
```

ไม่ใช่

```text
Hero Section
```

---

# Solution

ลดความสูงประมาณ

```text
30% - 40%
```

จากปัจจุบัน

---

# Recommended Content

```text
🤖 AI Tutor จะช่วยหนูคิดทีละขั้น

💡 ขอคำใบ้
เมื่อไม่แน่ใจ

🆘 ช่วยเริ่มให้หน่อย
เมื่อไม่รู้จะเริ่มอย่างไร

👀 ทำตัวอย่างให้ดู
เมื่ออยากดูตัวอย่างคล้ายกัน

😊 เป้าหมายคือการเข้าใจวิธีคิด
```

---

# Layout Requirements

- ลด Padding แนวตั้ง
    
- ลด Margin ระหว่าง Cards
    
- ลดพื้นที่ Empty Space
    

---

# Expected Outcome

แสดงโจทย์ได้เร็วขึ้น

เพิ่มพื้นที่สำหรับบทสนทนา

---

# Acceptance Criteria

- ความสูงลดลงอย่างเห็นได้ชัด
    
- ยังอ่านง่าย
    
- ยังอธิบายการใช้งานได้ครบ
    

---

# Implementation Order

Phase 1

```text
UI-003 Lesson Complete Experience
```

---

Phase 2

```text
Improve Help Action Cards
```

---

Phase 3

```text
Reduce Empty State Height
```

---

# Success Criteria

ผู้ใช้รู้สึกว่า

```text
กำลังเรียนอยู่กับ Tutor
```

ไม่ใช่

```text
กำลังคุยกับ Chatbot
```

---

# Product Principle

Teach, Don't Answer

Teaching Flow > AI Capability