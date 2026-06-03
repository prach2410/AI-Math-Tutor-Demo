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

---
# Auto Batch Summary

Status

Planned

Version

1.0

---

# Purpose

Provide immediate evidence visibility after importing a session batch.

Users should be able to verify that:

- The JSON file was parsed successfully.
    
- Sessions were detected correctly.
    
- Basic learning metrics are available.
    
- The batch is ready for AI analysis.
    

This reduces confusion and prevents repeated imports.

---

# When To Run

Automatically calculate after:

```text
Import As Batch
```

and before:

```text
Copy Prompt + Data
```

or

```text
AI Analysis
```

---

# Analysis Status

Each batch should have an analysis status.

Supported values:

```text
Not Analyzed
```

Batch imported successfully.

No discovery notes generated.

---

```text
Analysis Generated
```

AI analysis completed.

Discovery notes available.

---

```text
Reviewed
```

Discovery notes reviewed and accepted.

---

# Summary Metrics

## Session Metrics

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

## Help Usage Metrics

Display:

```text
Hint Usage Count
```

```text
Hint Usage Rate (%)
```

```text
Help Me Start Usage Count
```

```text
Help Me Start Usage Rate (%)
```

```text
Worked Example Usage Count
```

```text
Worked Example Usage Rate (%)
```

---

## Learning Friction Metrics

If available:

```text
Session Abandoned Count
```

```text
Session Abandonment Rate (%)
```

```text
Most Abandoned Lesson
```

```text
Most Abandoned Step
```

---

## Student Metrics

If studentId exists:

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

If deviceId exists:

```text
Unique Devices
```

```text
Returning Devices
```

```text
Average Sessions Per Device
```

---

# UI Example

```text
Batch Summary

Sessions: 10

Completed: 3
Incomplete: 7

Completion Rate: 30%

Hints: 2 (20%)

Help Me Start: 3 (30%)

Worked Example: 2 (20%)

Abandoned Sessions: 6 (60%)

Unique Students: 4

Returning Students: 3

Unique Devices: 4
```

---

# Duplicate Import Handling

If imported sessions already exist:

Status

```text
Already Reviewed
```

Display:

```text
10 sessions already exist in batch-001
```

The system should clearly indicate:

- Import succeeded
    
- Duplicate sessions detected
    
- Existing batch reference
    

---

# User Guidance

If no AI analysis exists:

Display:

```text
Batch imported successfully.

Next Step:

1. Click "Copy Prompt + Data"
2. Analyze with ChatGPT
3. Paste discovery notes back into the batch
```

Avoid showing empty discovery fields without explanation.

---

# Product Learning Principle

Evidence should be visible immediately.

Users should not need AI analysis  
to confirm that learning data exists.

Evidence first.

Discovery second.

---
# Discovery Notes Workflow

Status

Planned

Version

1.0

---

# Purpose

Discovery Notes are used to preserve product learning  
generated from learning session evidence.

Discovery Notes are not temporary form inputs.

They represent reviewed observations,  
signals, discoveries, and product decisions.

---

# Review Workflow

```text
Import Batch
↓
Review Batch Summary
↓
Copy Prompt + Data
↓
Analyze With AI
↓
Generate Discovery Notes
↓
Save Discovery Notes
↓
Mark Reviewed
```

---

# Batch Review Status

A batch should support the following review states.

---

## Not Analyzed

Status

```text
Not Analyzed
```

Meaning

- Batch imported successfully.
    
- No discovery notes exist.
    
- AI analysis has not been performed.
    

---

## Discovery Draft

Status

```text
Discovery Draft
```

Meaning

- Discovery notes have been added.
    
- Review is still in progress.
    
- Notes may continue to change.
    

---

## Reviewed

Status

```text
Reviewed
```

Meaning

- Discovery review is complete.
    
- Product learning has been captured.
    
- No further review is required.
    

---

# Save Discovery Notes

Purpose

Preserve discovery work before review is finalized.

---

## Save Action

The system should save:

```text
Key Observations
```

```text
Unconfirmed Signals
```

```text
Validated Discoveries
```

```text
Product Decisions
```

