# Demo V1.0 Mobile Navigation Improvement

## Purpose

ปรับเมนูให้สั้น กระชับ และเหมาะกับการใช้งานบนมือถือ

---

# Current

```text
หน้าแรก
เรียนคณิต
เกี่ยวกับโครงการ
ส่งความคิดเห็น
```

---

# Recommended

```text
🏠 หน้าแรก

📚 เรียน

ℹ️ เกี่ยวกับ

💬 ความคิดเห็น
```

---

# Alternative

## Option A (Recommended)

```text
🏠 หน้าแรก

📚 เรียน

ℹ️ เกี่ยวกับ

💬 ความคิดเห็น
```

ข้อดี

- สั้น
    
- อ่านง่าย
    
- เหมาะกับมือถือ
    
- ใช้พื้นที่น้อย
    

---

## Option B

```text
📚 เรียน

📒 บันทึก

ℹ️ เกี่ยวกับ

💬 ความคิดเห็น
```

เหมาะเมื่อมี Student Note แยกหน้า

---

# About Page Title

เปลี่ยนจาก

```text
เกี่ยวกับโครงการ
```

เป็น

```text
เกี่ยวกับ
```

---

# Feedback Button

เปลี่ยนจาก

```text
ส่งความคิดเห็น
```

เป็น

```text
ความคิดเห็น
```

เมื่อกด

เปิด Google Forms

---

# Mobile Design Principle

ใช้คำไม่เกิน 2-3 คำต่อเมนู

หลีกเลี่ยง

- เกี่ยวกับโครงการ
    
- ส่งความคิดเห็นเกี่ยวกับระบบ
    
- ข้อมูลสำหรับผู้ปกครอง
    

เพราะยาวเกินไปบนมือถือ

---

# Implementation Tasks

## Navigation

Update menu labels

```typescript
Home      => หน้าแรก
Learn     => เรียน
About     => เกี่ยวกับ
Feedback  => ความคิดเห็น
```

---

## About Button

Current

```text
เกี่ยวกับโครงการ
```

New

```text
ℹ️ เกี่ยวกับ
```

---

## Feedback Button

Current

```text
ส่งความคิดเห็น
```

New

```text
💬 ความคิดเห็น
```

---

# Success Criteria

- เมนูไม่ล้นบน Mobile
    
- อ่านง่าย
    
- ใช้งานได้ด้วยมือเดียว
    
- สอดคล้องกับแนวทาง Mobile First