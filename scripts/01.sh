#!/usr/bin/env bash
# PreToolUse[Bash]: block destructive commands

COMMAND="${1:-}"
[ -z "$COMMAND" ] && exit 0

DENIED=(
  "rm -rf"
  "git push --force"
  "git push -f "
  "git reset --hard"
  "git checkout ."
  "git clean -f"
  "git clean -fd"
  "git clean -fx"
)

for pattern in "${DENIED[@]}"; do
  if [[ "$COMMAND" == *"$pattern"* ]]; then
    echo "[Arko Studio] BLOCKED: '$pattern'" >&2
    exit 2
  fi
done

exit 0
