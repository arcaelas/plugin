#!/usr/bin/env bash
# PreToolUse(Bash): Block destructive commands that no agent or orchestrator should execute

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$COMMAND" ]; then
  exit 0
fi

# --- ALWAYS BLOCKED ---
# git push (any variant — nothing in the workflow pushes to remote)
if echo "$COMMAND" | grep -qE '\bgit\s+push\b'; then
  jq -n --arg r "Blocked: git push is not allowed. The Arko workflow never pushes to remote." \
    '{"decision":"block","reason":$r}'
  exit 0
fi

# git reset --hard (destroys uncommitted work)
if echo "$COMMAND" | grep -qE '\bgit\s+reset\s+--hard\b'; then
  jq -n --arg r "Blocked: git reset --hard destroys uncommitted changes." \
    '{"decision":"block","reason":$r}'
  exit 0
fi

# git clean -f (deletes untracked files permanently)
if echo "$COMMAND" | grep -qE '\bgit\s+clean\s+-[a-zA-Z]*f'; then
  jq -n --arg r "Blocked: git clean -f permanently deletes untracked files." \
    '{"decision":"block","reason":$r}'
  exit 0
fi

# rm -rf targeting root, home, or broad paths
if echo "$COMMAND" | grep -qE '\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(/|~/|\.\.|/home|/etc|/usr|/var)'; then
  jq -n --arg r "Blocked: rm -rf targeting system/root paths is not allowed." \
    '{"decision":"block","reason":$r}'
  exit 0
fi

# --no-verify on git commands (skipping hooks)
if echo "$COMMAND" | grep -qE '\bgit\s+(commit|push|merge)\b.*--no-verify'; then
  jq -n --arg r "Blocked: --no-verify is not allowed. Git hooks must not be skipped." \
    '{"decision":"block","reason":$r}'
  exit 0
fi

# --- ALLOWED ---
# Everything else passes through (git merge, git worktree, git branch -d, etc.)
exit 0
