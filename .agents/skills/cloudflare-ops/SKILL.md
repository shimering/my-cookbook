---
name: cloudflare-ops
description: >-
  Operational runbook for Cloudflare D1 database migrations, Pages Functions,
  and R2 asset storage management for the My Cookbook application.
---

# Cloudflare Operations Runbook for My Cookbook

This skill provides step-by-step procedures and CLI commands for managing Cloudflare backend resources configured in `wrangler.toml`.

## Infrastructure Overview

- **D1 Database:** `my-cookbook-db` (Database ID: `af2eb04c-b6b7-4e88-abfe-5f1a0d77be41`, Binding: `DB`)
- **R2 Bucket:** `my-cookbook-assets` (Binding: `BUCKET`)
- **Functions:** Cloudflare Pages Functions under `functions/api/`

## 1. D1 Database Migrations & Queries

### Applying Migrations Locally
To test migrations against a local SQLite replica:
```bash
npx.cmd wrangler d1 execute my-cookbook-db --local --file=./migrations/0001_initial_schema.sql
```

### Applying Migrations to Remote / Production
To apply migrations to the remote Cloudflare D1 database:
```bash
npx.cmd wrangler d1 execute my-cookbook-db --remote --file=./migrations/0001_initial_schema.sql
```

### Inspecting D1 Tables
Execute SQL queries directly:
```bash
# Check tables in local D1
npx.cmd wrangler d1 execute my-cookbook-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check tables in remote D1
npx.cmd wrangler d1 execute my-cookbook-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## 2. R2 Asset Management

- Curated ingredient SVG icons reside in R2 under `/ingredients/`.
- User recipe photos reside under `/recipes/{userId}/`.

### Generating and Seeding Ingredient Assets
To regenerate SVG assets and sync them to R2:
```bash
# Generate SVGs
node scripts/generate-ingredient-svgs.mjs

# Seed SVGs to R2 bucket
node scripts/seed-r2-ingredients.mjs
```

## 3. Local Full-Stack Development

Run the frontend together with Cloudflare Pages Functions locally using Wrangler:
```bash
npx.cmd wrangler pages dev dist --compatibility-date=2026-11-22 --compatibility-flags=nodejs_compat --d1=DB=my-cookbook-db --r2=BUCKET=my-cookbook-assets
```
Or for standard Vite frontend development:
```bash
npm.cmd run dev
```
