import type { Express } from "express";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import config, { DEFAULTS, loadConfig, saveConfig } from "../lib/config.js";

/**
 * Registers HTTP API endpoints for settings, model management, and provider testing.
 * Registra endpoints HTTP para ajustes, gestión de modelos y pruebas de proveedores.
 */
export function func(app: Express, _mcp: McpServer): void {

  /**
   * Returns current settings and installed Ollama models.
   * Retorna ajustes actuales y modelos de Ollama instalados.
   */
  app.get("/v1/settings", async (_req, res) => {
    const settings = loadConfig();
    let models: string[] = [];
    try {
      const url = settings.ollama_base_url || DEFAULTS.ollama_base_url;
      const r = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const body = (await r.json()) as { models?: { name: string }[] };
        models = body.models?.map((m) => m.name) ?? [];
      }
    } catch { /* ollama unreachable */ }
    res.json({ ...settings, models });
  });

  /**
   * Saves partial settings to disk and applies them in-memory.
   * Guarda ajustes parciales a disco y los aplica en memoria.
   */
  app.patch("/v1/settings", (req, res) => {
    try {
      saveConfig(req.body);
      res.json({ ok: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, error: message });
    }
  });

  /**
   * Pulls a model in Ollama. Returns ok if already installed.
   * Descarga un modelo en Ollama. Retorna ok si ya está instalado.
   */
  app.post("/v1/model", async (req, res) => {
    const id = req.body.id as string;
    if (!id) {
      res.status(400).json({ ok: false, error: "Model id is required" });
      return;
    }
    const url = config.ollama_base_url || DEFAULTS.ollama_base_url;
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
    } catch { /* continue to pull */ }

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

  /**
   * Tests Ollama connectivity and model embedding capability.
   * Prueba conectividad de Ollama y capacidad de embedding del modelo.
   */
  app.post("/v1/ollama", async (req, res) => {
    const url = (req.body.url as string) || config.ollama_base_url || DEFAULTS.ollama_base_url;
    const model = (req.body.model as string) || config.ollama_embedding_model || DEFAULTS.ollama_embedding_model;
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

  /**
   * Tests OpenAI API with a real chat completion using user-configured models.
   * Prueba la API de OpenAI con un chat completion real usando los modelos del usuario.
   */
  app.post("/v1/openai", async (req, res) => {
    const access_token = (req.body.access_token as string) || "";
    const url = (req.body.url as string) || config.openai_base_url || DEFAULTS.openai_base_url;
    const models = (req.body.models as { image?: string; audio?: string }) || {};
    if (!access_token) {
      res.json({ ok: false, error: "access_token is required" });
      return;
    }
    const testModel = models.image || models.audio;
    if (!testModel) {
      res.json({ ok: false, error: "At least one model (image or audio) is required" });
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };
      const start = performance.now();
      const r = await fetch(`${url}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: "Reply with only: ok" }],
          max_tokens: 3,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const elapsed = Math.round(performance.now() - start);
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: { message?: string }; message?: string };
        res.json({ ok: false, model: testModel, error: body?.error?.message || body?.message || `HTTP ${r.status}` });
        return;
      }
      const body = (await r.json()) as { model?: string; usage?: { total_tokens?: number } };
      res.json({ ok: true, model: body.model || testModel, usage: body.usage, elapsed_ms: elapsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      res.json({ ok: false, error: message });
    }
  });
}
