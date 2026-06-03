# E-01 Student Interaction Preference Experiment

## Status

Proposed

## Priority

High

## Type

Product Discovery Experiment

---

# Purpose

The purpose of this experiment is to understand how Grade 8 students prefer to interact with an AI Tutor.

The goal is NOT to prove that voice is better than text.

The goal is to discover:

- Which interaction mode students naturally choose
    
- Why students choose that mode
    
- Which mode creates better engagement
    
- Which mode produces better learning evidence
    
- Which mode helps reveal student misconceptions and prerequisite gaps
    

---

# Background

Current tutoring interactions are text-based.

However, students may prefer different interaction styles.

Some students may:

- Prefer voice because typing is slow
    
- Prefer text because they feel shy speaking
    
- Switch modes depending on task difficulty
    

Instead of forcing students into a specific interaction mode, the system should observe and learn from real usage.

---

# Related Hypothesis

## H-10

Students prefer different interaction modes (Voice or Text), and voice interaction may provide higher-quality learning evidence and engagement.

Status:  
Testing

Priority:  
High

---

# Experiment Design

## Student Choice Model

At the beginning of each session:

How would you like to interact?

( ) Text Chat

( ) Voice Conversation

Students choose freely.

No forced assignment.

No A/B split.

The goal is observation, not optimization.

---

# Success Criteria

The experiment is successful if we learn:

- Which mode students prefer
    
- Why they prefer it
    
- Which mode increases participation
    
- Which mode improves engagement
    
- Which mode reveals misconceptions faster
    
- Which mode generates richer learning evidence
    

---

# Non Goals

This experiment does NOT attempt to validate:

- Voice avatars
    
- Emotional AI
    
- Animated tutors
    
- Voice-only tutoring
    
- Speech quality optimization
    

These are future considerations.

---

# MVP Architecture

Student  
↓  
Choose Mode

Text  
or  
Voice

Voice  
↓  
Speech-to-Text  
↓  
Current Tutor Engine  
↓  
Text-to-Speech

Text  
↓  
Current Tutor Engine

The existing Learning Flow Engine remains unchanged.

---

# Evidence Collection

## Session Metadata

Record:

- Student ID (anonymous)
    
- Selected Mode
    
- Reason For Choice
    
- Session Duration
    
- Completion Status
    
- Scenario Used
    

Example:

Student:  
M2-001

Selected Mode:  
Voice

Reason:  
"I don't like typing"

Duration:  
12 minutes

Completed:  
Yes

Scenario:  
Fish Tank Volume

---

# Engagement Metrics

Track:

- Session completion rate
    
- Session duration
    
- Number of responses
    
- Number of student questions
    
- Drop-off points
    

---

# Learning Evidence

Observe:

- Misconceptions
    
- Prerequisite gaps
    
- Confusion points
    
- Confidence level
    
- Willingness to explain reasoning
    

Examples:

- Student remembers formula but forgets units
    
- Student understands volume but cannot multiply numbers
    
- Student asks follow-up questions without prompting
    

---

# Observation Template

## Session ID

Date:

Student:

Mode:  
Text / Voice

Scenario:

---

## Observations

What happened?

Examples:

- Student hesitated before answering
    
- Student confused area and volume
    
- Student repeatedly struggled with multiplication
    
- Student explained reasoning clearly
    

---

## Related Hypotheses

Supports:

- H-04 Guided Assistance Ladder
    
- H-07 Prerequisite Gaps
    
- H-10 Interaction Preference
    

---

## Notes

Additional observations.

---

# Key Questions

1. Which mode do students naturally choose?
    
2. Why do students choose that mode?
    
3. Do stronger students prefer different modes from struggling students?
    
4. Does voice increase participation?
    
5. Does voice increase session completion?
    
6. Does voice reveal prerequisite gaps faster?
    
7. Does voice generate richer evidence?
    
8. Does supporting both modes create better learning outcomes?
    

---

# Decision Rules

Do not decide based on a single session.

Guideline:

1–3 sessions  
→ Observation only

3–10 sessions  
→ Early signal

10–20 sessions  
→ Strong signal

20+ sessions  
→ Decision candidate

---

# Possible Outcomes

## Outcome A

Voice clearly improves engagement.

Action:

Continue voice development.

---

## Outcome B

Voice generates better evidence but similar learning outcomes.

Action:

Use voice primarily for research and observation.

---

## Outcome C

Voice shows little improvement.

Action:

Remain text-first.

---

## Outcome D

Students naturally self-segment.

Examples:

- Stronger students prefer text
    
- Students needing support prefer voice
    

Action:

Support both interaction modes.

---

# Product Principle

Student learning is the goal.

Voice and Text are both tools.

The experiment seeks to understand which interaction mode creates the best learning experience and the highest-quality learning evidence.

We are not trying to prove that Voice is better.

We are trying to learn how students learn best.