# Batch Analysis AI Specification

Status

Planned

Version

1.0

---

# Purpose

Analyze learning sessions in batches.

Convert raw learning logs into:

- Evidence
    
- Signals
    
- Discoveries
    
- Product Decisions
    

The goal is not to generate reports.

The goal is to support product learning.

---

# Analysis Workflow

```text
Learning Sessions
↓
Batch Creation
↓
AI Analysis
↓
Evidence Summary
↓
Discovery Review
↓
Product Decisions
```

---

# Default Batch Size

Recommended

```text
10 Sessions
```

A batch should contain enough data to identify patterns.

Avoid making discoveries from individual sessions.

---

# Batch Summary Calculation

Before generating discoveries,  
the AI should calculate quantitative metrics.

---

## Session Metrics

Calculate:

```text
Total Sessions

Completed Sessions

Incomplete Sessions

Completion Rate (%)
```

---

## Help Usage Metrics

Calculate:

```text
Hint Usage Count

Help Me Start Usage Count

Worked Example Usage Count
```

And:

```text
Hint Usage Rate (%)

Help Me Start Usage Rate (%)

Worked Example Usage Rate (%)
```

---

## Learning Friction Metrics

Calculate:

```text
Session Abandoned Count

Abandonment Rate (%)

Most Abandoned Lesson

Most Abandoned Step
```

If step data exists.

---

## Student Return Metrics

Calculate:

```text
Returning Students

New Students

Average Sessions Per Student
```

If student tracking exists.

---

## Device Metrics

Calculate:

```text
Returning Devices

New Devices
```

If device tracking exists.

---

# Evidence Generation

The AI should generate evidence before conclusions.

Good Example

```text
8 out of 10 sessions used Help Me Start.

5 out of 10 sessions requested Worked Examples.

3 out of 10 sessions ended before lesson completion.
```

Bad Example

```text
Students struggle with mathematics.
```

Evidence must be observable from logs.

---

# Key Observations

Generate observations based on evidence.

Examples

```text
Help Me Start was used in most sessions.

Worked Example usage appears moderate.

Lesson completion rate is high.
```

Observations should remain descriptive.

Avoid conclusions.

---

# Unconfirmed Signals

Generate hypotheses.

Examples

```text
Students may struggle to begin solving problems independently.

Worked Examples may increase lesson continuation.
```

Signals are not discoveries.

Signals require additional evidence.

---

# Discovery Validation Rules

A discovery should only be generated when:

- Multiple sessions support the finding.
    
- Evidence is observable.
    
- The finding is repeatable.
    

Avoid strong conclusions from small samples.

---

# Validated Discoveries

Examples

```text
Help Me Start creates value during lesson initiation.

Worked Examples help students continue learning.
```

Each discovery should reference supporting evidence.

---

# Product Decisions

Generate suggested product actions.

Examples

```text
Continue collecting Help Me Start data.

Add SessionAbandoned tracking.

Investigate prerequisite arithmetic weaknesses.
```

Product decisions should remain MVP-focused.

Avoid proposing large features without evidence.

---

# Next Questions

Generate unanswered questions.

Examples

```text
Where do students abandon lessons?

Does displayName improve engagement?

Do students return for additional sessions?

Which prerequisite skills cause the most friction?
```

---

# MVP Scope Rule

The AI should prioritize:

- Evidence
    
- Learning Outcomes
    
- User Feedback
    
- Product Discovery
    

The AI should avoid recommending:

- Multi-Agent Systems
    
- Advanced Analytics
    
- Gamification
    
- RAG Expansion
    
- Complex Personalization
    

unless supported by evidence.

---

# Product Learning Principle

Raw Logs

↓

Evidence

↓

Discovery

↓

Product Decisions

↓

MVP

Never skip directly from ideas to features.