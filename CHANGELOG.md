# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-07

### Added

- Core orchestration protocol (`skills/orchestrator/SKILL.md`) with phase routing, linear execution, and feedback loop.
- **Researcher** agent (Haiku) — exhaustive domain investigation with mandatory RAG queries and structured disk-persisted reports.
- **Planner** agent (Sonnet) — RAG-validated task design with 7 pre-planning and 3 post-planning queries. Scalable from 2 to 10+ instances.
- **Developer** agent (Haiku) — literal 1:1 task execution in isolated git worktrees with COMPLETE/BLOCKED reporting.
- **Reviewer** agent (Opus) — zero-tolerance validation with 7 RAG compliance queries, ephemeral environment testing, and binary APPROVED/REJECTED output.
- `SessionStart` hook (`00.sh`) — initializes `.claude/.arko/` directories, adds to `.gitignore`, validates `ARKO_API_KEY` and Ollama availability.
- `PreToolUse` hook (`01.sh`) — blocks destructive commands (`rm -rf`, `git push --force`, `git reset --hard`, etc.) with exit code 2.
- `UserPromptSubmit` hook (`02.sh`) — detects `/rag` prefix to force mandatory RAG memory search before processing.
- MCP server declarations for `@arcaelas/mcp` (image/audio), `@arcaelas/rag` (semantic memory), and `@mui/mcp` (MUI docs).
- Plugin manifest (`plugin.json`) and marketplace catalog (`marketplace.json`).

[1.0.0]: https://github.com/arcaelas/plugin/releases/tag/v1.0.0
