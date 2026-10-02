# Offline Field Issue Tracker

An offline-first field issue reporting system designed for environments where
internet connectivity is unreliable or temporarily unavailable.

The system allows field workers to create and manage infrastructure issue
reports even when they are offline. Reports are persisted locally and
synchronized with the central server when connectivity becomes available.

---

## Project Overview

Field teams often work in environments where network connectivity cannot be
guaranteed. A traditional online-only reporting application can result in
failed submissions, lost information, duplicate records, or uncertainty about
whether a report was successfully submitted.

The Offline Field Issue Tracker addresses this problem using an
**offline-first architecture**.

The application saves a report locally before attempting synchronization.
When network connectivity is available, the application synchronizes pending
reports with the central backend.

The system is designed to make synchronization failures visible rather than
silently losing user data.

---

## Problem Statement

Field workers may need to report infrastructure problems from locations with:

- Unstable internet connectivity
- Temporary network outages
- Slow connections
- Intermittent connectivity
- Limited ability to retry submissions manually

An issue reporting system for this environment must therefore provide:

- Reliable local persistence
- Offline report creation
- Automatic or manual synchronization
- Duplicate prevention
- Clear synchronization status
- Retry handling for failed synchronization
- Server-side validation
- Report history and workflow tracking

---

## Objectives

The primary objectives of this project are to:

1. Allow field workers to create issue reports while offline.
2. Persist reports locally so they survive page refreshes and application
   restarts.
3. Synchronize locally stored reports with the central server when connectivity
   returns.
4. Prevent duplicate server records when synchronization is retried.
5. Clearly communicate whether a report is pending, synchronizing,
   synchronized, or failed.
6. Provide a coordinator workflow for reviewing and progressing reports.
7. Maintain a history of important report events and status changes.
8. Validate data on both the client and server.
9. Provide automated and manual tests for important reliability scenarios.

---

## Core Features

### Field Worker

Field workers will be able to:

- Create infrastructure issue reports
- Select an issue category
- Provide a description
- Specify the location
- Select a priority
- Save reports while offline
- View locally stored reports
- See synchronization status
- Retry failed synchronization
- View report details and history

### Coordinator

Coordinators will be able to:

- View submitted reports
- Review report information
- Change the business status of reports
- Assign reports
- Mark reports as in progress
- Resolve reports
- Reject reports where appropriate
- Review report history

Authentication is intentionally outside the initial scope of this exercise.

---

## Report Information

Each report is expected to contain information such as:

| Field | Description |
|---|---|
| `clientId` | Client-generated unique identifier used for reliable synchronization |
| `id` | Server-generated report identifier |
| `category` | Type of infrastructure issue |
| `description` | Detailed description of the issue |
| `location` | Reported location |
| `priority` | LOW, MEDIUM, or HIGH |
| `status` | Business workflow status |
| `createdAt` | Report creation timestamp |
| `updatedAt` | Last update timestamp |

---

## Issue Categories

The initial categories are:

- Broken Water Point
- Damaged Equipment
- Service Interruption
- Safety Concern
- Maintenance Requirement
- Other

These categories may be refined during implementation if required.

---

## Priority Levels

Reports will use three priority levels:

- `LOW`
- `MEDIUM`
- `HIGH`

---

## Business Status Workflow

Business status represents the lifecycle of a report.

```text
DRAFT
  |
  v
SUBMITTED
  |
  +------> REJECTED
  |
  v
ASSIGNED
  |
  +------> REJECTED
  |
  v
IN_PROGRESS
  |
  v
RESOLVED