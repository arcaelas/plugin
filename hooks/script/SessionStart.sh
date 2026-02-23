#!/usr/bin/env bash
# SessionStart: initialize Arko runtime directories, validate environment

# Create runtime artifact directories
mkdir -p .claude/.arko/{research,plan,review,resume,.worktree} 2>/dev/null || true

# Install MCP dependencies only if node_modules is missing
if [ ! -d "${CLAUDE_PLUGIN_ROOT}/mcp/node_modules" ]; then
  npx -y yarn --cwd "${CLAUDE_PLUGIN_ROOT}/mcp" install --silent 2>/dev/null || true
fi

# Ensure .gitignore excludes runtime artifacts
if [ -f .gitignore ]; then
  grep -qF '.claude/.arko/' .gitignore 2>/dev/null || echo '.claude/.arko/' >> .gitignore
fi

WARNINGS=""

# Validate MCP configuration file
if [ ! -f "$HOME/.arcaelas/mcp/config.json" ]; then
  WARNINGS="${WARNINGS}
[!] MCP not configured — config UI will open in browser on first use."
fi

# Validate Ollama (2s max to avoid blocking startup)
if ! curl -sf --max-time 2 "${OLLAMA_BASE_URL:-http://localhost:11434}/api/version" >/dev/null 2>&1; then
  WARNINGS="${WARNINGS}
[!] Ollama not reachable — MCP RAG (semantic memory) will fail."
fi

# Validate git (required for worktree isolation)
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  WARNINGS="${WARNINGS}
[!] Not a git repository — worktree isolation will not work. Run: git init"
fi

# Output structured JSON for Claude Code
CONTEXT="Arko Studio active. Runtime artifacts at .claude/.arko/{research,plan,review,resume,.worktree}/"
[ -n "$WARNINGS" ] && CONTEXT="${CONTEXT}

Setup warnings:${WARNINGS}"

if command -v jq >/dev/null 2>&1; then
  jq -n --arg ctx "$CONTEXT" \
    '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":$ctx}}'
else
  SAFE_CTX=$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g' | tr '\n' ' ')
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$SAFE_CTX"
fi

exit 0
