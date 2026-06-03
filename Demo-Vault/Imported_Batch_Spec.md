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