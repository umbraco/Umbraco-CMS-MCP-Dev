#!/usr/bin/env bash
set -euo pipefail

# Claude Code WorktreeCreate hook
# Input: JSON on stdin: { "name": "<slug>", "cwd": "<project-root>" }
# Output: worktree path on stdout (last line)

# --- Parse input ---
INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

if [ -z "$NAME" ]; then
  echo "Error: no name provided" >&2
  exit 1
fi

# Use CLAUDE_PROJECT_DIR if available, fall back to cwd, then git root
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-${CWD:-$(git rev-parse --show-toplevel)}}"

# --- Derive identifiers ---
# Directory slug: replace / with -
DIR_SLUG=$(echo "$NAME" | tr '/' '-')

# Branch name: if name contains /, use as-is (e.g. PR branch); otherwise prefix with feature/
if [[ "$NAME" == *"/"* ]]; then
  BRANCH_NAME="$NAME"
else
  BRANCH_NAME="feature/$NAME"
fi

WORKTREE_PATH="$PROJECT_DIR/.claude/worktrees/$DIR_SLUG"
DB_NAME="umbraco-mcp-cms-$DIR_SLUG"

# --- Detect base branch ---
git -C "$PROJECT_DIR" fetch origin 2>/dev/null || true

BASE_BRANCH=""
for candidate in dev main master; do
  if git -C "$PROJECT_DIR" rev-parse --verify "origin/$candidate" >/dev/null 2>&1; then
    BASE_BRANCH="origin/$candidate"
    break
  fi
done

if [ -z "$BASE_BRANCH" ]; then
  echo "Error: could not find base branch (dev, main, or master)" >&2
  exit 1
fi

echo "Base branch: $BASE_BRANCH" >&2

# --- Handle existing worktree ---
if [ -d "$WORKTREE_PATH" ]; then
  echo "Worktree already exists at $WORKTREE_PATH" >&2
  echo "$WORKTREE_PATH"
  exit 0
fi

# --- Create worktree ---
mkdir -p "$(dirname "$WORKTREE_PATH")"

# Check if branch already exists locally
if git -C "$PROJECT_DIR" rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
  echo "Using existing local branch: $BRANCH_NAME" >&2
  git -C "$PROJECT_DIR" worktree add "$WORKTREE_PATH" "$BRANCH_NAME" >&2
# Check if branch exists on remote
elif git -C "$PROJECT_DIR" rev-parse --verify "origin/$BRANCH_NAME" >/dev/null 2>&1; then
  echo "Tracking remote branch: origin/$BRANCH_NAME" >&2
  git -C "$PROJECT_DIR" worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" --track "origin/$BRANCH_NAME" >&2
else
  echo "Creating new branch: $BRANCH_NAME from $BASE_BRANCH" >&2
  git -C "$PROJECT_DIR" worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" "$BASE_BRANCH" >&2
fi

# --- Copy .env ---
if [ -f "$PROJECT_DIR/.env" ]; then
  cp "$PROJECT_DIR/.env" "$WORKTREE_PATH/.env"
  echo "Copied: .env" >&2
fi

# --- Copy demo-site (gitignored, so not in worktree by default) ---
if [ -d "$PROJECT_DIR/demo-site" ]; then
  echo "Copying demo-site to worktree..." >&2
  rsync -a \
    --exclude='bin/' \
    --exclude='obj/' \
    --exclude='umbraco/Data/*.sqlite*' \
    --exclude='umbraco/Logs/' \
    --exclude='appsettings.local.json' \
    "$PROJECT_DIR/demo-site/" "$WORKTREE_PATH/demo-site/" >&2
  echo "Copied demo-site (excluding build artifacts and data)" >&2
fi

# --- Create SQL Server database ---
echo "Creating database: $DB_NAME" >&2

# Read SA password from main worktree's appsettings.local.json
SA_PASSWORD=""
if [ -f "$PROJECT_DIR/demo-site/appsettings.local.json" ]; then
  SA_PASSWORD=$(jq -r '.ConnectionStrings.umbracoDbDSN // ""' "$PROJECT_DIR/demo-site/appsettings.local.json" | sed -n 's/.*password=\([^;]*\).*/\1/p')
fi

if [ -z "$SA_PASSWORD" ]; then
  echo "Warning: Could not read SA password from demo-site/appsettings.local.json" >&2
  echo "Skipping database creation — set up manually" >&2
else
  # Create database (ignore error if already exists)
  docker exec sql bash -c "/opt/mssql-tools*/bin/sqlcmd -S localhost -U sa -P '$SA_PASSWORD' -C -Q \"IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '$DB_NAME') CREATE DATABASE [$DB_NAME]\"" 2>/dev/null || {
    echo "Warning: Could not create database (is Docker running?)" >&2
  }

  # Write appsettings.local.json for the worktree
  mkdir -p "$WORKTREE_PATH/demo-site"
  cat > "$WORKTREE_PATH/demo-site/appsettings.local.json" <<JSONEOF
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost,1433;Database=$DB_NAME;User Id=sa;password=$SA_PASSWORD;TrustServerCertificate=True",
    "umbracoDbDSN_ProviderName": "Microsoft.Data.SqlClient"
  }
}
JSONEOF
  echo "Wrote demo-site/appsettings.local.json with database: $DB_NAME" >&2
fi

# --- Rewrite launchSettings.json to use dynamic port ---
LAUNCH_SETTINGS="$WORKTREE_PATH/demo-site/Properties/launchSettings.json"
if [ -f "$LAUNCH_SETTINGS" ]; then
  # Use jq to rewrite the applicationUrl to port 0
  jq '
    .profiles["Umbraco.Web.UI"].applicationUrl = "https://127.0.0.1:0;http://127.0.0.1:0" |
    .iisSettings.iisExpress.sslPort = 0 |
    .iisSettings.iisExpress.applicationUrl = "http://127.0.0.1:0"
  ' "$LAUNCH_SETTINGS" > "$LAUNCH_SETTINGS.tmp" && mv "$LAUNCH_SETTINGS.tmp" "$LAUNCH_SETTINGS"
  echo "Rewrote launchSettings.json to use dynamic port" >&2
fi

# --- Ensure .claude/worktrees/ is in .gitignore ---
GITIGNORE="$PROJECT_DIR/.gitignore"
if [ -f "$GITIGNORE" ] && ! grep -q '.claude/worktrees/' "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Worktree directories" >> "$GITIGNORE"
  echo ".claude/worktrees/" >> "$GITIGNORE"
  echo "Added .claude/worktrees/ to .gitignore" >&2
fi

# --- Run npm install ---
echo "Running npm install in worktree..." >&2
cd "$WORKTREE_PATH"
npm install --silent >&2 2>&1 || {
  echo "Warning: npm install failed" >&2
}

# --- Output worktree path (Claude Code reads the last line) ---
echo "$WORKTREE_PATH"
