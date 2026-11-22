# Agent Guidelines for My Cookbook

Welcome to the **My Cookbook** project! This repository contains a modern, offline-first kitchen companion web application.

## Stack Overview
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Local Storage:** Dexie.js (IndexedDB) with `dexie-react-hooks`.
- **Backend & Cloud:** Cloudflare Pages Functions, Cloudflare D1 (SQLite), Cloudflare R2 (asset storage), Wrangler CLI.
- **Linter & Test Runner:** Oxlint, Vitest, `fake-indexeddb`.

## Development Commands (Windows)
Because this environment runs on Windows PowerShell, invoke CLI binaries using `.cmd` or via npm scripts:
- **Dev Server:** `npm.cmd run dev`
- **Build:** `npm.cmd run build`
- **Linting:** `npm.cmd run lint`
- **Unit Tests:** `npx.cmd vitest run` or `npm.cmd test`
- **Wrangler / D1:** `npx.cmd wrangler ...`

## Architectural Conventions
1. **Offline-First:** All mutations must immediately succeed in local Dexie IndexedDB. Network synchronization is asynchronous and handled in the background by `cloudflareSyncService`.
2. **Component Structure:** Keep UI components modular within `src/components/`, organized by feature domain (`planner/`, `groceries/`, `recipe/`, `common/`).
3. **Styling:** Follow the cozy "Strawberry Milk & Butter" aesthetic with Tailwind CSS classes.
4. **Testing:** New utility functions and sync logic must be accompanied by Vitest tests in `__tests__/` directories.
