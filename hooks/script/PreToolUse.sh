#!/usr/bin/env bash
# PreToolUse(Bash): Block destructive commands that no agent or orchestrator should execute
# Optimized: single jq call for parsing, bash builtins for pattern matching

COMMAND=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[[ -z "$COMMAND" ]] && exit 0

block() {
  printf '{"decision":"block","reason":"%s"}' "$1"
  exit 0
}

# R1 — allow push to feature branches; block only push targeting main/dev/prod
[[ "$COMMAND" =~ git[[:space:]]+push ]] && [[ "$COMMAND" =~ (^|[[:space:]/:])(main|dev|prod)([[:space:]]|$) ]] \
  && block "Blocked: no push directo a main/dev/prod. Push a una rama feature (fix/feat/chore/docs) y abre PR."

# R4 — reset --hard destroys uncommitted changes
[[ "$COMMAND" =~ git[[:space:]]+reset[[:space:]]+--hard ]] && block "Blocked: git reset --hard destroys uncommitted changes."

exit 0
