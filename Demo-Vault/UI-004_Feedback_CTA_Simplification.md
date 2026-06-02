---

## status: approved  
version: Demo V1.10  
category: UI_UX  
priority: medium  
source: ux_review  
owner: Product  
last_updated: 2026-06

# UI-004 Feedback CTA Simplification

Status: Approved

Priority: Medium

Category: UX Polish

---

# Background

หลังจากปรับปรุง

```text
Lesson Complete Experience
```

พบว่าปัจจุบันมีข้อความเกี่ยวกับ Feedback ซ้ำซ้อน

---

Current UI

```text
🙏 ขอบคุณสำหรับ Feedback ครับ

ข้อมูลของคุณจะช่วยพัฒนาระบบให้ดีขึ้น

----------------

💬 ช่วยพัฒนา AI Tutor

[ ส่งความคิดเห็น ]
```

---

# Problem

ผู้ใช้ยังไม่ได้ส่ง Feedback

แต่ระบบแสดงข้อความ

```text
ขอบคุณสำหรับ Feedback
```

แล้ว

---

ตามด้วย

```text
ส่งความคิดเห็น
```

อีกครั้ง

---

อาจทำให้ผู้ใช้สับสนว่า

```text
ส่งแล้วหรือยัง?

ต้องส่งอีกหรือไม่?

สองส่วนนี้ต่างกันอย่างไร?
```

---

# Product Goal

ลดความซ้ำซ้อน

ทำให้ Feedback Flow ชัดเจน

และเข้าใจได้ทันที

---

# Design Principle

One Goal

One CTA

---

# Proposed Change

Remove

```text
🙏 ขอบคุณสำหรับ Feedback ครับ

ข้อมูลของคุณจะช่วยพัฒนาระบบให้ดีขึ้น
```

ทั้งหมด

---

Keep

```text
💬 ช่วยพัฒนา AI Tutor

ความคิดเห็นของคุณมีค่า

และจะช่วยให้ AI Tutor
ช่วยนักเรียนคนอื่นได้ดีขึ้น

[ ส่งความคิดเห็น ]
```

---

# New Layout

```text
👨‍👩‍👧 สรุปสำหรับผู้ปกครอง

----------------

💬 ช่วยพัฒนา AI Tutor

ความคิดเห็นของคุณมีค่า
และจะช่วยให้ AI Tutor
ช่วยนักเรียนคนอื่นได้ดีขึ้น

[ ส่งความคิดเห็น ]

----------------

📚 เรียนบทถัดไป

🔁 ทบทวนอีกครั้ง

🏠 กลับหน้าหลัก
```

---

# Optional Future Enhancement

After Feedback Submitted

Replace CTA With

```text
✅ ขอบคุณสำหรับความคิดเห็นครับ

ข้อมูลของคุณจะช่วยพัฒนา AI Tutor
ให้ช่วยนักเรียนได้ดียิ่งขึ้น
```

---

Only show after successful submission

---

# Out Of Scope

Demo V1.10

Do Not Add

```text
Multiple Feedback Sections

Feedback Rating System

Feedback Dashboard
```

---

Reason

Current Goal

```text
Collect Feedback
```

Not

```text
Manage Feedback
```

---

# Acceptance Criteria

- Remove "ขอบคุณสำหรับ Feedback" section before submission
    
- Keep only one Feedback CTA
    
- User clearly understands where to submit feedback
    
- No duplicate feedback messaging
    
- Layout remains clean and readable
    

---

# Success Criteria

Users understand immediately

```text
Where to provide feedback
```

without confusion

and Feedback CTA receives more engagement.

---

# Product Principle

Clear UX

Is Better Than

More UI