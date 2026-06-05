# Onboarding Experience Specification

Status

Planned

Version

1.0

Priority

High

---

# Purpose

Help students understand how to interact with AI Tutor.

Reduce uncertainty and interaction friction.

Increase confidence during the first learning session.

---

# Onboarding Goals

Students should understand that they can:

- Learn mathematics
    
- Ask questions
    
- Request help
    
- Talk naturally
    
- Use voice input
    
- Use Free Talk Mode
    

The onboarding experience should feel simple and welcoming.

---

# First Session Welcome

Example

```text
สวัสดี 😊

พี่ยินดีต้อนรับสู่ AI Tutor

พี่ช่วยสอนคณิตศาสตร์แบบทีละขั้นได้

และถ้าอยากคุยเล่นหรือเล่าอะไรให้ฟัง
ก็คุยกับพี่ได้เหมือนกัน
```

---

# Interaction Methods

The onboarding should explain:

## Text Input

Students may type naturally.

Examples

```text
หนูไม่เข้าใจ
```

```text
ช่วยเริ่มให้หน่อย
```

```text
ทำไมต้องทำแบบนี้
```

---

## Voice Input

Students may speak instead of typing.

Examples

```text
พี่ครับ ผมไม่เข้าใจข้อนี้
```

```text
ช่วยอธิบายใหม่ได้ไหม
```

```text
หนูตอบไม่ได้
```

Purpose

Reduce interaction effort.

Allow younger students to communicate naturally.

Support students who dislike typing.

---

# Free Talk Mode

Students may choose:

```text
📚 เรียนคณิตศาสตร์
```

or

```text
💬 คุยกับพี่ก่อน
```

Purpose

Reduce learning resistance.

Build familiarity and trust.

Create a welcoming learning environment.

---

# Voice Input Discovery Questions

Status

Unknown

Questions

- Do students use voice more than typing?
    
- Does voice increase lesson completion?
    
- Does voice increase return rate?
    
- Does voice reduce help-seeking friction?
    

---

# Voice Tracking Events

Track:

```text
VoiceInputStarted
```

Student begins voice interaction.

---

```text
VoiceInputSubmitted
```

Voice message submitted.

---

```text
VoiceToLesson
```

Voice interaction used during learning.

---

# Success Metrics

Measure:

```text
Voice Usage Rate
```

```text
Lesson Completion Rate
```

```text
Return Rate
```

```text
Sessions Per Student
```

```text
FreeTalk To Lesson Conversion Rate
```

---

# MVP Rule

Voice Input should be optional.

Students may freely choose:

- Typing
    
- Voice
    
- Free Talk
    
- Mathematics Learning
    

The goal is to reduce barriers to learning.

Not to increase complexity.

---

# Product Learning Principle

Students should not need to learn how to use AI Tutor.

AI Tutor should adapt to how students naturally communicate.

For many students,  
speaking may feel easier than typing.