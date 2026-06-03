# Imported Batch — Implementation Summary

Status: Completed
Date: 2026-06-03

---

## สิ่งที่ implement

ทั้งหมดนี้ implement ตาม `Imported_Batch_Spec.md`

---

## 1. Discovery Draft Status

### ปัญหาเดิม

`status` มีแค่ 2 ค่า: `draft | reviewed`
ทำให้ "ยังไม่มี notes" กับ "มี notes แล้วแต่ยังไม่ review" แสดงเหมือนกัน

### สิ่งที่เพิ่ม

**Backend** — `DiscoveryBatchDtos.cs` + `DiscoveryBatchService.cs`

เพิ่ม field `DiscoveryStatus` ที่คำนวณใน `ToSummaryDto()` โดยไม่ต้องเพิ่ม DB column:

```
notes ว่างทุก field  → not_analyzed
notes มีเนื้อหา      → discovery_draft
status = "reviewed"  → reviewed
```

**Frontend** — `discovery-batches.component.ts`

- เพิ่ม `discoveryStatus` ใน `BatchSummary` interface
- Badge แสดง 3 states พร้อม CSS สีแต่ละ state:
  - `NOT ANALYZED` — สีเทา
  - `DISCOVERY DRAFT` — สีเหลือง
  - `REVIEWED` — สีเขียว
- ปุ่ม Edit Notes / Mark Reviewed / Save Notes ใช้ `discoveryStatus !== 'reviewed'`

---

## 2. analysisStatus อัปเดตหลัง Save Notes

### ปัญหาเดิม

`PUT /notes` บันทึก notes content อย่างเดียว ไม่เปลี่ยน `analysisStatus`

### สิ่งที่มีอยู่แล้ว (ไม่ต้องแก้)

`UpdateNotesAsync()` ใน `DiscoveryBatchService.cs` มี logic นี้อยู่แล้ว:

```csharp
if (entity.AnalysisStatus == "not_analyzed")
    entity.AnalysisStatus = "analysis_generated";
```

Badge `analysisStatus` จะเปลี่ยนจาก `Not Analyzed` → `Analysis Generated` ทันทีหลัง Save Notes

---

## 3. User Guidance สำหรับ PartiallyImported

### ปัญหาเดิม

Guidance แสดงเฉพาะ `NewBatch` case เท่านั้น

### สิ่งที่เพิ่ม

**Frontend** — เพิ่ม guidance block สีเหลืองสำหรับ `PartiallyImported`:

```
⚠️ Batch imported with some duplicate sessions.
Next Step:
1. Click "Copy Prompt + Data" on the batch below
2. Analyze with ChatGPT
3. Paste discovery notes back into the batch
```

---

## 4. MostAbandonedStep

### ปัญหาเดิม

Frontend template มี `{{ batch.summary.mostAbandonedStep }}` รอแสดง
แต่ backend ไม่คำนวณ field นี้ — แสดงว่างเสมอ

### สิ่งที่เพิ่ม

**Backend** — `DiscoveryBatchService.cs` ใน `CalculateSummary()`

Logic: นับ `step_started` events ก่อน `session_abandoned` ตาม timestamp ordering

```
lesson_started
step_started      ← นับ: 1
step_completed
step_started      ← นับ: 2
session_abandoned ← abandoned at Step 2
```

ผลลัพธ์: `"Step N"` — เลือก step ที่ถูก abandon บ่อยที่สุดใน batch

**Backend** — `DiscoveryBatchDtos.cs`

เพิ่ม field `MostAbandonedStep` ใน `BatchMetrics`

---

## 5. AvgSessionsPerDevice

### ปัญหาเดิม

Spec ระบุ metric นี้ — frontend interface มี field แต่ backend ไม่คำนวณและไม่แสดงผล

### สิ่งที่เพิ่ม

**Backend** — `DiscoveryBatchDtos.cs`

เพิ่ม field `AvgSessionsPerDevice` ใน `BatchMetrics`

**Backend** — `DiscoveryBatchService.cs`

```csharp
metrics.AvgSessionsPerDevice = metrics.UniqueDevices > 0
    ? Math.Round((double)total / metrics.UniqueDevices, 1) : 0;
```

**Frontend** — เพิ่ม row "Avg Sessions" ใน Devices group

---

## ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `AI-Math-Tutor-API-Demo/Models/DiscoveryBatchDtos.cs` | เพิ่ม `DiscoveryStatus`, `MostAbandonedStep`, `AvgSessionsPerDevice` |
| `AI-Math-Tutor-API-Demo/Services/DiscoveryBatchService.cs` | คำนวณ `DiscoveryStatus`, `MostAbandonedStep`, `AvgSessionsPerDevice` |
| `src/app/admin/discovery-batches/discovery-batches.component.ts` | Badge 3 states, guidance PartiallyImported, Avg Sessions per Device row |

---

## วิธี Validate

### Discovery Draft Status

1. สร้าง/import batch → badge ต้องแสดง `NOT ANALYZED`
2. กรอก notes → Save → badge เปลี่ยนเป็น `DISCOVERY DRAFT`
3. Mark Reviewed → badge เปลี่ยนเป็น `REVIEWED` + ปุ่ม Edit/Mark หายไป

### analysisStatus

1. Import batch → `analysisStatus` = `Not Analyzed`
2. Save notes → `analysisStatus` = `Analysis Generated`

### MostAbandonedStep

เล่น lesson ถึง Step 2 แล้วปิด tab → import session → ดู `Most Abandoned Step: Step 2`

หรือแก้ JSON ทดสอบ:
```json
"events": [
  { "type": "lesson_started", "timestamp": "..." },
  { "type": "step_started", "timestamp": "..." },
  { "type": "step_started", "timestamp": "..." },
  { "type": "session_abandoned", "timestamp": "..." }
]
```

### AvgSessionsPerDevice

Import JSON ที่มี `deviceId` → ดู Devices group แสดง `Avg Sessions`

### Quick API Check

```bash
curl http://localhost:5000/api/admin/discovery-batches
```

ควรเห็น `"discoveryStatus": "not_analyzed"` ใน response

---

## หลักการ (จาก Spec)

- Evidence first, Discovery second
- Discovery status เป็น iterative: บันทึกได้หลายรอบ ก่อน finalize
- Summary metrics คือ evidence — ไม่ใช่ discovery
