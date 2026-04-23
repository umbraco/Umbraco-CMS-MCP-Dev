#!/usr/bin/env bash
set -euo pipefail

# Claude Code WorktreeRemove hook
# Input: JSON on stdin: { "worktree_path": "<absolute-path>" }

# --- Parse input ---
INPUT=$(cat)
WORKTREE_PATH=$(echo "$INPUT" | jq -r '.worktree_path // empty')

if [ -z "$WORKTREE_PATH" ]; then
  echo "Error: no worktree_path provided" >&2
  exit 1
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo "")}"

# --- Derive identifiers ---
# Extract slug from path: .claude/worktrees/<slug>
DIR_SLUG=$(basename "$WORKTREE_PATH")
DB_NAME="umbraco-mcp-cms-$DIR_SLUG"

echo "Removing worktree: $DIR_SLUG" >&2

# --- Kill anything rooted in or holding files in the worktree ---
# `dotnet run` + compiled `demo-site` binary + any stdio MCP probe spawned
# in the worktree can all keep the directory busy. Catch them three ways:
#   1. Anything whose argv mentions the worktree path (pgrep -f)
#   2. Anything with open file handles inside the worktree (lsof +D)
#   3. The specific demo-site binary path (covers re-parented orphans)
kill_holders() {
  local signal="$1"
  local pids
  pids=$( {
    pgrep -f "$WORKTREE_PATH" 2>/dev/null
    lsof -t +D "$WORKTREE_PATH" 2>/dev/null
    pgrep -f "$WORKTREE_PATH/demo-site/bin/" 2>/dev/null
  } | sort -u | tr '\n' ' ')
  if [ -n "$pids" ]; then
    echo "Sending $signal to: $pids" >&2
    echo "$pids" | xargs kill -"$signal" 2>/dev/null || true
    return 0
  fi
  return 1
}

if kill_holders TERM; then
  sleep 2
  kill_holders KILL >/dev/null 2>&1 || true
  sleep 1
fi

# --- Drop database ---
echo "Dropping database: $DB_NAME" >&2

SA_PASSWORD=""
if [ -n "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/demo-site/appsettings.local.json" ]; then
  SA_PASSWORD=$(jq -r '.ConnectionStrings.umbracoDbDSN // ""' "$PROJECT_DIR/demo-site/appsettings.local.json" | sed -n 's/.*password=\([^;]*\).*/\1/p')
fi

if [ -n "$SA_PASSWORD" ]; then
  docker exec sql bash -c "/opt/mssql-tools*/bin/sqlcmd -S localhost -U sa -P '$SA_PASSWORD' -C -Q \"
    IF EXISTS (SELECT name FROM sys.databases WHERE name = '$DB_NAME')
    BEGIN
      ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
      DROP DATABASE [$DB_NAME];
    END
  \"" 2>/dev/null || {
    echo "Warning: Could not drop database $DB_NAME" >&2
  }
else
  echo "Warning: Could not read SA password — skipping database drop" >&2
fi

# --- Remove worktree ---
if [ -n "$PROJECT_DIR" ]; then
  git -C "$PROJECT_DIR" worktree remove --force "$WORKTREE_PATH" 2>/dev/null || {
    echo "Force remove failed, trying prune + rm..." >&2
    git -C "$PROJECT_DIR" worktree prune 2>/dev/null || true
    rm -rf "$WORKTREE_PATH" 2>/dev/null || true
  }
else
  rm -rf "$WORKTREE_PATH" 2>/dev/null || true
fi

echo "Worktree $DIR_SLUG removed" >&2
