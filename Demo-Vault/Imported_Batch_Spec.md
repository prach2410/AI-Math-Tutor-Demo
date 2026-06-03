# Imported Batch Specification

Status

Planned

Version

1.0

---

# Purpose

Allow previously exported session data  
to be analyzed later.

The system should support discovery work  
even when notes have not yet been created.

---

# Supported Source

The system should accept:

```text
Exported Sessions JSON
```

generated from:

```text
Export Sessions JSON
```

---

# Import Workflow

```text
Export Sessions JSON
↓
Store File
↓
Upload JSON
↓
Create Imported Batch
↓
AI Analysis
↓
Discovery Notes
↓
Mark Reviewed
```

---

# Imported Batch

An imported batch should behave like a normal batch.

Supported actions:

- AI Analysis
    
- Save Notes
    
- Mark Reviewed
    
- Download Original JSON
    

---

# Batch Metadata

Recommended fields:

```json
{
  "batchType": "Imported",
  "source": "Upload",
  "importedAt": "...",
  "sessionCount": 10
}
```

---

# Duplicate Detection

The system should detect whether sessions  
have already been reviewed.

Recommended checks:

- sessionId
    
- studentId
    
- createdAt
    

---

# Duplicate Rules

If all sessions already exist:

Status

```text
Already Reviewed
```

If some sessions exist:

Status

```text
Partially Imported
```

If no sessions exist:

Status

```text
New Batch
```

---

# AI Analysis Rules

Imported batches should follow  
the same analysis workflow as normal batches.

```text
Calculate Metrics
↓
Generate Evidence
↓
Generate Signals
↓
Generate Discoveries
↓
Suggest Product Decisions
```

---

# Discovery Preservation

Discovery notes should remain editable.

Users may revise:

- Observations
    
- Signals
    
- Discoveries
    
- Decisions
    
- Questions
    

after AI analysis.

---

# Product Learning Principle

Discovery should not depend on  
when a batch was created.

Discovery should depend on  
evidence quality.

---
# Immediate Batch Summary

## Purpose

Provide immediate visibility into batch evidence  
before AI analysis.

Users should be able to understand  
the overall learning patterns of a batch  
without opening the JSON file.

---

## When To Calculate

Calculate automatically after:

```text
Import As Batch
```

and before:

```text
AI Analysis
```

---

## Summary Metrics

Display:

```text
Total Sessions
```

```text
Completed Sessions
```

```text
Incomplete Sessions
```

```text
Completion Rate (%)
```

---

## Help Metrics

Display:

```text
Hint Usage Count
```

```text
Help Me Start Usage Count
```

```text
Worked Example Usage Count
```

---

## Learning Friction Metrics

If available:

```text
Session Abandoned Count
```

```text
Abandonment Rate (%)
```

```text
Most Abandoned Lesson
```

```text
Most Abandoned Step
```

---

## Student Metrics

If available:

```text
Unique Students
```

```text
Returning Students
```

```text
Average Sessions Per Student
```

---

## Device Metrics

If available:

```text
Unique Devices
```

```text
Returning Devices
```

---

## UI Example

```text
Batch Summary

Sessions: 10

Completed: 8
Incomplete: 2

Completion Rate: 80%

Help Me Start: 7
Worked Example: 4
Hints: 5

Returning Students: 3
Unique Devices: 6
```

---

## Important Principle

Summary metrics are evidence.

Summary metrics are not discoveries.

The purpose is to help users review evidence  
before generating discoveries.