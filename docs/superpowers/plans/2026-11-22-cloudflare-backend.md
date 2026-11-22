# Cloudflare Native Backend (D1 & R2) with Email Auth & Stylized Ingredients Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a complete native Cloudflare backend for "My Cookbook", featuring Cloudflare D1 SQL database sync, Cloudflare R2 object storage for recipe photos, native Web Crypto email authentication, and a curated library of 16 stylized, optimized ingredient illustrations.

**Architecture:** Cloudflare Pages Functions (`functions/api/*`) bind directly to Cloudflare D1 (`env.DB`) and R2 (`env.BUCKET`). A client-side sync service in React/TypeScript synchronizes local browser IndexedDB data bidirectionally with D1 whenever online, while pre-compressed WebP recipe images and stylized ingredient SVGs are stored and served from R2 with zero bandwidth egress costs.

**Tech Stack:** Cloudflare Pages Functions, Cloudflare D1 (SQLite), Cloudflare R2 (S3-compatible object storage), Web Crypto API (PBKDF2-SHA256), TypeScript, React 19, Vite, Tailwind CSS v4.

**Spec:** [docs/superpowers/specs/2026-11-22-cloudflare-backend-design.md](file:///d:/AI%20Apps/Kitchen%20app/docs/superpowers/specs/2026-11-22-cloudflare-backend-design.md)

## Global Constraints

- Must preserve 100% offline-first functionality: the app must work and display recipes seamlessly without network connectivity.
- Passwords must be hashed using PBKDF2 with SHA-256 (minimum 100,000 iterations) and cryptographically secure random salts via the native Web Crypto API.
- All D1 queries must be parameterized to prevent SQL injection.
- Ingredient illustrations must adhere to the "Strawberry Milk & Butter" aesthetic: `#4A2C2A` lines, `#FFE599` butter accents, `#FF8FA3` blush pink, and `#FFF5F7` soft blush.
- Egress costs must remain zero using Cloudflare native bindings.

## Review Focus

1. **Offline-to-online transition with queued base64 images:** Ensure recipe photos taken while offline upload cleanly to R2 upon reconnection and swap the local base64 URL with the R2 CDN URL.
2. **Session expiration handling:** When a session token expires, sync attempts must fail gracefully without destroying local IndexedDB data and prompt the user to re-authenticate.
3. **Ingredient name normalization:** Ensure pluralization and prep modifiers (e.g. *"fresh blueberries"*, *"all-purpose flour"*, *"salted butter, softened"*) resolve to their canonical stylized asset key.
4. **Soft-deletion synchronization:** Verify that recipes, meal plans, or grocery items deleted on one device propagate soft-deletions (`deleted_at`) to other devices without resurrecting old records.
5. **Cold start performance:** Ensure R2 asset streaming uses immutable caching headers (`public, max-age=31536000, immutable`) to minimize function invocations.

---

### Task 1: Cloudflare D1 & R2 Provisioning & Wrangler Configuration

**Files:**
- Create: `wrangler.toml`
- Create: `migrations/0001_initial_schema.sql`
- Modify: `package.json`

**Interfaces:**
- Consumes: Cloudflare account ID `e8503e5d39b5497d79fbedb738cfa705`
- Produces: D1 database `my-cookbook-db`, R2 bucket `my-cookbook-assets`, and configuration bindings `DB` and `BUCKET`.

- [ ] **Step 1: Write initial D1 schema migration**
  Write `migrations/0001_initial_schema.sql` defining `users`, `sessions`, `recipes`, `ingredients`, `instructions`, `meal_plans`, and `groceries` tables with indexes on `(user_id, updated_at)`.
- [ ] **Step 2: Create D1 database and R2 bucket via Wrangler**
  Run `npx.cmd wrangler d1 create my-cookbook-db` and `npx.cmd wrangler r2 bucket create my-cookbook-assets`.
- [ ] **Step 3: Create `wrangler.toml`**
  Configure project `my-cookbook`, Pages static directory `dist`, D1 binding `DB` with database ID, and R2 binding `BUCKET` with bucket name `my-cookbook-assets`.
- [ ] **Step 4: Apply migration to D1**
  Run `npx.cmd wrangler d1 execute my-cookbook-db --remote --file=migrations/0001_initial_schema.sql`.
- [ ] **Step 5: Verify tables created**
  Run `npx.cmd wrangler d1 execute my-cookbook-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"` and confirm all tables exist.
- [ ] **Step 6: Commit**
  `git add wrangler.toml migrations/ package.json && git commit -m "chore(infra): configure Cloudflare D1 and R2 bindings with initial schema"`

---

### Task 2: Stylized Ingredient Illustration Library & Resolver

**Files:**
- Create: `public/ingredients/*.svg` (16 curated vector illustrations)
- Create: `scripts/seed-r2-ingredients.mjs`
- Create: `src/utils/ingredientIconResolver.ts`
- Test: `src/utils/__tests__/ingredientIconResolver.test.ts`

**Interfaces:**
- Produces: `getIngredientIcon(name: string): { key: string; url: string; fallbackText: string } | null`
- Produces: 16 SVG assets seeded to R2 bucket under `ingredients/`.

- [ ] **Step 1: Write the failing unit tests for ingredient icon resolver**
  Test variations like `"2 cups All-Purpose Flour"` $\rightarrow$ `"flour"`, `"1/2 cup sweet blueberries"` $\rightarrow$ `"berries"`, `"2 cloves garlic, minced"` $\rightarrow$ `"garlic"`, `"kosher salt"` $\rightarrow$ `"salt"`.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx.cmd vitest run src/utils/__tests__/ingredientIconResolver.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Create 16 stylized SVG ingredient assets**
  Create cohesive, beautiful SVG icons in `public/ingredients/`:
  `flour.svg`, `sugar.svg`, `butter.svg`, `eggs.svg`, `milk.svg`, `berries.svg`, `cinnamon.svg`, `garlic.svg`, `pasta.svg`, `maple-syrup.svg`, `salt.svg`, `baking-powder.svg`, `vanilla.svg`, `olive-oil.svg`, `chocolate.svg`, `cheese.svg` using the palette (`#4A2C2A`, `#FFE599`, `#FF8FA3`, `#FFF5F7`).
- [ ] **Step 4: Implement `ingredientIconResolver.ts`**
  Map ingredient strings with keyword matching and stem analysis to the canonical ingredient keys and R2 `/api/assets/ingredients/{key}.svg` URLs (with `/ingredients/{key}.svg` local bundle fallback).
- [ ] **Step 5: Run tests to verify they pass**
  Run `npx.cmd vitest run src/utils/__tests__/ingredientIconResolver.test.ts`. Expected: PASS.
- [ ] **Step 6: Create and run R2 seeding script**
  Write `scripts/seed-r2-ingredients.mjs` using `@aws-sdk/client-s3` or `wrangler r2 object put` to upload all 16 SVGs to the `my-cookbook-assets` R2 bucket under `ingredients/`. Execute the script.
- [ ] **Step 7: Commit**
  `git add public/ingredients/ scripts/ src/utils/ && git commit -m "feat(assets): add 16 stylized ingredient SVGs, resolver, and R2 seeding script"`

---

### Task 3: Cloudflare Pages Functions - Authentication API (`/api/auth/*`)

**Files:**
- Create: `functions/utils/crypto.ts`
- Create: `functions/utils/auth.ts`
- Create: `functions/api/auth/register.ts`
- Create: `functions/api/auth/login.ts`
- Create: `functions/api/auth/me.ts`
- Create: `functions/api/auth/logout.ts`
- Test: `src/services/__tests__/crypto.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/auth/register` (body: `{ email, password }` $\rightarrow$ `{ user: { id, email }, token }`)
  - `POST /api/auth/login` (body: `{ email, password }` $\rightarrow$ `{ user: { id, email }, token }`)
  - `GET /api/auth/me` (header: `Authorization: Bearer <token>` $\rightarrow$ `{ user: { id, email } }`)
  - `POST /api/auth/logout` (header: `Authorization: Bearer <token>` $\rightarrow$ `{ success: true }`)
  - `authenticateRequest(request, env)`: extracts user from session token.

- [ ] **Step 1: Write failing test for crypto password hashing and verification**
  Test PBKDF2 hashing generates unique salt, produces consistent hash for same password + salt, and validates matches.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx.cmd vitest run src/services/__tests__/crypto.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `functions/utils/crypto.ts` and `functions/utils/auth.ts`**
  Use native Web Crypto API (`crypto.subtle`) for PBKDF2-SHA256, salt generation, and constant-time string comparison.
- [ ] **Step 4: Implement `/api/auth/register.ts` and `/api/auth/login.ts`**
  Validate email format, check existing user in D1, insert user, create 30-day session in `sessions` table, return session token.
- [ ] **Step 5: Implement `/api/auth/me.ts` and `/api/auth/logout.ts`**
  Extract Bearer token, query valid non-expired session from D1, return user info or delete session.
- [ ] **Step 6: Verify crypto unit tests pass**
  Run `npx.cmd vitest run src/services/__tests__/crypto.test.ts`. Expected: PASS.
- [ ] **Step 7: Commit**
  `git add functions/ src/services/__tests__/ && git commit -m "feat(api): implement Cloudflare native email authentication endpoints"`

---

### Task 4: Cloudflare Pages Functions - R2 Asset CDN & Photo Upload

**Files:**
- Create: `functions/api/assets/[...path].ts`
- Create: `functions/api/upload.ts`

**Interfaces:**
- Produces:
  - `GET /api/assets/*` (streams object from `env.BUCKET`, sets `Content-Type`, `ETag`, and `Cache-Control: public, max-age=31536000, immutable`)
  - `POST /api/upload` (header: `Authorization: Bearer <token>`, body: `multipart/form-data` with `file: Blob` $\rightarrow$ `{ url: string, key: string }`)

- [ ] **Step 1: Implement `functions/api/assets/[...path].ts`**
  Extract relative path, fetch object from `env.BUCKET.get(key)`. If not found, return 404. Return body with caching headers and appropriate MIME type (SVG, WebP, PNG, JPEG).
- [ ] **Step 2: Implement `functions/api/upload.ts`**
  Authenticate session token via `authenticateRequest`. Parse multipart form data, validate file size (<5MB) and type (`image/webp`, `image/jpeg`, `image/png`). Stream to `env.BUCKET.put(key, stream)` under `recipes/${user.id}/${randomId}.webp`. Return public URL `/api/assets/recipes/${user.id}/${randomId}.webp`.
- [ ] **Step 3: Verify with local type-check**
  Run `npx.cmd tsc --noEmit`. Expected: 0 errors.
- [ ] **Step 4: Commit**
  `git add functions/api/assets/ functions/api/upload.ts && git commit -m "feat(api): add R2 asset CDN proxy and authenticated recipe photo upload endpoint"`

---

### Task 5: Cloudflare Pages Functions - Two-Way Sync Engine (`/api/sync`)

**Files:**
- Create: `functions/api/sync.ts`
- Test: `src/services/__tests__/syncPayload.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/sync` (header: `Authorization: Bearer <token>`, body: `{ recipes: Recipe[], meal_plans: MealPlanEntry[], groceries: GroceryItem[], lastSyncedAt: number }` $\rightarrow$ `{ recipes: Recipe[], meal_plans: MealPlanEntry[], groceries: GroceryItem[], serverTime: number }`)

- [ ] **Step 1: Write unit test for sync payload reconciliation schema**
  Verify serialization and deserialization of recipes (with ingredients and instructions), meal plans, and grocery items.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx.cmd vitest run src/services/__tests__/syncPayload.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `functions/api/sync.ts`**
  - Authenticate user from session token.
  - In a D1 batch transaction:
    - Upsert recipes where `incoming.updated_at > existing.updated_at`. If incoming has `deleted_at`, mark soft-delete. Replace child ingredients and instructions atomically.
    - Upsert meal plans where `incoming.updated_at > existing.updated_at`.
    - Upsert grocery items where `incoming.updated_at > existing.updated_at`.
  - Query all records for `user_id` where `updated_at > lastSyncedAt`.
  - Return `{ recipes, mealPlans, groceries, serverTime: Date.now() }`.
- [ ] **Step 4: Run unit tests to verify they pass**
  Run `npx.cmd vitest run src/services/__tests__/syncPayload.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  `git add functions/api/sync.ts src/services/__tests__/ && git commit -m "feat(api): implement Cloudflare D1 two-way sync endpoint"`

---

### Task 6: Client Cloudflare Sync Service & Media Pipeline

**Files:**
- Create: `src/services/cloudflareAuthService.ts`
- Create: `src/services/cloudflareSyncService.ts`
- Modify: `src/db/recipeDb.ts`

**Interfaces:**
- Consumes: `/api/auth/*`, `/api/sync`, `/api/upload`
- Produces:
  - `cloudflareAuth`: `login(email, password)`, `register(email, password)`, `logout()`, `getUser()`, `onAuthStateChange(cb)`
  - `cloudflareSync`: `syncNow()`, `startAutoSync()`, `stopAutoSync()`, `uploadRecipeImage(blob)`

- [ ] **Step 1: Implement `src/services/cloudflareAuthService.ts`**
  Store active session token and user info in `localStorage`. Expose reactive auth listener for UI components.
- [ ] **Step 2: Implement offline media queue in `src/services/cloudflareSyncService.ts`**
  Before syncing recipe records, inspect local recipes with base64 data URLs in `heroImage` or step photos. If online, convert base64 to Blob, upload via `POST /api/upload`, and update IndexedDB with the permanent R2 CDN URL.
- [ ] **Step 3: Implement two-way sync loop**
  Pull local dirty records from IndexedDB, push to `POST /api/sync`, and apply server changes to IndexedDB without triggering loop conflicts.
- [ ] **Step 4: Add online/offline event listeners**
  Automatically trigger `syncNow()` when `window.addEventListener('online', ...)` fires.
- [ ] **Step 5: Commit**
  `git add src/services/cloudflareAuthService.ts src/services/cloudflareSyncService.ts src/db/recipeDb.ts && git commit -m "feat(sync): add client Cloudflare auth and background sync service with offline media upload"`

---

### Task 7: UI Integration (Email Sign-In & Stylized Ingredient Badges)

**Files:**
- Modify: `src/components/settings/SyncBackupModal.tsx`
- Modify: `src/components/recipes/RecipeDetailView.tsx`
- Modify: `src/components/groceries/GroceryListView.tsx`
- Modify: `src/components/layout/TopHeader.tsx`

**Interfaces:**
- Consumes: `cloudflareAuth`, `cloudflareSync`, `getIngredientIcon`
- Produces: Email Sign-In / Account status in settings, cute stylized ingredient icons in recipe details and grocery checklist.

- [ ] **Step 1: Update `TopHeader.tsx`**
  Display cloud sync icon indicator based on Cloudflare auth and sync status (green sync dot when authenticated and up to date, subtle spinner during active sync).
- [ ] **Step 2: Update `SyncBackupModal.tsx`**
  - Add **Cloudflare Email Account** section:
    - If logged out: tabbed Email Sign-In / Sign-Up form with error feedback and validation.
    - If logged in: displays "Connected as {email}", last synced timestamp, "Sync Now" button, and "Log Out".
    - Retain JSON Export / Import buttons below for offline backup.
- [ ] **Step 3: Add stylized ingredient badges in `RecipeDetailView.tsx`**
  Next to each ingredient row in the detail view, render a small (28x28px) stylized ingredient illustration thumbnail resolved via `getIngredientIcon(ing.name)`.
- [ ] **Step 4: Add stylized ingredient badges in `GroceryListView.tsx`**
  In the grocery list aisle categories, render the matching stylized ingredient illustration next to each checklist item.
- [ ] **Step 5: Test UI in dev server**
  Run `npm.cmd run build` to confirm zero TypeScript/Vite template errors.
- [ ] **Step 6: Commit**
  `git add src/components/ && git commit -m "feat(ui): add Cloudflare Email Sign-In modal and stylized ingredient badges in recipe and grocery views"`

---

### Task 8: End-to-End Build, Verification & Production Deployment

**Files:**
- All created and modified files.

- [ ] **Step 1: Run all automated tests**
  Run `npx.cmd vitest run`. All tests must pass.
- [ ] **Step 2: Production build verification**
  Run `npm.cmd run build`. Must compile cleanly with 0 TypeScript errors.
- [ ] **Step 3: Push changes to GitHub `main`**
  Run `git push origin main`.
- [ ] **Step 4: Verify Cloudflare Pages deployment**
  Run `npx.cmd wrangler pages deployment list --project-name=my-cookbook` to confirm successful deployment on Cloudflare.
- [ ] **Step 5: Manual end-to-end verification via browser**
  Navigate to `https://my-cookbook-1pu.pages.dev/`:
  1. Open Settings and register a new account via email.
  2. Verify login returns active user state and sync indicator turns active.
  3. Create a recipe with ingredients ("2 cups Flour", "1 cup Milk", "1/2 cup Blueberries") and an image. Verify stylized ingredient icons appear.
  4. Add recipe to Meal Plan and generate Grocery List. Confirm grocery items show stylized ingredient icons.
  5. Open DevTools, verify `/api/sync` and `/api/assets/*` network requests succeed.
