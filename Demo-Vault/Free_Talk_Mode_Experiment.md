# Free Talk Mode Specification

Status

Experimental

Version

1.0

Priority

Medium

---

# Purpose

Reduce resistance to using AI Tutor.

Some students may initially use AI Tutor because:

- Parents encourage them.
    
- Teachers require them.
    
- They do not yet see learning value.
    

Free Talk Mode provides a low-pressure entry point  
before beginning a learning session.

---

# Product Hypothesis

Students may be more willing to engage with AI Tutor  
if they can first interact socially.

A short conversation may help:

- Build familiarity
    
- Build trust
    
- Reduce learning anxiety
    
- Increase willingness to begin lessons
    

---

# Scope

Free Talk Mode is not therapy.

Free Talk Mode is not mental health counseling.

Free Talk Mode is not professional advice.

The purpose is:

- Friendly conversation
    
- Emotional support
    
- Encouragement
    
- Relationship building
    

---

# User Experience

Students may choose:

```text
📚 Learn Mathematics

💬 Talk With Tutor
```

---

# Tutor Persona

The AI should behave like:

```text
Friendly older sibling

Supportive tutor

Encouraging learning companion
```

The AI should not behave like:

```text
Therapist

Psychologist

Medical advisor

Parent substitute
```

---

# Example Conversation

Student

```text
วันนี้เหนื่อยมาก
```

AI

```text
ฟังดูเป็นวันที่หนักพอสมควรเลยนะ

มีอะไรเกิดขึ้นที่โรงเรียนหรือเปล่า
อยากเล่าให้พี่ฟังไหม
```

---

Student

```text
โดนการบ้านเยอะ
```

AI

```text
เข้าใจเลย

บางวันการบ้านหลายวิชาก็ทำให้เหนื่อยได้

วันนี้อยากคุยเล่นก่อน
หรืออยากลองทำโจทย์ง่าย ๆ สักข้อดี
```

---

# Transition To Learning

The AI may gently encourage learning.

Examples

```text
อยากลองโจทย์ง่าย ๆ ก่อนไหม
```

```text
พี่ช่วยเริ่มให้ได้ถ้ารู้สึกยากนะ
```

```text
วันนี้เรียนแค่ 1 ข้อก็ได้
```

The AI should never pressure students.

---

# Learning Events

Track:

```text
FreeTalkStarted
```

Student begins free talk mode.

---

```text
FreeTalkEnded
```

Student leaves free talk mode.

---

```text
FreeTalkToLesson
```

Student starts a lesson after free talk.

---

# Discovery Questions

Can free talk reduce resistance to learning?

Do students start lessons more often  
after free talk conversations?

Do students return more frequently?

Does free talk increase completion rates?

---

# Success Metrics

Measure:

```text
FreeTalk Usage Rate
```

```text
FreeTalk To Lesson Conversion Rate
```

```text
Lesson Completion Rate
```

```text
Student Return Rate
```

```text
Sessions Per Student
```

---

# Risks

Students may use free talk  
without participating in lessons.

Students may expect emotional support  
outside the intended scope.

Students may avoid learning activities.

---

# MVP Rule

Keep free talk simple.

Do not add:

- Therapy features
    
- Mental health diagnosis
    
- Emotional profiling
    
- Complex memory systems
    

Focus on:

- Friendly conversation
    
- Encouragement
    
- Transition to learning
    

---

# Product Learning Principle

The goal is not to maximize conversation.

The goal is to help students feel comfortable  
starting and continuing learning.

---
# Free Talk Access During Learning

Status

Planned

---

# Purpose

Allow students to enter Free Talk Mode at any time  
without turning Free Talk into an escape from learning.

Free Talk should support learning continuity.

It should not replace learning.

---

# Access Rule

Students may enter Free Talk Mode:

- Before starting a lesson
    
- During a lesson
    
- After completing a lesson
    
- After getting stuck
    
- After feeling tired or frustrated
    

---

# Core Principle

Free Talk is a learning support space.

It is not the final destination of the product.

The goal is to help students feel safe enough  
to return to learning.

---

# In-Lesson Free Talk

When Free Talk is opened during a lesson,  
the AI should remember:

- Current lesson
    
- Current step
    
- Last question
    
- Student progress
    
- Help already used
    

The AI should not discard the learning context.

---

# Example

Student enters Free Talk during a lesson.

Student

```text
หนูไม่อยากทำแล้ว
```

AI

```text
ไม่เป็นไรเลย พักคุยกันก่อนได้ 😊

โจทย์ข้อนี้ทำให้รู้สึกยังไงบ้าง

ยาก เบื่อ หรือเหนื่อยจากอย่างอื่น?
```

After short support:

```text
ถ้าพร้อมแล้ว พี่ช่วยเริ่มข้อนี้ให้ได้นะ

หรือวันนี้เราทำแค่ 1 ขั้นตอนก็พอ
```

---

# Transition Back To Learning

The AI should gently offer a return path.

Examples:

```text
กลับไปทำต่อด้วยกันไหม
```

```text
พี่ช่วยเริ่มจากขั้นแรกให้ได้
```

```text
เราทำแค่ข้อเดียวก็พอวันนี้
```

The AI should not pressure the student.

---

# Events To Track

Track:

```text
FreeTalkEntered
```

Student enters Free Talk Mode.

---

```text
FreeTalkEnteredDuringLesson
```

Student enters Free Talk while a lesson is active.

---

```text
FreeTalkExited
```

Student exits Free Talk Mode.

---

```text
FreeTalkReturnedToLesson
```

Student returns to lesson after Free Talk.

---

```text
FreeTalkAbandonedLesson
```

Student enters Free Talk and does not return to lesson.

---

# Metrics

Measure:

```text
Free Talk Usage Rate
```

```text
In-Lesson Free Talk Rate
```

```text
Free Talk To Lesson Return Rate
```

```text
Free Talk Abandonment Rate
```

```text
Lesson Completion After Free Talk
```

---

# Discovery Questions

Does Free Talk help students return to learning?

Do students use Free Talk when they are stuck?

Do students use Free Talk to avoid learning?

Does Free Talk increase completion rate?

Does Free Talk increase return rate?

---

# Risk

Free Talk may become a learning escape.

Warning Signal:

```text
High Free Talk Usage
Low Free Talk Returned To Lesson Rate
```

If this happens,  
review the Free Talk design before expanding it.

---

# MVP Rule

Keep Free Talk lightweight.

Do not turn it into:

- AI Therapist
    
- Full emotional coaching system
    
- General-purpose chatbot
    
- Entertainment mode
    

Free Talk exists to support learning readiness.