# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in Arko Studio, please report it responsibly:

1. **Do not** open a public issue.
2. Email your findings to the maintainer or use [GitHub Security Advisories](https://github.com/arcaelas/plugin/security/advisories/new).
3. Include a description of the vulnerability, steps to reproduce, and potential impact.
4. You will receive an acknowledgment within 48 hours.

## Security Considerations

### API Keys

The `arcaelas` MCP server requires `ARKO_API_KEY` as an environment variable. This key is **never** stored in plugin files — it is resolved from the system environment at runtime via `${ARKO_API_KEY}` expansion in `plugin.json`.

**Do not** hardcode API keys in configuration files or commit them to version control.

### Destructive Command Blocking

The `PreToolUse` hook (`scripts/01.sh`) blocks the following commands before they reach the shell:

- `rm -rf`
- `git push --force` / `git push -f`
- `git reset --hard`
- `git checkout .`
- `git clean -f` / `-fd` / `-fx`

This is a defense-in-depth measure. Agent rules also prohibit these commands, but the hook provides a hard guardrail at the system level.

### Git Worktree Isolation

All development happens in isolated git worktrees under `.claude/.arko/.worktree/task-{N}`. The main branch is never modified during execution. Worktrees are only merged after all tasks pass review.

### Runtime Artifacts

Orchestration artifacts (`.claude/.arko/`) are automatically added to `.gitignore` by the `SessionStart` hook to prevent accidental commits of temporary research, plans, or review reports.
