# Arko Studio

A modular agent orchestration plugin for Claude Code. Executes complex tasks through specialized, isolated phases — investigation, planning, development, and review — coordinated by a central orchestrator.

## Architecture

```
plugin/
├── .claude-plugin/
│   ├── plugin.json                   # Plugin manifest
│   └── marketplace.json              # Marketplace catalog
├── agents/
│   ├── researcher.md                 # Investigation agent (haiku)
│   ├── planner.md                    # Planning agent (sonnet)
│   ├── developer.md                  # Execution agent (haiku)
│   └── reviewer.md                   # Validation agent (opus)
├── skills/
│   └── arko-orchestrator/SKILL.md    # Orchestration protocol (background)
├── hooks/hooks.json                  # SessionStart + PreToolUse + UserPromptSubmit
├── scripts/
│   ├── 00.sh                         # SessionStart: dirs + .gitignore
│   ├── 01.sh                         # PreToolUse: destructive command blocker
│   └── 02.sh                         # UserPromptSubmit: /rag prefix detection
└── README.md
```

## Flow

```
User Request → Orchestrator clarifies intent
    ↓
Research (exhaustive domain investigation + RAG)
    ↓
Planner (RAG-validated task design)
    ↓
Developer (literal execution in worktrees)
    ↓
Review (zero-tolerance validation + RAG)
    ↓
├── ALL APPROVED → Done
└── ANY REJECTED → Planner (replan) → Developer → Review
```

## Agents

| Agent      | Model  | Role                                          | Personality                                 |
| ---------- | ------ | --------------------------------------------- | ------------------------------------------- |
| Researcher | haiku  | Exhaustive context gathering per domain       | Analytical, meticulous, synthesis-oriented  |
| Planner    | sonnet | Transform research into executable task specs | Pragmatic, resourceful, efficiency-obsessed |
| Developer  | haiku  | Literal 1:1 task execution in worktrees       | Literal, minimalist, zero autonomy          |
| Reviewer   | opus   | Zero-tolerance validation against spec + RAG  | Critical, skeptical, rigorous               |

## Runtime Artifacts

Created at `.claude/.arko/` during execution:

```
.claude/.arko/
├── research/       # Domain investigation files + index.md
├── plan/           # Numbered task specifications
├── review/         # APPROVED/REJECTED reports
└── .worktree/      # Isolated git worktrees per task
```

## Installation

### Development (local testing)

```bash
claude --plugin-dir ~/Documentos/arcaelas/plugin
```

### Via marketplace

```bash
/plugin marketplace add ~/Documentos/arcaelas/plugin
/plugin install arko-studio@arcaelas-plugins
```

## Safety

The PreToolUse hook blocks destructive commands:

- `rm -rf`, `git push --force`, `git reset --hard`
- `git checkout .`, `git clean -f*`

Exit code 2 prevents execution; stderr shows the blocked pattern.

## License

MIT
