---

## status: approved  
version: Demo V1.10  
category: UI_UX  
priority: very_high  
source: product_design  
owner: Product  
last_updated: 2026-06

# UI-003 Lesson Complete Experience

Status: Approved

Priority: Very High

Category: Learning Experience

---

# Background

ปัจจุบัน AI Tutor มีประสบการณ์ที่ดีในช่วง

```text
Before Learning
```

และ

```text
During Learning
```

แล้ว

---

แต่หลังจากนักเรียนตอบคำถามครบ

ระบบยังไม่มี

```text
After Learning Experience
```

ที่ชัดเจน

---

Current Flow

```text
Question

↓

Conversation

↓

Answer

↓

End
```

---

ปัญหา

นักเรียนอาจรู้สึกว่า

```text
ทำโจทย์เสร็จแล้ว
```

แต่ไม่รู้ว่า

```text
วันนี้ได้เรียนรู้อะไร
```

---

# Product Goal

เปลี่ยน

```text
End Of Conversation
```

ให้กลายเป็น

```text
End Of Learning Session
```

---

# Core Principle

A Lesson Should End With Learning

Not With The Last Answer

---

# Learning Objectives

เมื่อเรียนจบ

นักเรียนควรตอบได้ว่า

---

Question 1

```text
วันนี้หนูได้เรียนรู้อะไร?
```

---

Question 2

```text
หนูทำได้ดีตรงไหน?
```

---

Question 3

```text
ความรู้นี้ใช้ทำอะไรได้?
```

---

# Trigger Condition

แสดง Lesson Complete Screen เมื่อ

```text
Current Lesson Status = Completed
```

---

# Screen Structure

## Section 1

Celebration

---

Title

```text
🎉 เยี่ยมมาก!
```

---

Subtitle

```text
หนูเรียนจบบทนี้แล้ว
```

---

Purpose

สร้างความรู้สึกสำเร็จ

โดยไม่ใช้คะแนน

---

# Section 2

📚 วันนี้หนูได้เรียนรู้อะไร

Priority: Highest

---

Example

```text
✓ ปริมาตรคืออะไร

✓ สูตร กว้าง × ยาว × สูง

✓ วิธีคำนวณปริมาตร

✓ การแปลงหน่วยปริมาตร
```

---

Purpose

ช่วยให้นักเรียนตระหนักถึงสิ่งที่เรียนรู้

---

# Section 3

📒 บันทึกของหนู

---

Source

ดึงจาก

```text
Learning Notes
```

ที่สร้างระหว่างบทเรียน

---

Example

```text
สิ่งที่ต้องจำ

ปริมาตร = กว้าง × ยาว × สูง

1,000 ลบ.ซม. = 1 ลิตร
```

---

Purpose

สร้าง Personal Learning Notes

---

# Section 4

⭐ Feedback จาก AI Tutor

---

แบ่งเป็น 2 ส่วน

---

## จุดที่หนูทำได้ดี

Example

```text
✓ คิดเป็นขั้นตอน

✓ พยายามตอบด้วยตัวเอง

✓ ตอบคำถามต่อเนื่องได้ดี
```

---

## ครั้งหน้าลองฝึกเพิ่ม

Example

```text
🌱 ตรวจสอบหน่วยก่อนตอบ

🌱 อ่านโจทย์ให้ครบทุกบรรทัด
```

---

Important

ห้ามใช้คำว่า

```text
จุดอ่อน
```

---

ใช้

```text
ครั้งหน้าลองฝึกเพิ่ม
```

แทน

---

Purpose

ส่งเสริม Growth Mindset

---

# Section 5

💡 ใช้ในชีวิตจริง

---

Example

```text
ความรู้เรื่องปริมาตร

สามารถใช้คำนวณ

• ตู้ปลา

• ถังเก็บน้ำ

• กล่องเก็บของ
```

---

Purpose

Transfer Learning

---

# Section 6

👨‍👩‍👧 สรุปสำหรับผู้ปกครอง

---

Default State

```text
Collapsed
```

---

Example

```text
วันนี้นักเรียนเข้าใจแนวคิดเรื่องปริมาตร

สามารถใช้สูตรได้ถูกต้อง

และเชื่อมโยงกับสถานการณ์จริงได้
```

---

Purpose

Parent Partnership

---

# Call To Action

Bottom Section

---

Primary CTA

```text
📚 เรียนบทถัดไป
```

---

Secondary CTA

```text
🔁 ทบทวนอีกครั้ง
```

---

Tertiary CTA

```text
🏠 กลับหน้าหลัก
```

---

# Explicitly Out Of Scope

Version Demo V1.10

---

Do Not Add

```text
คะแนน

เปอร์เซ็นต์

เกรด

Leaderboard

Badges

Achievements

XP

Coins
```

---

Reason

Current Focus

```text
Learning Progress
```

Not

```text
Performance Scoring
```

---

# UX Requirements

นักเรียนต้องรู้สึกว่า

```text
วันนี้หนูได้เรียนรู้อะไรบางอย่าง
```

ไม่ใช่

```text
วันนี้หนูตอบคำถามครบแล้ว
```

---

# Acceptance Criteria

- มี Lesson Complete Screen
    
- แสดงหลังจบบทเรียน
    
- มี Reflection Component
    
- มี Learning Notes
    
- มี AI Feedback
    
- มี Real-world Connection
    
- มี Parent Summary
    
- ไม่มีระบบคะแนน
    
- ไม่มีระบบแข่งขัน
    

---

# Success Criteria

Student Feedback

```text
หนูเข้าใจมากขึ้น
```

---

Parent Feedback

```text
ฉันเห็นว่าลูกเรียนรู้อะไร
```

---

Teacher Feedback

```text
ระบบช่วยปิดวงจรการเรียนรู้ได้ดี
```

---

# Product Principle

Teach, Don't Answer

Teaching Flow > AI Capability

Learning Outcome > Correct Answer