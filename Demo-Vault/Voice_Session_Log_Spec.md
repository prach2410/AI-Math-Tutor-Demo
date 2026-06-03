# Voice Session Log Specification

## Purpose

This document defines how voice interactions should be recorded for evidence collection and hypothesis validation.

The goal is NOT analytics.

The goal is to understand:

- How students use voice
    
- When students choose voice
    
- What students say
    
- Whether voice improves participation
    
- Whether voice reveals misconceptions faster
    

Supports:

- H-04 Guided Assistance Ladder
    
- H-07 Prerequisite Gaps
    
- H-10 Interaction Preference
    

---

# Storage Location

Recommended:

```text
SessionLogs/
YYYY-MM-DD/
Session_{SessionId}.json
```

Example:

```text
SessionLogs/
2026-06-04/
Session_S001.json
```

---

# Session Metadata

Required fields:

```json
{
  "sessionId": "S001",
  "studentId": "anonymous",
  "scenarioId": "fish_tank_volume",
  "interactionMode": "voice",
  "startedAt": "2026-06-04T10:00:00Z",
  "endedAt": "2026-06-04T10:15:00Z",
  "completed": true
}
```

---

# Voice Interaction Events

Track every time voice is used.

```json
{
  "eventType": "voice_used",
  "timestamp": "2026-06-04T10:02:15Z",
  "step": 1
}
```

---

# Voice Message Log

Record the transcript after Speech-to-Text.

Example:

```json
{
  "messageId": "M001",
  "role": "student",
  "inputMode": "voice",
  "step": 1,
  "timestamp": "2026-06-04T10:02:15Z",
  "transcript": "ผมจำสูตรไม่ได้ครับ"
}
```

---

# AI Response Log

```json
{
  "messageId": "M002",
  "role": "assistant",
  "step": 1,
  "timestamp": "2026-06-04T10:02:18Z",
  "responseType": "guiding_question",
  "text": "ถ้ากล่องมีความกว้าง ยาว และสูง เราจะคำนวณอะไรได้บ้าง?"
}
```

---

# Guided Assistance Events

Record whenever a support tool is used.

---

## Hint

```json
{
  "eventType": "hint_clicked",
  "step": 1
}
```

---

## Help Me Start

```json
{
  "eventType": "help_me_start_clicked",
  "step": 1
}
```

---

## Worked Example

```json
{
  "eventType": "worked_example_clicked",
  "step": 2
}
```

---

## Show Solution

```json
{
  "eventType": "show_solution_clicked",
  "step": 3
}
```

---

# Voice Session Summary

Generated when session ends.

```json
{
  "sessionId": "S001",

  "interactionMode": "voice",

  "voiceMessages": 12,

  "textMessages": 0,

  "hintCount": 2,

  "helpMeStartCount": 1,

  "workedExampleCount": 0,

  "showSolutionCount": 0,

  "durationMinutes": 15,

  "completed": true
}
```

---

# Student Feedback

Optional but recommended.

```json
{
  "understanding": "better",

  "hardestPart": "units",

  "wouldUseAgain": true
}
```

---

# Evidence Signals

## Supports H-10

Voice Interaction Preference

Track:

- interactionMode
    
- voiceMessages
    
- durationMinutes
    
- completionRate
    

---

## Supports H-04

Guided Assistance Ladder

Track:

- hintCount
    
- helpMeStartCount
    
- workedExampleCount
    
- showSolutionCount
    

Important:

If showSolutionCount is high and occurs early in sessions,  
this may indicate failure of the ladder.

---

## Supports H-07

Prerequisite Gaps

Look for transcripts such as:

- "ผมคูณเลขไม่ได้"
    
- "ลืมสูตร"
    
- "ไม่เข้าใจหน่วย"
    

These are high-value evidence.

---

# MVP Recommendation

For MVP:

Required:

- Session Metadata
    
- Voice Transcript
    
- Guidance Events
    

Optional:

- Sentiment Analysis
    
- Emotion Detection
    
- Speech Analytics
    

Do not implement advanced analytics until real usage data exists.

---

# Product Principle

The purpose of voice logging is not surveillance.

The purpose is to understand how students think, struggle, and learn.

Better evidence leads to better teaching decisions.