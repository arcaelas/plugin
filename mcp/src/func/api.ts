import type { Express } from "express";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import config, { DEFAULTS, loadConfig, saveConfig } from "../lib/config.js";

export function func(app: Express, _mcp: McpServer): void {
  app.get("/v1/config", (_req, res) => {
    res.json(loadConfig());
  });

  app.post("/v1/config", (req, res) => {
    try {
      saveConfig(req.body);
      res.json({ ok: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/v1/test/ollama", async (req, res) => {
    try {
      const url = req.body.url || DEFAULTS.ollama_base_url;
      const r = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const body = (await r.json()) as { models?: { name: string }[] };
        res.json({ ok: true, models: body.models?.map((m) => m.name) ?? [] });
      } else {
        res.json({ ok: false, error: `HTTP ${r.status}` });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      res.json({ ok: false, error: message });
    }
  });

  app.post("/v1/test/openai", async (req, res) => {
    try {
      const key = req.body.key || "";
      const baseUrl = req.body.base_url || DEFAULTS.openai_base_url;
      if (!key) {
        res.json({ ok: false, error: "API key is required" });
        return;
      }
      const r = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10000),
      });
      if (r.ok) {
        const body = (await r.json().catch(() => ({}))) as { data?: { id: string }[] };
        const models = body.data?.map((m) => m.id) ?? [];
        res.json({ ok: true, models });
      } else {
        const body = (await r.json().catch(() => ({}))) as { error?: { message?: string } };
        res.json({ ok: false, error: body?.error?.message || `HTTP ${r.status}` });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      res.json({ ok: false, error: message });
    }
  });
}
