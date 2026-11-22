# Design Doc: Cloudflare Native Backend (D1 & R2) with Email Authentication & Stylized Ingredient Library

**Date:** 2026-11-22  
**Status:** Approved  
**Author:** Antigravity & User  
**Target Architecture:** Cloudflare Pages Functions + Cloudflare D1 + Cloudflare R2 + Web Crypto Email Auth  

---

## 1. Intent & Purpose

Transform **"My Cookbook"** into a connected, multi-device kitchen companion with **Email Sign-In** while keeping its instant offline-first speed. The app will sync recipes, meal plans, and grocery checklists to a native **Cloudflare D1** SQL database, authenticate users via a lightweight, secure Cloudflare email session engine, and store user recipe photos and a curated library of **stylized, optimized ingredient illustrations** in a dedicated **Cloudflare R2** bucket with zero egress fees.

---

## 2. Selected Architecture: Native Cloudflare Email Auth & Offline-First Sync

- **Authentication (Email Sign-In):**
  - Native authentication powered directly by Cloudflare Pages Functions (`/api/auth/*`) and D1 (`users`, `sessions` tables).
  - Secure password hashing using the native Web Crypto API (PBKDF2 with SHA-256 and cryptographic salts).
  - Clean Email + Password signup and login UI integrated into the app's sync settings.
- **Data Isolation:**
  - Every D1 table is partitioned by `user_id`. Each authenticated user accesses strictly their own recipes, meal plans, and grocery lists.
- **Local-First Speed & Background Sync:**
  - The app continues to read from and write to browser **IndexedDB** instantly with zero network latency.
  - When online, the background sync engine pushes dirty local records to Cloudflare Pages Functions (`POST /api/sync`) and merges remote changes into IndexedDB using timestamp reconciliation (`updated_at` + soft-deletion flags `deleted_at`).
- **Asset Storage & Caching:** 
  - Recipe photos are compressed client-side to WebP (<300 KB) and stored in R2 under `/recipes/{userId}/`.
  - Common ingredients display charming, stylized vector illustrations stored in R2 under `/ingredients/` and cached locally via Service Worker / Cache API.

---

## 3. Architecture & Infrastructure

### 3.1 Cloudflare Resources
1. **D1 Database:** `my-cookbook-db`
   - Production SQL database managed via Wrangler.
   - Bound to Pages Functions via `env.DB`.
2. **R2 Bucket:** `my-cookbook-assets`
   - Dedicated bucket for:
     - `/ingredients/` - Stylized ingredient icons (e.g., `flour.svg`, `butter.svg`, `berries.svg`, `eggs.svg`, `milk.svg`, `cinnamon.svg`, `garlic.svg`, `maple-syrup.svg`, `pasta.svg`, etc.).
     - `/recipes/{userId}/` - User-uploaded recipe photos.
   - Seeded via Wrangler with handcrafted vector illustrations matching the Strawberry Milk & Butter palette.
   - Bound to Pages Functions via `env.BUCKET`.
3. **Cloudflare Pages Functions:**
   - Serverless endpoints deployed inside `functions/api/`:
     - `POST /api/auth/register`: Create user account with email & password hash.
     - `POST /api/auth/login`: Authenticate email & password, issue session bearer token.
     - `GET /api/auth/me`: Verify active session and return user profile.
     - `POST /api/auth/logout`: Invalidate session.
     - `POST /api/sync`: Batch pushes local changes and pulls updated remote rows for the authenticated `user_id`.
     - `POST /api/upload`: Receives pre-compressed WebP recipe images and streams directly to R2.
     - `GET /api/assets/*`: Public CDN proxy serving R2 images with long-lived Cache-Control (`public, max-age=31536000, immutable`).

---

## 4. Database Schema (D1 SQL)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prep_time INTEGER NOT NULL DEFAULT 0,
  cook_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  hero_image_url TEXT,
  categories TEXT, -- JSON array of strings
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_recipes_user_sync ON recipes(user_id, updated_at);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  section TEXT,
  ingredient_key TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Instructions / Steps table
CREATE TABLE IF NOT EXISTS instructions (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  instruction_text TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Meal Plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  recipe_id TEXT,
  custom_title TEXT,
  servings REAL NOT NULL DEFAULT 1,
  servings_multiplier REAL NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_sync ON meal_plans(user_id, updated_at);

-- Groceries table
CREATE TABLE IF NOT EXISTS groceries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  category TEXT NOT NULL,
  is_checked INTEGER NOT NULL DEFAULT 0,
  is_manual INTEGER NOT NULL DEFAULT 0,
  ingredient_key TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_groceries_user_sync ON groceries(user_id, updated_at);
```

---

## 5. Stylized Ingredient Illustration Library

A set of 16 handcrafted, cohesive culinary illustrations aligned with the **Strawberry Milk & Butter** palette (`#4A2C2A`, `#FFE599`, `#FF8FA3`, `#FFF5F7`):
- `flour`: cute flour bag with wheat sprig
- `sugar`: sugar bowl / spoon
- `butter`: pat of butter with melting droplet
- `eggs`: two brown/cream eggs, one cracked
- `milk`: glass bottle / jug of strawberry or fresh milk
- `berries`: bunch of blueberries and strawberries
- `cinnamon`: cinnamon stick / spice shaker
- `garlic`: plump garlic bulb
- `pasta`: bow-tie / ribbon pasta
- `maple-syrup`: amber syrup bottle with leaf seal
- `salt`: shaker / pinch bowl
- `baking-powder`: retro powder tin
- `vanilla`: vanilla bean & flower
- `olive-oil`: olive oil bottle with olive twig
- `chocolate`: chocolate bar squares
- `cheese`: wedge of cheese with holes

**Ingredient Icon Resolver (`src/utils/ingredientIconResolver.ts`):** Automatically maps ingredient text (e.g. *"1/2 cup Blueberries"*, *"fresh garlic cloves"*, *"unsalted butter"*) to its matching stylized asset key and CDN URL, with a gentle fallback.

---

## 6. Verification Plan

1. **D1 & R2 Provisioning:**
   - Execute `wrangler d1 create my-cookbook-db` and initialize schema.
   - Execute `wrangler r2 bucket create my-cookbook-assets`.
   - Seed initial stylized ingredient asset pack to R2 via `wrangler r2 object put`.
2. **Auth & Sync API Verification:**
   - Test user registration and login (`POST /api/auth/register`, `POST /api/auth/login`).
   - Test `/api/sync` for push and pull reconciliation scoped to the user.
   - Test `/api/assets/ingredients/*` serving from R2.
3. **UI & Offline Verification:**
   - Test Email Sign-In / Sign-Up form in Settings.
   - Verify ingredient cards display their matching stylized illustrations.
   - Verify recipe photo upload stores asset in R2.
   - Test offline mode: create/check off grocery items and confirm they sync automatically upon reconnection.
