# Arko Studio

A plugin for [Claude Code](https://claude.ai/claude-code) that orchestrates complex software tasks through four specialized agent phases — **Research**, **Planning**, **Development**, and **Review** — coordinated by a central orchestrator with zero-tolerance quality gates.

Instead of a single agent doing everything, Arko Studio decomposes work into isolated phases where each agent operates within strict boundaries: researchers investigate, planners design, developers execute, and reviewers reject anything that deviates from the specification. All development happens in git worktrees. All decisions are aligned with user preferences stored in a RAG memory system.

## How It Works

```
User Request
    |
    v
Orchestrator ── clarifies intent via questions
    |
    v
Research ── exhaustive domain investigation + RAG queries
    |
    v
Planner ── transforms findings into atomic task specs
    |
    v
Developer ── literal execution in isolated git worktrees
    |
    v
Review ── zero-tolerance validation against spec + RAG
    |
    ├── ALL APPROVED ── done
    └── ANY REJECTED ── Planner (replan) → Developer → Review
```

The orchestrator never writes code. Developers never investigate. Reviewers never suggest alternatives. Each agent does exactly one thing.

## Agents

| Agent | Model | Phase | What It Does |
|-------|-------|-------|--------------|
| **Researcher** | Haiku | Investigation | Searches codebase, internet, docs, and RAG. Writes structured reports to disk with binary conclusions (YES/NO/REQUIRES_CLARIFICATION). One instance per domain. |
| **Planner** | Sonnet | Planning | Reads research + RAG preferences. Produces task files with exact file paths, line numbers, literal values, and validation commands. No vague instructions. |
| **Developer** | Haiku | Execution | Reads one task file. Creates a git worktree. Executes steps in order. Reports COMPLETE or BLOCKED. Zero autonomy — ambiguity causes failure, not guessing. |
| **Reviewer** | Opus | Validation | Runs typecheck, lint, tests, build, and ephemeral server. Executes 7 RAG compliance queries. Binary output only: APPROVED or REJECTED. A single warning is a rejection. |

## Installation

### From source (local)

```bash
git clone https://github.com/arcaelas/plugin.git
claude --plugin-dir ./plugin
```

### From marketplace

```bash
/plugin marketplace add https://github.com/arcaelas/plugin
/plugin install arko-studio@arcaelas-plugins
```

## Prerequisites

Arko Studio bundles three MCP servers. Each has its own requirements:

| MCP Server | Package | Requires | Purpose |
|------------|---------|----------|---------|
| `arcaelas` | `@arcaelas/mcp` | `ARKO_API_KEY` env var | Image and audio generation |
| `rag` | `@arcaelas/rag` | [Ollama](https://ollama.com) running on `localhost:11434` | Semantic memory (user preferences, conventions, history) |
| `mui-mcp` | `@mui/mcp` | None | MUI component documentation |

Set up the required environment variables before starting Claude Code:

```bash
export ARKO_API_KEY="your-api-key-here"
```

If Ollama is not running or `ARKO_API_KEY` is not set, the plugin still works — the affected MCP servers simply won't start, and the `SessionStart` hook will display a warning indicating which services are unavailable.

## RAG Integration

Prefix any message with `/rag` to force a RAG memory search before Claude processes your request:

```
/rag set up a new React project with TypeScript
```

This triggers a `UserPromptSubmit` hook that injects a mandatory instruction into the context, requiring at least 3 `mcp__rag__search` calls with queries derived from your message. Without the `/rag` prefix, messages are processed normally with zero overhead.

RAG is also used internally by agents during orchestration:
- **Research** — 3 queries before each investigation
- **Planner** — 7 pre-planning + 3 post-planning validation queries
- **Reviewer** — 7 compliance queries before writing any review

## Runtime Artifacts

All orchestration artifacts are written to `.claude/.arko/` (automatically added to `.gitignore`):

```
.claude/.arko/
├── research/
│   ├── index.md                  # Executive summary across all domains
│   └── {domain}-{subtopic}.md   # One file per research domain
├── plan/
│   └── {N}.md                    # Numbered task specifications
├── review/
│   └── {N}.md                    # Review reports (APPROVED / REJECTED)
└── .worktree/
    └── task-{N}/                 # Isolated git worktrees per task
```

## Safety

A `PreToolUse` hook intercepts every `Bash` command and blocks destructive patterns before they reach the shell:

| Blocked Pattern | Risk |
|-----------------|------|
| `rm -rf` | Recursive deletion |
| `git push --force`, `git push -f` | Force push to remote |
| `git reset --hard` | Discard uncommitted changes |
| `git checkout .` | Discard all modifications |
| `git clean -f`, `-fd`, `-fx` | Remove untracked files |

Blocked commands return exit code 2 with `[Arko Studio] BLOCKED` in stderr. The command never executes.

## Project Structure

```
.claude-plugin/
├── plugin.json                   # Plugin manifest + MCP server declarations
└── marketplace.json              # Marketplace catalog
agents/
├── researcher.md                 # Investigation agent (Haiku)
├── planner.md                    # Planning agent (Sonnet)
├── developer.md                  # Execution agent (Haiku)
└── reviewer.md                   # Validation agent (Opus)
skills/
└── orchestrator/SKILL.md         # Core orchestration protocol
hooks/
└── hooks.json                    # SessionStart + PreToolUse + UserPromptSubmit
scripts/
├── 00.sh                         # SessionStart: dirs, .gitignore, config validation
├── 01.sh                         # PreToolUse: destructive command blocker
└── 02.sh                         # UserPromptSubmit: /rag prefix detection
```

## Design Principles

1. **Phase Isolation** — Each phase completes fully before the next begins. No context contamination between agents.
2. **Orchestrator Purity** — The orchestrator coordinates and delegates. It never reads files, writes code, or runs commands.
3. **RAG Alignment** — Research, Planning, and Review must query RAG before proceeding. User preferences override general knowledge.
4. **Disk Persistence** — All knowledge is written to `.claude/.arko/`. Nothing exists only in conversation memory.
5. **Zero Tolerance** — A warning is a rejection. A log statement is a rejection. A 1-character deviation from spec is a rejection.
6. **Worktree Separation** — All development happens in isolated git worktrees. The main branch is never touched until all tasks pass review.

## License

[MIT](LICENSE)
