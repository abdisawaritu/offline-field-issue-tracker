# Offline Field Issue Tracker

A full-stack application for field workers to report infrastructure problems offline and synchronize them when connectivity returns.

## Overview

Field workers in remote areas often have unreliable internet. This application allows them to:
- Create issue reports offline (persisted locally)
- Synchronize reports automatically when online
- Avoid duplicate submissions on retry
- Track report status through a defined workflow

Coordinators can review, assign, and resolve reports.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + React Router |
| Offline Storage | IndexedDB (via Dexie) |
| Backend | Node.js + Express |
| Database | MySQL (via MAMP) |
| Testing | Jest + Supertest (backend), Vitest (frontend) |

## Project Structure
