---

## status: approved  
version: Demo V1.10  
category: Testing  
priority: high  
source: product_decision  
owner: Product  
last_updated: 2026-06

# Discovery Batch Review

Status: Approved

Priority: High

Category: Internal Testing Tool

---

# Purpose

สร้างเครื่องมือภายในสำหรับจัดกลุ่ม

```text
Learning Session Logs
```

เป็นชุด ๆ เพื่อนำไปวิเคราะห์และสร้าง

```text
Discovery Log
```

อย่างเป็นระบบ

---

# Background

ในช่วง Demo V1.10

เป้าหมายหลักคือ

```text
Feedback > Features
```

และ

```text
Evidence > Assumptions
```

---

เมื่อมี Learning Session Logs จำนวนมากขึ้น

การเปิดดูทีละ Session จะเริ่มยาก

ดังนั้นควรมีระบบช่วยจัดกลุ่ม Session เป็น Batch

เช่น

```text
ทุก 10 Sessions
```

เพื่อวิเคราะห์เป็นรอบ ๆ

---

# Product Goal

ช่วยให้ทีมสามารถ

```text
รวบรวม Sessions

↓

วิเคราะห์ด้วย AI

↓

สรุป Discovery

↓

ตัดสินใจ MVP
```

ได้ง่ายขึ้น

---

# Important Principle

This is not an analytics dashboard.

This is an internal review tool.

---

# MVP Scope

สำหรับ Demo V1.10

ทำเฉพาะเครื่องมือพื้นฐาน

---

# Batch Definition

หนึ่ง Batch คือกลุ่มของ Learning Sessions

จำนวนประมาณ

```text
10 Sessions
```

---

Example

```text
Batch 001

Sessions 1 - 10
```

---

```text
Batch 002

Sessions 11 - 20
```

---

# Core Workflow

```text
Learning Sessions Collected

↓

Unreviewed Sessions Count

↓

Create Discovery Batch

↓

Export Batch JSON

↓

Analyze With AI

↓

Write Discovery Notes

↓

Mark Batch As Reviewed
```

---

# Required Features

## 1. View Unreviewed Sessions Count

แสดงจำนวน Session ที่ยังไม่ได้ถูก Review

Example

```text
Unreviewed Sessions: 12
```

---

# 2. Create Batch

ปุ่ม

```text
Create Batch From Latest 10 Sessions
```

---

เมื่อกด

ระบบจะเลือก Session ที่ยังไม่ได้ Review จำนวนสูงสุด 10 รายการ

---

# 3. Batch List

แสดงรายการ Batch ที่สร้างแล้ว

Example

```text
Batch 001

Sessions: 10

Status: Draft

CreatedAt: ...
```

---

# 4. Export Batch JSON

ปุ่ม

```text
Download Batch JSON
```

---

ใช้สำหรับนำไปวิเคราะห์ด้วย ChatGPT หรือ AI อื่น

---

# 5. Add Discovery Notes

ให้เพิ่ม Notes แบบ Manual

Fields

```text
Key Observations

Validated Discoveries

Unconfirmed Signals

Product Decisions

Next Questions
```

---

# 6. Mark As Reviewed

หลังจากวิเคราะห์เสร็จ

สามารถเปลี่ยนสถานะเป็น

```text
Reviewed
```

---

# Batch Status

Allowed values

```text
draft

reviewed
```

---

# Suggested API Endpoints

## Get Unreviewed Count

```http
GET /api/admin/discovery-batches/unreviewed-count
```

---

Response

```json
{
  "unreviewedSessions": 12
}
```

---

## Create Batch

```http
POST /api/admin/discovery-batches
```

---

Request

```json
{
  "maxSessions": 10
}
```

---

Response

```json
{
  "batchId": "batch-001",
  "sessionCount": 10,
  "status": "draft"
}
```

---

## List Batches

```http
GET /api/admin/discovery-batches
```

---

## Get Batch Detail

```http
GET /api/admin/discovery-batches/{batchId}
```

---

## Export Batch

```http
GET /api/admin/discovery-batches/{batchId}/export
```

---

## Update Discovery Notes

```http
PUT /api/admin/discovery-batches/{batchId}/notes
```

---

Request

```json
{
  "keyObservations": "...",
  "validatedDiscoveries": "...",
  "unconfirmedSignals": "...",
  "productDecisions": "...",
  "nextQuestions": "..."
}
```

---

## Mark Reviewed

```http
POST /api/admin/discovery-batches/{batchId}/mark-reviewed
```

---

# Data Model

## DiscoveryBatch

```json
{
  "batchId": "batch-001",
  "createdAt": "...",
  "reviewedAt": "...",
  "status": "draft",
  "sessionIds": [],
  "sessionCount": 10,
  "notes": {
    "keyObservations": "",
    "validatedDiscoveries": "",
    "unconfirmedSignals": "",
    "productDecisions": "",
    "nextQuestions": ""
  }
}
```

---

# Export JSON Format

```json
{
  "exportedAt": "...",
  "version": "Demo V1.10",
  "batchId": "batch-001",
  "sessionCount": 10,
  "sessions": []
}
```

---

# Recommended AI Analysis Prompt

Include this prompt in the exported file or admin page.

```text
Analyze this AI Tutor Learning Session Batch.

Please summarize:

1. Where did students struggle?

2. Which Teaching Actions helped most?

3. Was Help Me Start useful?

4. Was Worked Example useful?

5. Did students complete the lessons?

6. Did Parent Summary create value?

7. What Product Discoveries are supported?

8. What should be improved next?

9. What should NOT be built yet?

10. What should be added to MVP Scope?
```

---

# Admin UI Requirements

This tool is internal only.

Recommended route

```text
/admin/discovery-batches
```

---

Do not show this feature to normal users.

---

# Page Layout

```text
Discovery Batch Review

Unreviewed Sessions: 12

[ Create Batch From Latest 10 Sessions ]

--------------------------------

Batch List

Batch 001
Sessions: 10
Status: Draft
[ Download JSON ] [ Edit Notes ] [ Mark Reviewed ]

Batch 002
Sessions: 10
Status: Reviewed
[ Download JSON ] [ View Notes ]
```

---

# Storage Recommendation

Use existing database.

Add table

```text
DiscoveryBatches
```

---

Suggested columns

```text
BatchId

CreatedAt

ReviewedAt

Status

SessionIdsJson

NotesJson
```

---

# Explicitly Out Of Scope

Demo V1.10

Do Not Build

```text
Charts

Graphs

Automatic AI Analysis

Dashboard Metrics

Teacher Portal

Admin Roles

Complex Permissions

Long-Term Analytics
```

---

# Privacy Rules

Batch export must not include

```text
Student real names

Emails

Phone numbers

Personal identifiers
```

---

Use only

```text
Student-001

Tester-001

SessionId
```

---

# Acceptance Criteria

- Admin can see unreviewed session count
    
- Admin can create batch from up to 10 unreviewed sessions
    
- Admin can export batch JSON
    
- Admin can write discovery notes
    
- Admin can mark batch reviewed
    
- Normal users cannot access this UI
    
- No analytics dashboard is built
    

---

# Success Criteria

After collecting every 10 Sessions

team can create a structured Discovery Log

and answer:

```text
What did we learn?

What was validated?

What still needs testing?

What should we build next?

What should we avoid building?
```

---

# Product Principle

Do not build analytics before learning what matters.

Use batches to turn raw logs into product discoveries.