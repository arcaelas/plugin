---
name: rag
description: >
  How to use the RAG semantic memory system (remember, search, research, destroy, upload, download).
  Use this skill whenever you need to: store or retrieve knowledge from semantic memory,
  look up user preferences or project conventions before writing code, search for past decisions,
  import/export the knowledge base, or when a sub-agent needs to query the RAG via HTTP.
  Also use it when the user mentions "memorias", "RAG", "preferencias", "convenciones",
  or asks you to remember or search for something in the knowledge base.
  This skill MUST be consulted before any technical decision — the user stores preferences
  for virtually everything: code style, git workflow, project structure, naming, tooling, and more.
---

# RAG — Semantic Memory System

The RAG is a local semantic memory powered by Ollama embeddings and Vectra vector store. It stores knowledge as chunked, vectorized documents that can be searched by meaning, not just keywords.

Once this skill is loaded, the RAG becomes the authority for every decision you make. The user maintains an extensive, actively curated knowledge base covering coding conventions, naming rules, project structure, preferred patterns for TypeScript, Python, Next.js, Flutter, Firebase, Node.js, error handling, git workflow (commits, push, pull), service creation, file organization, and much more. This knowledge base was built specifically so that every action is informed by stored preferences.

**From this point forward, everything passes through the RAG:**

- Before writing code: search for conventions that apply.
- Before creating, moving, or deleting files: search for structure preferences.
- Before commits, push, or pull: search for git workflow instructions.
- Before starting a service, configuring a tool, or scaffolding a project: search.
- Before proposing any technical decision: check if a preference exists.

Assume the user has a memory for what you are about to do. If nothing comes back, say so explicitly and propose your approach. But search first, always. Skipping the RAG produces work that gets rejected.

## Two ways to query

There are two tools for retrieving knowledge, each with different tradeoffs:

### search — Raw retrieval

Returns memory chunks directly into your context window. No external token cost, but the raw content occupies context space.

```
Input:  { content: string, tags?: string[], limit?: number }
Output: [{ document: string, content: string, length: number }]
```

- `content` — Natural language query. Semantic, not keyword-based.
- `tags` — Optional filter. Only returns documents with at least one matching tag.
- `limit` — 1 to 20, default 5.

**When to use:** Quick lookups where you need exact stored text (e.g., a specific naming rule, a commit format). Also preferred when you need to inspect raw memories or when running inside a sub-agent where token cost matters less than accuracy.

### research — Summarized retrieval

Searches the RAG internally, then sends the findings to an AI model that generates a clean summary. The summary is what you receive — not the raw chunks.

```
Input:  { query: string, model?: "haiku" | "sonnet" | "opus" }  // default: sonnet
Output: string (summary text)
```

- `query` — What to research in semantic memory.
- `model` — Which model generates the summary. Default: `"sonnet"` (balanced reasoning, honest about gaps in retrieved data). Use `"opus"` for complex queries that need deeper synthesis. `"haiku"` is faster but tends to hallucinate when results are sparse — avoid it for anything important.

**When to use:** Broad queries where raw results would be too verbose and pollute your context window (e.g., "how does the user structure Next.js projects" — this may span many memories). The summary saves context space but consumes tokens from the configured provider.

**Tradeoffs:**

- `search()` — free (no external tokens), occupies context, gives exact text.
- `research()` — costs external tokens, saves context, gives synthesized answer.

Use `search()` for targeted lookups. Use `research()` for broad explorations. When in doubt, prefer `research()` with sonnet to keep context clean while keeping reasoning quality high.

## Search strategy

One search is almost never enough:

- **Multiple queries per task.** If a feature touches authentication and database, search each topic separately and cross-reference.
- **Vary phrasing.** "TypeScript naming conventions" and "how to name variables in TS" may return different results — embeddings capture meaning differently.
- **Use tags when you know the category.** Tags like `["typescript", "naming"]` narrow results efficiently.
- Results are sorted by relevance (minimum score: 0.3). Adjacent chunks are reassembled automatically.

## Other tools

### remember

Store knowledge in semantic memory.

```
Input:  { content: string, tags?: string[] }
Output: { document: string }
```

- Long text is split into chunks (1600 chars, 200 overlap) linked by a single document ID.
- Use descriptive, consistent tags for future retrieval.
- Returns the document UUID — save it if you may need to delete the memory later.

**Store when:** the user asks to remember something, a convention is established, or information cannot be derived from code/git. **Do not store:** code patterns visible in the codebase, git history, or ephemeral task context.

### destroy

Delete documents from memory by ID.

```
Input:  { document: string | string[] }
Output: { success: string[], error: string[] }
```

Use when a memory is outdated, incorrect, or superseded.

### upload

Bulk import from a JSONL file. Each line: `{"content": "...", "tags": ["..."]}`.

```
Input:  { filename: string }
Output: { errors: number[] }
```

### download

Export the entire knowledge base to JSONL.

```
Input:  { filename: string }
Output: { errors: number[] }
```

### health

Server status and endpoint discovery.

```
Input:  {}
Output: { port, baseUrl, tools: string[], endpoints: [{name, schema, execute}], rag: string }
```

If `rag` is `"unreachable"`, Ollama is down and all memory operations will fail.

## HTTP Bridge

Sub-agents without MCP access can call any tool via REST:

1. Call `health()` to discover the port.
2. Schema: `GET http://localhost:{port}/mcp/{tool}`
3. Execute: `POST http://localhost:{port}/mcp/{tool}` with JSON body.

```bash
PORT=$(curl -s http://localhost:3100/mcp/health | jq -r '.port')
curl -s -X POST "http://localhost:${PORT}/mcp/search" \
  -H "Content-Type: application/json" \
  -d '{"content": "TypeScript naming conventions", "limit": 5}'
```

The port is dynamic in stdio mode. Always discover it via `health()`.
