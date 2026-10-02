# Offline Field Issue Tracker

> An offline-first field issue reporting system designed for environments with unreliable connectivity — featuring persistent local storage, reliable synchronization, idempotent server writes, a status workflow, and a coordinator management interface.

[![Backend Tests](https://img.shields.io/badge/backend_tests-13_passing-brightgreen)](#testing)
[![Frontend Tests](https://img.shields.io/badge/frontend_tests-50_passing-brightgreen)](#testing)
[![Node.js](https://img.shields.io/badge/node-18%2B-blue)](#prerequisites)
[![MySQL](https://img.shields.io/badge/mysql-8-blue)](#prerequisites)
[![React](https://img.shields.io/badge/react-18-blue)](#technology-stack)
[![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)](#license)

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Synchronization Strategy](#synchronization-strategy)
- [Project Status](#project-status)
- [Quick Start](#quick-start)
- [Running Tests](#testing)
- [API Overview](#api-overview)
- [Status Workflow](#status-workflow)
- [Project Structure](#project-structure)
- [Documentation Index](#documentation-index)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Reliability Principles](#reliability-principles)
- [Git Workflow](#git-workflow)
- [Time Spent](#time-spent)
- [What I Would Improve With More Time](#what-i-would-improve-with-more-time)
- [AI Tool Disclosure](#ai-tool-disclosure)
- [Author](#author)
- [License](#license)

---

## Overview

Field workers in remote areas frequently need to report infrastructure problems — broken water points, damaged equipment, safety hazards, service interruptions. Their environments often lack reliable internet connectivity.

Traditional online-only reporting systems fail in these conditions: reports are lost, duplicates are created, and coordinators lose visibility into critical issues.

The **Offline Field Issue Tracker** solves this with an **offline-first architecture**:

- Reports are saved locally first, then synchronized to a server.
- Synchronization is **idempotent** — retries never create duplicates.
- Failed syncs are **never silently lost** — they remain on the device with clear state.
- Coordinators get a **structured workflow** to review, assign, and resolve reports.
- Every action is **audited** in an append-only history log.

---

## The Problem

Field workers operate in environments with:

- Unstable or intermittent internet connectivity
- Long periods of complete network unavailability
- Slow connections that can time out mid-submission
- Devices that may be closed or powered off at any moment

An online-only reporting system breaks in these conditions:

| Failure Mode | Consequence |
|---|---|
| Form submission times out | Report is lost |
| Network drops mid-sync | Unknown if server received it |
| Worker retries manually | Duplicate reports created |
| App is closed | Pending report gone |
| Coordinator has no visibility | Problems go unfixed |

---

## The Solution

The system is built on **five core invariants**:

| # | Invariant | How It Is Guaranteed |
|---|---|---|
| 1 | **No data loss** | Reports persist in IndexedDB before any network call |
| 2 | **No duplicates** | Client-generated UUIDs + server `UNIQUE` constraint |
| 3 | **At-least-once delivery** | Queue + retry with exponential backoff |
| 4 | **Truthful state** | UI never says "synced" unless the server confirmed |
| 5 | **Full auditability** | Every event logged in `report_history` |

---

## Key Features

### Field Worker

- ✅ Create reports while offline
- ✅ Reports persist across page refresh and browser restart
- ✅ Automatic background sync when connectivity returns
- ✅ Manual "Sync Now" trigger
- ✅ Clear sync state badges (Pending / Syncing / Synced / Failed)
- ✅ View individual reports and their full history
- ✅ Retry failed synchronizations
- ✅ Client-side form validation

### Coordinator

- ✅ View all submitted reports
- ✅ Filter by status, priority, category, and free text
- ✅ Assign reports to teams
- ✅ Progress reports through a defined workflow
- ✅ Resolve or reject with reason
- ✅ Reopen resolved or rejected reports
- ✅ Review the complete audit history

### System

- ✅ Offline-first persistence via IndexedDB
- ✅ Idempotent server-side sync endpoint
- ✅ Enforced state machine
- ✅ Automated history logging
- ✅ Retry with exponential backoff + jitter
- ✅ Interrupted sync recovery
- ✅ Permanent vs transient failure distinction
- ✅ Server-side observability (`sync_log`)
- ✅ Comprehensive test suite (63 tests)

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router 6, Vite 5 |
| **Offline Storage** | IndexedDB (via Dexie.js) |
| **Backend** | Node.js 18+, Express.js |
| **Validation** | Zod |
| **Database** | MySQL 8 (via MAMP) |
| **Backend Testing** | Jest + Supertest |
| **Frontend Testing** | Vitest + Testing Library |
| **API Testing** | curl / Postman |
| **Version Control** | Git + GitHub |
| **Editor** | Visual Studio Code |

---

## Architecture

### High-Level

### Components

| Layer | Component | Responsibility | Technology |
|---|---|---|---|
| **Client** | UI Layer | Forms, lists, detail views, badges | React + React Router |
| **Client** | State Layer | Reactive data subscriptions | Dexie `useLiveQuery` |
| **Client** | Offline Storage | Persist reports, history, sync queue | IndexedDB via Dexie |
| **Client** | Sync Engine | Queue processing, retry, recovery | Custom module |
| **Client** | Connectivity Monitor | Online/offline detection | `navigator.onLine` + health ping |
| **Client** | Validation Layer | Client-side form validation | Custom validators |
| **Server** | REST API | HTTP endpoints | Express |
| **Server** | Validation Middleware | Reject invalid input | Zod |
| **Server** | Business Logic | Status rules, transitions | Service modules |
| **Server** | Idempotency Layer | Prevent duplicate records | `UNIQUE` key + transactional upsert |
| **Server** | History Logger | Append-only audit log | `report_history` writes |
| **Server** | Error Handler | Consistent error responses | Centralized middleware |
| **Database** | Persistent Storage | Reports, history, sync log | MySQL 8 (InnoDB) |

### Synchronization States

| State | Description | UI Badge |
|---|---|---|
| `PENDING` | Saved locally, waiting to sync | 🟡 Pending |
| `SYNCING` | Request in flight | 🔵 Syncing |
| `SYNCHRONIZED` | Server confirmed receipt | 🟢 Synced |
| `FAILED` | Max retries exceeded or permanent error | 🔴 Failed |

### Design Principles

| Principle | Application |
|---|---|
| **Offline-first** | All writes go to IndexedDB before any network call |
| **Idempotency** | Client UUIDs + server `UNIQUE` constraint |
| **Single responsibility** | Each module handles one concern |
| **Consistent contracts** | All responses use the same envelope |
| **Fail-safe** | DB down → 503; unknown route → 404 |
| **Observability** | Health endpoint + `sync_log` table |
| **Configuration via env** | No hardcoded secrets |
| **Append-only audit** | History never modified or deleted |

### Database Tables

| Table | Purpose | Key Constraint |
|---|---|---|
| `reports` | Core entity — one row per report | `UNIQUE (client_id)` |
| `report_history` | Append-only audit log | `FOREIGN KEY (report_id)` |
| `sync_log` | Server-side sync observability | Indexes on `client_id`, `event` |

### Client Storage (IndexedDB)

| Store | Primary Key | Purpose |
|---|---|---|
| `reports` | `clientId` | Local report copies + sync state |
| `history` | `id` | Local history cache (unsynced events) |
| `syncQueue` | `clientId` | Pending sync items with retry metadata |


## Quick Start

Follow these steps in order. Total setup time: **~10 minutes**.

### Prerequisites

Before starting, install the following:

| Tool | Minimum Version | Purpose |
|---|---|---|
| **Node.js** | 18.x | Backend runtime + build tooling |
| **npm** | 9.x | Package manager (comes with Node) |
| **MAMP** | latest | Local MySQL server |
| **Git** | any recent | Version control |

**Verify your setup:**

```bash
node -v      # → v18.x.x or newer
npm -v       # → 9.x.x or newer
git --version # → git version 2.x.x
