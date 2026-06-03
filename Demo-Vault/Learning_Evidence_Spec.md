# Learning Evidence Enhancement

Status

Planned

---

# Learning Friction Tracking

## Purpose

Identify where students stop learning.

The goal is not only to measure correctness.

The goal is to understand:

- Where students struggle
    
- Where students request help
    
- Where students abandon learning
    
- Why students fail to complete lessons
    

Learning friction may provide more value than correctness data.

---

## Events To Collect

### Session Started

Student begins a learning session.

### Step Started

Student enters a learning step.

### Step Completed

Student successfully completes a step.

### Hint Requested

Student requests a hint.

### Help Me Start Requested

Student requests guided assistance.

### Worked Example Requested

Student requests a worked example.

### Session Inactive

Student becomes inactive for a significant period.

### Session Abandoned

Student exits before lesson completion.

### Lesson Completed

Student completes the lesson.

---

## Discovery Questions

The system should help answer:

- Where do students stop?
    
- Which step has the highest abandonment rate?
    
- Which lesson has the highest abandonment rate?
    
- Which help option creates the most value?
    
- What prerequisite weaknesses appear repeatedly?
    

---

# Student Identity

## Purpose

Create a more personal learning experience.

The AI Tutor may use the student's preferred name during learning sessions.

Examples

- ภูมิ
    
- มิ้นท์
    
- ต้น
    

The preferred name should be used for communication only.

---

## Student Profile

Recommended Fields

```json
{
  "studentId": "uuid",
  "displayName": "ภูมิ",
  "gradeLevel": "ม.2"
}
```

---

## Important Principle

Product analytics should use:

- studentId
    

not displayName.

Display names are for relationship building.

Student IDs are for evidence analysis.

---

# Device Tracking

## Purpose

Identify returning users.

Measure repeat usage and learning continuity.

---

## Important Principle

Do not collect sensitive device identifiers.

Do not collect:

- IMEI
    
- Serial Number
    
- MAC Address
    

Use anonymous identifiers only.

---

## Recommended Fields

```json
{
  "deviceId": "uuid"
}
```

Store deviceId locally on the device.

Reuse it across sessions.

---

# Session Metadata

Recommended Fields

```json
{
  "sessionId": "uuid",
  "studentId": "uuid",
  "deviceId": "uuid",
  "lessonId": "volume_01",
  "startedAt": "...",
  "endedAt": "...",
  "completed": false
}
```

---

# Product Learning Principle

Correctness is important.

Learning behavior is more important.

Completion is important.

Learning friction is often more valuable.

Track not only what students answer.

Track how students learn.

Track where students stop learning.