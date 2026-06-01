# Demo_V1.10_UI_Improvements

Status: Approved

Version: Demo V1.10

Category: UI / UX Improvements

Priority: High

Source: User Testing Observation

Last Updated: 2026-06

---

# Purpose

เอกสารนี้รวบรวมรายการปรับปรุง UI/UX ที่ค้นพบจาก

- Demo Usage
    
- User Testing
    
- Product Review
    

---

# Important Note

เอกสารนี้

ไม่ใช่รายการ Feature ใหม่

แต่เป็นการปรับปรุง

```text
Learning Experience
```

ให้สอดคล้องกับหลักการ

```text
Teach, Don't Answer
```

และ

```text
Teaching Flow > AI Capability
```

---

# Scope

ปรับปรุงประสบการณ์การเรียนรู้

ใน 3 ช่วงสำคัญ

```text
Before Learning

↓

During Learning

↓

After Learning
```

---

# Learning Journey

```text
Before Learning
        ↓
UI-002 Empty State & Onboarding

During Learning
        ↓
UI-001 Sidebar Collapse

After Learning
        ↓
UI-003 Lesson Complete Experience
```

---

# UI-001

Sidebar Collapse

Priority: High

Status: Approved

---

# Problem

Sidebar เริ่มมีข้อมูลจำนวนมาก

เช่น

- ใช้ในชีวิตจริง
    
- บันทึกของหนู
    
- สรุปสำหรับผู้ปกครอง
    
- Feedback จาก AI Tutor
    
- ช่วยพัฒนา AI Tutor
    

---

ทุก Panel เปิดพร้อมกัน

ทำให้

- พื้นที่ไม่เพียงพอ
    
- ข้อมูลสำคัญถูกซ่อน
    
- ผู้ใช้ต้อง Scroll มาก
    

---

# Solution

เปลี่ยนเป็น

```text
Accordion / Collapse Panel
```

---

# Default State

```text
▼ ใช้ในชีวิตจริง

▼ บันทึกของหนู

▶ สรุปสำหรับผู้ปกครอง

▶ Feedback จาก AI Tutor

▶ ช่วยพัฒนา AI Tutor
```

---

# Expected Outcome

- ลดการใช้พื้นที่แนวตั้ง
    
- อ่านข้อมูลได้ง่ายขึ้น
    
- โฟกัสทีละส่วน
    

---

# Acceptance Criteria

- Expand / Collapse ได้
    
- ไม่กระทบ Learning Flow
    
- ข้อมูลยังเข้าถึงได้ครบ
    

---

# UI-002

Empty State & First-Time Onboarding

Priority: High

Status: Approved

---

# Background

Discovery #3

```text
Students Need Onboarding
```

นักเรียนบางคน

สับสนกับการใช้ระบบ

ก่อนสับสนกับคณิตศาสตร์

---

# Problem

เมื่อเริ่มบทเรียน

พื้นที่ Chat มีพื้นที่ว่าง

ผู้ใช้ไม่รู้ว่า

- ต้องพิมพ์อะไร
    
- ใช้ปุ่มไหน
    
- ขอความช่วยเหลืออย่างไร
    

---

# Solution

แสดง

```text
Empty State Learning Guide
```

ก่อนนักเรียนส่งข้อความแรก

---

# Example

```text
🤖 AI Tutor จะช่วยหนูคิดทีละขั้น

หนูสามารถ

💡 ขอคำใบ้
เมื่อไม่แน่ใจ

🆘 ช่วยเริ่มให้หน่อย
เมื่อไม่รู้จะเริ่มอย่างไร

👀 ทำตัวอย่างให้ดู
เมื่ออยากดูตัวอย่างคล้ายกัน

เป้าหมายของเรา
ไม่ใช่แค่หาคำตอบ

แต่คือการเข้าใจวิธีคิด 😊
```

---

# Display Rule

Show

```text
Student Message Count = 0
```

---

Hide

```text
After First Student Message
```

