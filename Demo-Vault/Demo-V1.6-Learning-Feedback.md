# Demo V1.6

# Learning Feedback

## Purpose

เพิ่ม Feedback ที่มีความหมายต่อนักเรียนและผู้ปกครอง

หลังจากจบบทเรียน

โดยเน้น

- Growth Mindset
    
- Personalized Learning
    
- Parent Partnership
    

---

# Problem

ปัจจุบันระบบแสดง

- Student Note
    
- Parent Summary
    
- Real-world Learning
    
- Learning Reflection
    

แต่ยังไม่มีการสะท้อนผลการเรียนรู้เฉพาะบุคคล

นักเรียนยังไม่รู้ว่า

- ทำได้ดีอะไร
    
- ควรพัฒนาอะไร
    

ผู้ปกครองยังไม่รู้ว่า

- ควรช่วยอย่างไร
    

---

# Goal

เพิ่ม

```text
🌟 Learning Feedback
```

หลังจบบทเรียน

---

# UI

## New Card

ด้านขวา

```text
📒 บันทึกของหนู

👨‍👩‍👧 สรุปสำหรับผู้ปกครอง

💡 ใช้ในชีวิตจริง

🎉 วันนี้ได้เรียนรู้อะไร

🌟 Feedback จาก AI Tutor
```

---

# Student Feedback

## Example

🌟 Feedback จาก AI Tutor

วันนี้หนูทำได้ดีมาก

✅ เข้าใจแนวคิดเรื่องปริมาตร

✅ คำนวณทีละขั้นได้ถูกต้อง

✅ พยายามแก้ปัญหาด้วยตนเอง

สิ่งที่ควรฝึกเพิ่ม

• การคูณเลขหลายหลัก

• การตรวจคำตอบก่อนส่ง

Keep Going! 🚀

---

# Parent Coaching Tips

## Example

👨‍👩‍👧 ข้อเสนอแนะสำหรับผู้ปกครอง

วันนี้ลูกเข้าใจเรื่องปริมาตรได้ดี

สามารถคำนวณและแปลงหน่วยเป็นลิตรได้

กิจกรรมที่แนะนำ

- ลองชวนลูกคำนวณตู้ปลา
    
- ลองชวนลูกคำนวณถังน้ำ
    
- ลองถามว่าปริมาตรใช้ทำอะไรได้บ้าง
    

เป้าหมายคือการเชื่อมโยงคณิตศาสตร์กับชีวิตจริง

---

# Feedback Levels

## Excellent

เงื่อนไข

- ตอบถูกทุกขั้น
    
- ไม่ใช้ Hint
    

ตัวอย่าง

วันนี้หนูทำได้ยอดเยี่ยมมาก

เข้าใจแนวคิดและสามารถแก้โจทย์ได้ด้วยตนเอง

---

## Good

เงื่อนไข

- ใช้ Hint 1-2 ครั้ง
    

ตัวอย่าง

วันนี้หนูเข้าใจเนื้อหาได้ดี

มีการใช้ Hint บ้าง แต่ยังสามารถทำต่อได้ด้วยตนเอง

---

## Needs Practice

เงื่อนไข

- ใช้ Hint มากกว่า 3 ครั้ง
    
- ใช้ Help Me Start หลายครั้ง
    

ตัวอย่าง

วันนี้หนูพยายามได้ดีมาก

แนะนำให้ฝึกเรื่องการคำนวณเพิ่มเติม

แล้วจะเก่งขึ้นแน่นอน

---

# Data Model

```json
{
  "scenarioId": "fish-tank-volume",
  "hintCount": 2,
  "helpMeStartCount": 1,
  "correctAnswers": 4,
  "wrongAnswers": 1
}
```

---

# Feedback Rules

## Rule 1

Hint Count

```text
0
```

Excellent

---

## Rule 2

Hint Count

```text
1-2
```

Good

---

## Rule 3

Hint Count

```text
>= 3
```

Needs Practice

---

## Rule 4

Help Me Start

```text
>= 2
```

แนะนำให้ฝึกพื้นฐานเพิ่มเติม

---

# Design Principles

## Growth Mindset

ห้ามใช้คำว่า

- ไม่เก่ง
    
- อ่อน
    
- ล้มเหลว
    

ใช้

- พยายามได้ดี
    
- กำลังพัฒนา
    
- ฝึกเพิ่มอีกนิด
    

---

## Positive Reinforcement

เริ่มต้นด้วยสิ่งที่ทำได้ดีเสมอ

ก่อนเสนอสิ่งที่ควรพัฒนา

---

## Encourage Learning

Feedback ต้องส่งเสริมการเรียนรู้

ไม่ใช่การตัดสิน

---

# MVP Scope

ใช้ Rule-Based Feedback ก่อน

ยังไม่ต้องใช้ AI วิเคราะห์เชิงลึก

---

# Out of Scope

- Weakness Analysis
    
- Learning Analytics
    
- Adaptive Learning
    
- Achievement System
    
- Gamification
    

---

# Future Evolution

Learning Feedback

↓

Weakness Analysis

↓

Learning Pattern Detection

↓

Personalized Learning Plan

---

# Success Criteria

นักเรียนรู้ว่า

- วันนี้ทำได้ดีอะไร
    
- ควรฝึกอะไรต่อ
    

ผู้ปกครองรู้ว่า

- ลูกกำลังเรียนอะไร
    
- ควรช่วยอย่างไร
    

ระบบเริ่มสะท้อนการเรียนรู้เฉพาะบุคคลได้

---

# Related Documents

[[AI-Tutor-OnePage-v5]]

[[LearningFlowEngine]]

[[Demo-V1.5-Final-Polish]]

[[Parent-Summary]]

---

# Important Principle

Feedback คือส่วนหนึ่งของการสอน

ไม่ใช่เพียงรายงานผล

Teach → Practice → Reflect → Improve