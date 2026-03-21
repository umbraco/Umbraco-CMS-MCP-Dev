---
name: release
description: Create a release branch from dev with version bumps and changelog. Use when the user wants to prepare a new release, bump a version, or cut a release. Triggers on phrases like "release 17.1.2", "cut a release", "prepare a release", "version bump", or just "/release".
---

# Release

Create a release branch from `dev` with version bumps and a structured changelog PR.

## Arguments

The skill accepts an optional version argument (e.g., `/release 17.1.2`).

If no version is provided, read the current version from `package.json` and suggest the next patch version (increment the last number). Confirm with the user before proceeding.

## Instructions

### 1. Pre-flight checks

Before anything else, verify the workspace is ready:

```bash
git fetch origin
git status          # must be clean — warn and stop if uncommitted changes
git checkout dev
git pull
```

Check that `dev` is not behind `main`:
```bash
git log dev..origin/main --oneline
```
If `main` has commits not in `dev`, warn the user — they may need to merge main into dev first.

### 2. Determine the version

- If a version argument is provided, use it
- Otherwise, read `package.json` version, increment the patch number, and confirm with the user

### 3. Create the release branch

```bash
git checkout -b release/<version>
```

Branch naming convention: `release/X.Y.Z` (e.g., `release/17.1.2`)

### 4. Update version in these files

All three files must be updated — the old version appears in each:

1. **`package.json`** — the `"version"` field (line 3)
2. **`server.json`** — TWO version fields, both must match:
   - Top-level `"version"` (around line 9)
   - Inside `packages[0].version` (around line 14)
3. **`package-lock.json`** — run `npm install --package-lock-only` to sync automatically

### 5. Build and verify

Run `npm run build` to confirm the project compiles cleanly. If it fails, fix the issue before continuing.

### 6. Commit the version bump

Commit message:
```
Bump version to <version>
```

### 7. Generate the changelog

Use `git log` to find all commits on `dev` since the last release merged to main:

```bash
git log origin/main..dev --oneline
```

Write a structured changelog summarising the changes. Group related items and focus on what matters to users. Follow this format from previous releases:

```
Release/<version>

<Category 1>
- Change description
- Change description

<Category 2>
- Change description
```

Example from 17.1.0:
```
Release/17.1.0

SDK Migration
- Migrated to @umbraco-cms/mcp-server-sdk npm package
- Updated to @modelcontextprotocol/sdk v1.25.1 with new SDK patterns

Readonly Mode
- Added UMBRACO_READONLY config option to restrict server to read-only operations

Tools
- Added create-media-folder tool for media library organisation
- Improved tool descriptions and property editor templates
```

### 8. Push and create PR

- Push the branch to origin
- Create a PR targeting `dev` with:
  - Title: `Release/<version>`
  - Body: the changelog from step 7

### 9. Remind the user about the two-PR flow

This project uses a two-PR release process:

1. **PR 1** (just created): `release/<version>` → `dev` — version bump + changelog
2. **PR 2** (after PR 1 merges): `dev` → `main` — this is the actual release

Merging to `main` triggers the npm publish via GitHub Actions, so the second PR is what makes the release live.

## Files touched

- `package.json` (version field)
- `server.json` (2 version fields)
- `package-lock.json` (auto-updated via npm install)