---

# Expected Outcome

- ลดความสับสน
    
- เพิ่มความมั่นใจ
    
- เริ่มใช้งานได้เร็วขึ้น
    

---

# Acceptance Criteria

- แสดงก่อนข้อความแรก
    
- ซ่อนหลังเริ่มบทสนทนา
    
- อธิบายปุ่มช่วยเหลือทั้ง 3 ปุ่ม
    

---

# UI-003

Lesson Complete Experience

Priority: Very High

Status: Approved

---

# Background

ปัจจุบัน

เมื่อเรียนจบ

บทเรียนจบลงทันที

---

แต่ระบบมีข้อมูลที่มีคุณค่า

เช่น

- บันทึกของหนู
    
- Feedback จาก AI Tutor
    
- สรุปสำหรับผู้ปกครอง
    
- ใช้ในชีวิตจริง
    

---

# Problem

Learning Loop ยังไม่สมบูรณ์

---

Current Flow

```text
เรียน

↓

ตอบคำถาม

↓

จบ
```

---

Desired Flow

```text
เรียน

↓

ตอบคำถาม

↓

Reflection

↓

Lesson Complete
```

---

# Solution

สร้าง

```text
🎉 Lesson Complete Screen
```

หลังจบบทเรียน

---

# Section 1

🎉 วันนี้หนูได้เรียนรู้อะไร

---

Example

```text
✓ ปริมาตรคืออะไร

✓ สูตร กว้าง × ยาว × สูง

✓ การแปลงหน่วยปริมาตร
```

---

# Section 2

📒 บันทึกของหนู

---

Example

```text
ปริมาตร = กว้าง × ยาว × สูง

1,000 ลบ.ซม. = 1 ลิตร
```

---

# Section 3

⭐ Feedback จาก AI Tutor

---

Example

```text
จุดเด่น

✓ คิดเป็นขั้นตอน

✓ ตอบคำถามต่อเนื่องได้ดี

สิ่งที่ควรฝึกเพิ่ม

• ตรวจสอบหน่วยก่อนตอบ
```

---

# Section 4

💡 ใช้ในชีวิตจริง

---

Example

```text
ใช้คำนวณ

- ตู้ปลา
- ถังเก็บน้ำ
- กล่องเก็บของ
```

---

# Section 5

👨‍👩‍👧 สรุปสำหรับผู้ปกครอง

---

Example

```text
วันนี้นักเรียนเข้าใจแนวคิดเรื่องปริมาตร

สามารถใช้สูตรได้ถูกต้อง

และเชื่อมโยงกับสถานการณ์จริงได้
```

---

# CTA

```text
📚 เรียนบทถัดไป

🔁 ทบทวนอีกครั้ง

🏠 กลับหน้าหลัก
```

---

# Expected Outcome

นักเรียนรู้สึกว่า

```text
วันนี้หนูได้เรียนรู้อะไรบางอย่าง
```

ไม่ใช่

```text
วันนี้หนูตอบคำถามครบแล้ว
```

---

# Product Principle

A Lesson Should End With Learning

Not With The Last Answer

---

# Implementation Priority

Priority 1

```text
UI-001 Sidebar Collapse
```

---

Priority 2

```text
UI-002 Empty State & Onboarding
```

---

Priority 3

```text
UI-003 Lesson Complete Experience
```

---

# Success Criteria

ผู้ใช้ใหม่

เข้าใจวิธีใช้งานได้ง่ายขึ้น

---

ข้อมูลใน Sidebar

อ่านได้ครบถ้วนมากขึ้น

---

บทเรียนจบด้วย Reflection

แทนการจบด้วยคำตอบสุดท้าย

---

# Final Reminder

การปรับปรุงทั้งหมดในเอกสารนี้

มุ่งเน้น

```text
Learning Experience
```

ไม่ใช่

```text
Adding Features
```

เพราะสำหรับ AI Tutor

```text
Teaching Flow > AI Capability
```