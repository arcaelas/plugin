#!/usr/bin/env bash
# SessionStart: initialize Arko runtime directories, validate environment

# Install MCP dependencies only if node_modules is missing
if [ ! -d "${CLAUDE_PLUGIN_ROOT}/mcp/node_modules" ]; then
  npx -y yarn --cwd "${CLAUDE_PLUGIN_ROOT}/mcp" install --silent 2>/dev/null || true
fi

WARNINGS=""

# Validate MCP configuration file
if [ ! -f "$HOME/.arcaelas/mcp/config.json" ]; then
  WARNINGS="${WARNINGS}
[!] MCP not configured — config UI will open in browser on first use."
fi

# Resolve the Ollama URL the MCP actually uses: base_url of the provider referenced by rag.provider.
# Falls back to localhost when config, jq or the provider are absent.
OLLAMA_URL="http://localhost:11434"
CONFIG_FILE="$HOME/.arcaelas/mcp/config.json"
if [ -f "$CONFIG_FILE" ] && command -v jq >/dev/null 2>&1; then
  RAG_URL=$(jq -r '.rag.provider as $n | (.providers[]? | select(.name == $n and .provider == "ollama") | .base_url) // empty' "$CONFIG_FILE" 2>/dev/null)
  [ -n "$RAG_URL" ] && OLLAMA_URL="${RAG_URL%/}"
fi

# Validate Ollama (2s max to avoid blocking startup)
if ! curl -sf --max-time 2 "${OLLAMA_URL}/api/version" >/dev/null 2>&1; then
  WARNINGS="${WARNINGS}
[!] Ollama not reachable — MCP RAG (semantic memory) will fail."
fi

# Output structured JSON for Claude Code
CONTEXT="MCP plugin active."
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
