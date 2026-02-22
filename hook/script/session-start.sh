#!/usr/bin/env bash
# SessionStart: initialize Arko runtime directories, configure gitignore, validate environment

# Create runtime artifact directories
mkdir -p .claude/.arko/{research,plan,review,resume,.worktree} 2>/dev/null || true

# Ensure .gitignore excludes runtime artifacts
if [ -f .gitignore ]; then
  grep -qF '.claude/.arko/' .gitignore 2>/dev/null || echo '.claude/.arko/' >> .gitignore
fi

WARNINGS=""

# Validate ARKO_API_KEY for @arcaelas/mcp (image/audio tools)
if [ -z "$ARKO_API_KEY" ]; then
  WARNINGS="${WARNINGS}
[!] ARKO_API_KEY not set — @arcaelas/mcp (image/audio) will not start. Run: export ARKO_API_KEY=sk-..."
fi

# Validate Ollama for @arcaelas/rag (semantic memory)
if ! curl -sf http://localhost:11434/api/version >/dev/null 2>&1; then
  WARNINGS="${WARNINGS}
[!] Ollama not reachable at localhost:11434 — @arcaelas/rag (memory) will not start."
fi

# Validate git (required for worktree isolation)
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  WARNINGS="${WARNINGS}
[!] Not a git repository — worktree isolation will not work. Run: git init"
fi

# Build context message
CONTEXT="Arko Studio active. Runtime artifacts at .claude/.arko/{research,plan,review,resume,.worktree}/"
if [ -n "$WARNINGS" ]; then
  CONTEXT="${CONTEXT}

Setup warnings:${WARNINGS}"
fi

# Output structured JSON for Claude Code
if command -v jq >/dev/null 2>&1; then
  jq -n --arg ctx "$CONTEXT" \
    '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":$ctx}}'
else
  SAFE_CTX=$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g' | tr '\n' ' ')
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$SAFE_CTX"
fi

exit 0
