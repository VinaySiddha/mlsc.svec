---
title: 'Study Hub & Leaderboard Specification'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '04-study-hub-and-leaderboard'
description: 'Architecture of the interactive DSA tracker, progress synchronization, and scoring engine.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Study Hub & Leaderboard Specification

---

## 1. Overview
The **MLSC Study Hub** (`mlscsvec.com/study`) is an interactive technical preparation environment that curates Data Structures, Algorithms, System Design, and Cloud computing tracks (including Striver's SDE Sheet).

---

## 2. Dynamic Progress & Sync Architecture

```mermaid
sequenceDiagram
    participant User as Student
    participant Client as Study UI (React)
    participant Action as Server Action (toggleProblemAction)
    participant DB as Firestore (study_progress & users)
    participant LB as Leaderboard Query Engine

    User->>Client: Clicks Problem Checkmark
    Client->>Action: Passes problemId, courseId, difficulty
    Action->>DB: Atomic Batch Transaction:
    Note over Action,DB: 1. Add problemId to solvedProblems array<br/>2. Increment totalPoints (Easy:+10, Med:+20, Hard:+40)<br/>3. Update user lastActive timestamp
    DB-->>Action: Transaction Succeeded
    Action-->>Client: Returns updated progress stats & new rank
    LB->>DB: Aggregates top point earners for /community/leaderboard
```

---

## 3. Key Features

1. **Category Filtering:** Filter problems by Arrays, Linked Lists, Dynamic Programming, Graphs, and Trees.
2. **Embedded Resources:** Direct links to LeetCode / GeeksForGeeks problems, video solutions, and article notes.
3. **Streak Tracking:** Computes daily active streaks to encourage consistent problem-solving habits.
