#!/usr/bin/env bash
# SessionStart: initialize runtime directories, gitignore, and validate config

mkdir -p .claude/.arko/{research,plan,review,resume,.worktree} 2>/dev/null || true

if [ -f .gitignore ]; then
  if ! grep -qF '.claude/.arko' .gitignore 2>/dev/null; then
    echo '.claude/.arko/' >> .gitignore
  fi
fi

WARNINGS=""

if [ -z "$ARKO_API_KEY" ]; then
  WARNINGS="${WARNINGS}
[!] ARKO_API_KEY not set — @arcaelas/mcp (image/audio) will not start. Run: export ARKO_API_KEY=sk-..."
fi

if ! curl -sf http://localhost:11434/api/version >/dev/null 2>&1; then
  WARNINGS="${WARNINGS}
[!] Ollama not reachable at localhost:11434 — @arcaelas/rag (memory) will not start."
fi

CONTEXT="Arko Studio active. Runtime artifacts at .claude/.arko/{research,plan,review,resume,.worktree}/"
if [ -n "$WARNINGS" ]; then
  CONTEXT="${CONTEXT}

Setup warnings:${WARNINGS}"
fi

if command -v jq >/dev/null 2>&1; then
  jq -n --arg ctx "$CONTEXT" \
    '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":$ctx}}'
else
  SAFE_CTX=$(printf '%s' "$CONTEXT" | tr '\n' ' ')
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$SAFE_CTX"
fi

exit 0
