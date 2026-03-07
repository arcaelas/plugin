import type { Express } from "express";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import config from "../lib/config.js";

export function func(app: Express, _mcp: McpServer): void {

  app.get("/v1/settings", async (_req, res) => {
    const settings = config.config();
    let models: string[] = [];
    try {
      const url = config.ollama.base_url;
      const r = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const body = (await r.json()) as { models?: { name: string }[] };
        models = body.models?.map((m) => m.name) ?? [];
      }
    } catch {}
    res.json({ ...settings, models });
  });

  app.patch("/v1/settings", (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;

      if (Array.isArray(body.providers)) {
        const names = (body.providers as Array<{ name?: string }>)
          .map((p) => p.name?.trim())
          .filter(Boolean);
        if (new Set(names).size !== names.length) {
          res.status(400).json({ ok: false, error: "Duplicate provider names" });
          return;
        }
      }

      config.save(body);
      res.json({ ok: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/v1/model", async (req, res) => {
    const id = req.body.id as string;
    if (!id) {
      res.status(400).json({ ok: false, error: "Model id is required" });
      return;
    }
    const url = config.ollama.base_url;
    try {
      const tags = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (tags.ok) {
        const body = (await tags.json()) as { models?: { name: string }[] };
        const installed = body.models?.some((m) => m.name === id || m.name === `${id}:latest`) ?? false;
        if (installed) {
          res.json({ ok: true, status: "already_installed" });
          return;
        }
      }
    } catch {}

    try {
      const r = await fetch(`${url}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: id, stream: true }),
      });
      if (!r.ok || !r.body) {
        res.status(502).json({ ok: false, error: `Ollama responded HTTP ${r.status}` });
        return;
      }
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) {
          res.write(decoder.decode(chunk.value, { stream: true }));
        }
      }
      res.end();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Pull failed";
      if (!res.headersSent) {
        res.status(502).json({ ok: false, error: message });
      } else {
        res.end();
      }
    }
  });

  app.post("/v1/ollama", async (req, res) => {
    const url = (req.body.url as string) || config.ollama.base_url;
    const model = (req.body.model as string) || config.ollama.model.embedding;
    try {
      const start = performance.now();
      const r = await fetch(`${url}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: "connection test" }),
        signal: AbortSignal.timeout(30000),
      });
      const elapsed = Math.round(performance.now() - start);
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        res.json({ ok: false, error: body.error || `HTTP ${r.status}` });
        return;
      }
      const body = (await r.json()) as { embeddings?: number[][] };
      const dims = body.embeddings?.[0]?.length ?? 0;
      res.json({ ok: true, model, dims, elapsed_ms: elapsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      res.json({ ok: false, error: message });
    }
  });

}
