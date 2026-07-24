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
SQLITE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --sqlite) SQLITE=1 ;;
  esac
done

# Writes a server-less SQLite appsettings.local.json so Umbraco can boot
# without SQL Server / Docker.
write_sqlite_config() {
  cat > "$SITE_DIR/appsettings.local.json" <<'EOF'
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Data Source=|DataDirectory|/Umbraco.sqlite.db;Cache=Shared;Foreign Keys=True;Pooling=True",
    "umbracoDbDSN_ProviderName": "Microsoft.Data.Sqlite"
  }
}
EOF
}

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

if [ "$SQLITE" -eq 1 ]; then
  if [ ! -f "$SITE_DIR/appsettings.local.json" ] || [ "$FORCE" -eq 1 ]; then
    write_sqlite_config
    echo "demo-site/appsettings.local.json written for server-less SQLite" >&2
  else
    echo "demo-site/appsettings.local.json already exists; leaving untouched (pass --force to overwrite)" >&2
  fi
fi

echo "demo-site/ created from demo-site-template/" >&2
echo "Next steps:" >&2
if [ "$SQLITE" -eq 1 ]; then
  echo "  - appsettings.local.json already written for server-less SQLite" >&2
else
  echo "  - Write demo-site/appsettings.local.json with your DB connection string" >&2
fi
echo "  - Run 'npm run umbraco:start'" >&2
