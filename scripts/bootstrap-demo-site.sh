#!/usr/bin/env bash
set -euo pipefail

# Creates a working demo-site/ by copying demo-site-template/ into it.
# demo-site-template/ is the tracked source of truth; demo-site/ is
# gitignored and represents each developer/CI's actual running instance.
#
# Idempotent: skips the copy if demo-site/ already exists unless --force.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$PROJECT_DIR/demo-site-template"
SITE_DIR="$PROJECT_DIR/demo-site"

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
  esac
done

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Error: $TEMPLATE_DIR does not exist" >&2
  exit 1
fi

if [ -d "$SITE_DIR" ] && [ "$FORCE" -eq 0 ]; then
  echo "demo-site/ already exists; skipping bootstrap (pass --force to overwrite)" >&2
  exit 0
fi

if [ "$FORCE" -eq 1 ] && [ -d "$SITE_DIR" ]; then
  echo "--force given; removing existing demo-site/" >&2
  rm -rf "$SITE_DIR"
fi

# rsync to preserve file modes, exclude build artefacts and runtime data
rsync -a \
  --exclude='bin/' \
  --exclude='obj/' \
  --exclude='umbraco/' \
  --exclude='wwwroot/' \
  --exclude='appsettings.local.json' \
  --exclude='appsettings.Local.json' \
  "$TEMPLATE_DIR/" "$SITE_DIR/"

# Rename csproj so the assembly name matches the folder
if [ -f "$SITE_DIR/demo-site-template.csproj" ]; then
  mv "$SITE_DIR/demo-site-template.csproj" "$SITE_DIR/demo-site.csproj"
fi

echo "demo-site/ created from demo-site-template/" >&2
echo "Next steps:" >&2
echo "  - Write demo-site/appsettings.local.json with your DB connection string" >&2
echo "  - Run 'npm run umbraco:start'" >&2
