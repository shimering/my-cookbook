---
name: offline-sync-engine
description: >-
  Runbook and architectural guide for Dexie.js (IndexedDB) offline storage,
  bidirectional sync protocol with Cloudflare Pages Functions (/api/sync), and testing.
---

# Offline-First Sync Engine Runbook

This skill describes how data persistence and sync reconciliation work between the local browser storage (IndexedDB via Dexie.js) and the Cloudflare D1 backend.

## Architecture

1. **Local State (IndexedDB / Dexie.js):**
   - Implemented in `src/db/cookbookDb.ts`.
   - Primary tables: `recipes`, `mealPlans`, `groceryItems`.
   - Instant local CRUD operations without blocking on network requests.

2. **Sync Service (`src/services/cloudflareSyncService.ts`):**
   - Endpoints: `POST /api/sync` (handled by `functions/api/sync.ts`).
   - Push: Collects dirty records modified locally since the last sync cursor.
   - Pull: Fetches remote updates where `updated_at > last_sync_time`.
   - Reconciliation: Last-Write-Wins based on timestamps (`updatedAt` / `updated_at`), with soft-deletion handling via `deletedAt` / `deleted_at`.

3. **Authentication (`src/services/cloudflareAuthService.ts`):**
   - Stores user token in local storage / session state.
   - Attaches `Authorization: Bearer <token>` to sync and upload requests.

## Unit Testing & Verification

Tests use Vitest with `fake-indexeddb` to mock Dexie in Node environments:

```bash
# Run all unit tests
npx.cmd vitest run

# Run specific sync test suite
npx.cmd vitest run src/services/__tests__/syncPayload.test.ts
```

## Adding New Syncable Entities

When adding new tables or schema changes:
1. Update `CookbookDatabase` in `src/db/cookbookDb.ts` (increment version if changing table schemas).
2. Update TypeScript interfaces in `src/types/index.ts`.
3. Add corresponding table in `migrations/0001_initial_schema.sql` (or create a new migration).
4. Update `functions/api/sync.ts` and `src/services/cloudflareSyncService.ts` to include the entity in the sync payload.
5. Add unit tests under `src/services/__tests__/`.
