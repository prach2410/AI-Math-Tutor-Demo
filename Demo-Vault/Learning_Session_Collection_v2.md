---

## status: approved  
version: Demo V1.10  
category: Testing  
priority: high  
source: architecture_revision  
owner: Product  
last_updated: 2026-06

# Learning Session Collection v2

Status: Approved

Priority: High

Category: User Testing

Supersedes

```text
Learning_Session_Log.md

Export_Learning_Logs.md
```

---

# Background

Version ก่อนหน้า

ใช้แนวคิด

```text
localStorage

↓

Developer Download JSON
```

---

หลังจากทบทวน

พบว่าแนวทางดังกล่าวเหมาะกับ

```text
Local Testing
```

เท่านั้น

---

แต่ Demo V1.10

มีเป้าหมาย

```text
Online User Testing
```

---

ดังนั้น

Learning Session Logs

ควรถูกส่งกลับไปเก็บที่ Server

เพื่อรวบรวมข้อมูลจากผู้ใช้งานหลายคน

---

# Product Goal

สร้างระบบเก็บ

```text
Learning Session Logs
```

แบบรวมศูนย์

เพื่อใช้วิเคราะห์การเรียนรู้จริง

จากนักเรียน ผู้ปกครอง และผู้ทดลองระบบ

---

# Product Principle

Collect First

Analyze Later

---

# High Level Architecture

```text
Student

↓

AI Tutor

↓

Learning Session Log

↓

ASP.NET Core API

↓

Database

↓

Export JSON

↓

Analysis
```

---

# Scope

Demo V1.10

---

Purpose

```text
Data Collection
```

Not

```text
Analytics Dashboard
```

---

# Session Lifecycle

## Step 1

Lesson Started

---

Create

```text
sessionId
```

---

## Step 2

Learning Interaction

---

Store

```text
messages

events
```

---

## Step 3

Lesson Completed

---

Store

```text
lesson summary

reflection

feedback
```

---

## Step 4

Send To Server

---

Store session permanently

---

# API Design

## Create Session

```http
POST /api/learning-sessions
```

---

Request

```json
{
  "sessionId": "uuid",
  "topic": "ปริมาตร",
  "startedAt": "..."
}
```

---

## Update Session

```http
PUT /api/learning-sessions/{sessionId}
```

---

Purpose

Update

```text
messages

events

summary
```

---

## Complete Session

```http
POST /api/learning-sessions/{sessionId}/complete
```

---

Purpose

Mark session completed

---

# Data Structure

## Session Metadata

```json
{
  "sessionId": "uuid",
  "studentAlias": "Student-001",
  "lessonId": "volume-001",
  "topic": "ปริมาตร",
  "startedAt": "...",
  "completedAt": "...",
  "completed": true
}
```

---

# Messages

```json
{
  "role": "student",
  "type": "answer",
  "text": "...",
  "timestamp": "..."
}
```

---

Allowed Roles

```text
student

ai

system
```

---

# Events

Supported Events

```text
lesson_started

student_answer_submitted

hint_clicked

help_me_start_clicked

example_clicked

answer_evaluated

lesson_completed

parent_summary_opened

parent_reflection_submitted

feedback_form_opened
```

---

# Parent Activity

```json
{
  "parentActivity": {
    "summaryOpened": true,
    "reflectionSubmitted": true,
    "usefulness": "more_understanding",
    "comment": "เข้าใจสิ่งที่ลูกเรียนมากขึ้น"
  }
}
```

---

# Session Summary

```json
{
  "hintUsed": 1,
  "helpMeStartUsed": 2,
  "exampleUsed": 0,
  "completed": true,
  "durationSeconds": 480
}
```

---

# Database Recommendation

Demo V1.10

---

Option A

```text
PostgreSQL
```

Recommended

---

Option B

```text
SQL Server
```

Acceptable

---

No Analytics Tables Required

Store Raw Session Data

---

Suggested Table

```text
LearningSessions
```

---

Columns

```text
SessionId

CreatedAt

CompletedAt

Topic

Completed

SessionJson
```

---

Store

```text
Full JSON
```

in SessionJson

---

Reason

Simple

Fast

Flexible

---

# Export For Analysis

Developer Only

---

Endpoint

```http
GET /api/admin/learning-sessions/export
```

---

Output

```json
{
  "exportedAt": "...",
  "version": "Demo V1.10",
  "sessions": []
}
```

---

# Recommended Workflow

```text
Users Use Demo

↓

Logs Stored On Server

↓

Collect 20-50 Sessions

↓

Export JSON

↓

Analyze With ChatGPT

↓

Discover Learning Patterns

↓

Improve Product
```

---

# Privacy Rules

Do Not Store

```text
Student Name

Email

Phone

Address
```

---

Use

```text
Student-001

Student-002

Tester-001
```

Only

---

# Explicitly Out Of Scope

Demo V1.10

---

Do Not Build

```text
Analytics Dashboard

Teacher Portal

Admin Portal

Charts

Reports

User Accounts

Progress Tracking
```

---

Reason

Current Priority

```text
User Testing

Feedback Collection

Discovery Validation
```

---

Not

```text
Analytics Platform
```

---

# Acceptance Criteria

- Session Created
    
- Messages Stored
    
- Events Stored
    
- Parent Reflection Stored
    
- Session Saved To Server
    
- Export Endpoint Available
    
- No User-Facing Export Button
    

---

# Success Criteria

After collecting

```text
20-50 Learning Sessions
```

Team can answer

```text
Where do students struggle?

Which teaching actions help most?

Do parents find value in Parent Summary?

What should be included in MVP?
```

using real data.

---

# Product Principle

Feedback Is More Valuable Than Features

Collect Learning Evidence

Before Building More Features