```text
Next Questions
```

---

## Save Result

After saving:

```text
Status = Discovery Draft
```

The batch remains editable.

Users may continue refining notes.

---

# Mark Reviewed

Purpose

Finalize discovery review.

---

## Review Action

When a user selects:

```text
Mark Reviewed
```

the system should:

- Mark the batch as reviewed.
    
- Preserve discovery notes.
    
- Remove the batch from active review queues.
    
- Keep the batch available for future reference.
    

---

## Review Result

After review:

```text
Status = Reviewed
```

---

# Important Principle

Saving notes does not mean review is complete.

Examples

```text
Save Discovery Notes

= Work in progress
```

```text
Mark Reviewed

= Review completed
```

These actions serve different purposes.

They should not be treated as the same workflow step.

---

# Product Learning Principle

Discovery work may require multiple review passes.

Users should be able to:

- Save partially completed reviews.
    
- Return later.
    
- Continue discovery work.
    
- Finalize only when confident.
    

Product learning should be iterative.

Not all discoveries are validated immediately.

---
# Discovery Review State Machine

Status

Planned

Version

1.0

---

# Purpose

Ensure discovery reviews follow a structured workflow.

Users should move through:

```text
Evidence
↓
Observation
↓
Discovery Draft
↓
Reviewed
```

and should not skip directly from import to reviewed.

---

# Review States

## Not Analyzed

Status

```text
NOT ANALYZED
```

Meaning

- Batch imported successfully.
    
- No discovery notes have been saved.
    
- Review work has not started.
    

---

## Discovery Draft

Status

```text
DISCOVERY DRAFT
```

Meaning

- Discovery notes have been saved.
    
- Review is still in progress.
    
- Notes may continue to evolve.
    

---

## Reviewed

Status

```text
REVIEWED
```

Meaning

- Discovery review is complete.
    
- Product learning has been captured.
    
- No additional review is required.
    

---

# State Transitions

Supported transitions:

```text
NOT ANALYZED
↓ Save Discovery Notes
DISCOVERY DRAFT
```

```text
DISCOVERY DRAFT
↓ Save Discovery Notes
DISCOVERY DRAFT
```

```text
DISCOVERY DRAFT
↓ Mark Reviewed
REVIEWED
```

---

# Invalid Transitions

The following transition should not be allowed:

```text
NOT ANALYZED
↓ Mark Reviewed
```

Reason

No discovery work exists.

No review has occurred.

---

# Save Discovery Notes

Purpose

Create or update discovery work.

---

## Save Action

The system should save:

- Key Observations
    
- Unconfirmed Signals
    
- Validated Discoveries
    
- Product Decisions
    
- Next Questions
    

---

## First Save

If the batch status is:

```text
NOT ANALYZED
```

After saving:

```text
DISCOVERY DRAFT
```

---

## Subsequent Saves

If the batch status is:

```text
DISCOVERY DRAFT
```

Status remains unchanged.

---

# Mark Reviewed

Purpose

Finalize discovery review.

---

## Review Requirements

A batch should only be reviewable when:

At least one of the following contains content:

- Key Observations
    
- Unconfirmed Signals
    
- Validated Discoveries
    
- Product Decisions
    
- Next Questions
    

---

## Review Result

After review:

```text
REVIEWED
```

---

# UI Behavior

## Not Analyzed

Display:

```text
NOT ANALYZED
```

Show:

```text
Edit Notes
```

Hide or disable:

```text
Mark Reviewed
```

---

## Discovery Draft

Display:

```text
DISCOVERY DRAFT
```

Show:

```text
Save Discovery Notes
```

```text
Mark Reviewed
```

---

## Reviewed

Display:

```text
REVIEWED
```

Show:

```text
View Notes
```

Optional:

```text
Reopen Review
```

---

# Review Guidance

Display above Discovery Notes:

```text
Start with the evidence above.

Record observations before conclusions.

Only add discoveries supported by multiple sessions.
```

---

# Product Learning Principle

Discovery is a process.

Evidence should come before conclusions.

Review should come after discovery work.

Users should not be able to mark a batch as reviewed  
without recording product learning.