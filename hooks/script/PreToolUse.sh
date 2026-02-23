#!/usr/bin/env bash
# PreToolUse(Bash): Block destructive commands that no agent or orchestrator should execute
# Optimized: single jq call for parsing, bash builtins for pattern matching

COMMAND=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[[ -z "$COMMAND" ]] && exit 0

block() {
  printf '{"decision":"block","reason":"%s"}' "$1"
  exit 0
}

[[ "$COMMAND" =~ git[[:space:]]+push ]]                          && block "Blocked: git push is not allowed. The Arko workflow never pushes to remote."
[[ "$COMMAND" =~ git[[:space:]]+reset[[:space:]]+--hard ]]       && block "Blocked: git reset --hard destroys uncommitted changes."
[[ "$COMMAND" =~ git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f ]]  && block "Blocked: git clean -f permanently deletes untracked files."
[[ "$COMMAND" =~ rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*[[:space:]]+(\/|~\/|\.\.|\/home|\/etc|\/usr|\/var) ]] && block "Blocked: rm -rf targeting system/root paths is not allowed."
[[ "$COMMAND" =~ git[[:space:]]+(commit|push|merge)[[:space:]].*--no-verify ]] && block "Blocked: --no-verify is not allowed. Git hooks must not be skipped."

exit 0
