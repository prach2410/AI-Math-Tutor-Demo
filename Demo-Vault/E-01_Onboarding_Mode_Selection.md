# Onboarding Interaction Mode Selection

## Purpose

Allow students to choose their preferred interaction mode before starting a learning session.

The goal is not personalization.

The goal is to collect evidence about:

- Student preferences
    
- Engagement patterns
    
- Learning behavior
    
- Voice vs Text effectiveness
    

This experiment supports:

- H-10 Interaction Preference
    
- H-04 Guided Assistance Ladder
    
- H-07 Prerequisite Gaps
    

---

# Placement

Show after:

Welcome Screen

Show before:

Scenario Selection

Recommended Flow:

Welcome  
↓  
How This Tutor Works  
↓  
Interaction Mode Selection  
↓  
Scenario Selection  
↓  
Learning Session

---

# Welcome Screen

Welcome 👋

This AI Tutor will not immediately give answers.

Instead, it will help you think step by step and learn how to solve problems on your own.

A typical lesson takes about 10–15 minutes.

---

# Interaction Mode Selection

## Title

How would you like to learn today?

---

## Option 1

🎤 Voice Conversation

Talk naturally with the tutor.

Good if:

- You do not like typing
    
- You prefer speaking
    
- You want a more natural conversation
    

---

## Option 2

⌨️ Text Chat

Type your answers and questions.

Good if:

- You prefer reading and writing
    
- You are in a quiet environment
    
- You do not want to use a microphone
    

---

## Selection Rule

Students choose freely.

No recommendation.

No default option.

No forced assignment.

---

# Event Tracking

## Event

interaction_mode_selected

Properties:

- student_id
    
- selected_mode
    
- timestamp
    

Example:

{  
"event": "interaction_mode_selected",  
"mode": "voice"  
}

---

# Session Tracking

Store:

- Selected Mode
    
- Session Duration
    
- Completion Status
    
- Scenario
    
- Number of Responses
    

Example:

Student:  
M2-001

Mode:  
Voice

Duration:  
14 minutes

Completed:  
Yes

Scenario:  
Fish Tank Volume

---

# Optional Post-Session Question

Show after lesson completion.

---

## Question

Why did you choose this interaction mode?

---

## Options

Voice

- Speaking is easier
    
- I do not like typing
    
- It feels more natural
    
- I wanted to try it
    

Text

- I do not want to speak
    
- I am in a public place
    
- I prefer reading and writing
    
- Typing is easier
    

Other

- Free text
    

---

# Additional Event

interaction_mode_reason

Properties:

- selected_mode
    
- reason
    

---

# Mode Change Tracking

If students switch modes during a session:

Track event:

interaction_mode_changed

Properties:

- from_mode
    
- to_mode
    
- timestamp
    

Example:

{  
"event": "interaction_mode_changed",  
"from": "voice",  
"to": "text"  
}

---

# Evidence Collection

Questions to answer:

1. Which mode do students choose?
    
2. Why do they choose it?
    
3. Does voice increase participation?
    
4. Does voice increase session completion?
    
5. Does voice reveal misconceptions faster?
    
6. Do students change modes during learning?
    
7. Are stronger students choosing different modes than struggling students?
    

---

# Success Criteria

The onboarding flow is successful if it helps us collect evidence for:

H-10 Interaction Preference

without increasing friction or reducing lesson completion rates.

---

# Product Principle

Do not assume Voice is better.

Do not assume Text is better.

Allow students to choose.

Collect evidence.

Learn from real behavior.

Then make decisions.