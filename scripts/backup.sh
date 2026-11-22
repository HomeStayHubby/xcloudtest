#!/usr/bin/env bash
# ELITEQuest SQLite backup script.
# Backs up data/elitequest.db and session store into backups/ with a timestamp.
# Recommended: run via cron, e.g. "0 3 * * * /srv/elitequest/scripts/backup.sh"
set -euo pipefail

PROJECT_ROOT="${ELITEQUEST_ROOT:-/srv/elitequest}"
BACKUP_DIR="$PROJECT_ROOT/backups"
TS="$(date +%Y%m%d-%H%M%S)"
KEEP=$((30))

mkdir -p "$BACKUP_DIR"

backup_db() {
  local src="$1"
  local name="$2"
  if [ -f "$src" ]; then
    sqlite3 "$src" --batch ".backup $BACKUP_DIR/$name-$TS.db"
    echo "Backed up $name to $BACKUP_DIR/$name-$TS.db"
  else
    echo "Skipping $name — not found: $src"
  fi
}

backup_db "$PROJECT_ROOT/data/elitequest.db" "elitequest"
backup_db "$PROJECT_ROOT/data/sessions.db" "sessions"

# Prune older backups
ls -1t "$BACKUP_DIR"/*.db 2>/dev/null | tail -n "+$((KEEP + 1))" | xargs -r rm --
echo "Backing up complete. Kept last $KEEP backups."
