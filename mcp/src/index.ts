#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { normalizeObjectSchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { toJsonSchemaCompat } from "@modelcontextprotocol/sdk/server/zod-json-schema-compat.js";
import express, { type Express } from "express";
import { z } from "zod";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import config, { initConfig, openBrowser, loadConfig, applyToEnv } from "./lib/config.js";

import * as api from "./func/api.js";
import * as destroy from "./func/destroy.js";
import * as download from "./func/download.js";
import * as draw from "./func/draw.js";
import * as health from "./func/health.js";
import * as redraw from "./func/redraw.js";
import * as remember from "./func/remember.js";
import * as search from "./func/search.js";
import * as transport from "./func/transport.js";
import * as upload from "./func/upload.js";

// --- Init ---
const isFirstRun = initConfig();

const server = new McpServer({
  name: config.server.name,
  version: config.server.version,
});

const app = express();
app.use(express.json());
app.use((_req, _res, next) => { applyToEnv(loadConfig()); next(); });
app.use(express.static(resolve(dirname(fileURLToPath(import.meta.url)), "public")));

// --- Register funcs ---
const funcs: Array<{ func: (_app: Express, _mcp: McpServer) => void | Promise<void> }> = [
  api, remember, search, destroy, upload, download, draw, redraw, health, transport,
];
for (const f of funcs) {
  await f.func(app, server);
}

// --- HTTP bridge for MCP tools ---
const tools = (server as unknown as { _registeredTools: Record<string, { description?: string; inputSchema?: unknown; handler: (args: unknown) => Promise<unknown>; enabled: boolean }> })._registeredTools;

app.get("/mcp/:tool", (req, res) => {
  const tool = tools[req.params.tool];
  if (!tool || !tool.enabled) {
    res.status(404).json({ error: `Tool ${req.params.tool} not found` });
    return;
  }
  const obj = normalizeObjectSchema(tool.inputSchema as never);
  res.json({
    name: req.params.tool,
    description: tool.description ?? "",
    inputSchema: obj ? toJsonSchemaCompat(obj, { strictUnions: true, pipeStrategy: "input" }) : {},
  });
});

app.post("/mcp/:tool", async (req, res) => {
  const tool = tools[req.params.tool];
  if (!tool || !tool.enabled) {
    res.status(404).json({ error: `Tool ${req.params.tool} not found` });
    return;
  }
  try {
    const schema = normalizeObjectSchema(tool.inputSchema as never);
    const input = schema ? schema.parse(req.body) : req.body;
    const result = await tool.handler(input) as { content?: Array<{ text?: string }> };
    const text = result?.content?.[0]?.text;
    res.json(text ? JSON.parse(text) : result);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// --- Start ---
try {
  console.error(`Starting ${config.server.name}...`);

  const isStdio = process.argv.includes("--stdio");
  const portIdx = process.argv.indexOf("--port");
  const requestedPort = portIdx !== -1 ? parseInt(process.argv[portIdx + 1], 10) : (isStdio ? 0 : 3100);

  if (isStdio) {
    await server.connect(new StdioServerTransport());
    console.error(`${config.server.name} v${config.server.version} (stdio)`);
  }

  const httpServer = app.listen(requestedPort, () => {
    const addr = httpServer.address();
    const port = typeof addr === "object" && addr ? addr.port : requestedPort;
    process.env.PORT = String(port);
    console.error(`Config: http://localhost:${port}`);
    if (isFirstRun) {
      console.error("First run — opening configuration in browser...");
      openBrowser(`http://localhost:${port}`);
    }
  });
} catch (error) {
  console.error("Fatal:", error);
  process.exit(1);
}
