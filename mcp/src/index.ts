#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import config from "./lib/config.js";

import * as destroy from "./tool/destroy.js";
import * as discuss from "./tool/discuss.js";
import * as download from "./tool/download.js";
import * as draw from "./tool/draw.js";
import * as redraw from "./tool/redraw.js";
import * as remember from "./tool/remember.js";
import * as search from "./tool/search.js";
import * as upload from "./tool/upload.js";

// --- Server ---
const server = new McpServer({
  name: config.server.name,
  version: config.server.version,
});

// --- Tools ---
remember.func(server);
search.func(server);
destroy.func(server);
upload.func(server);
download.func(server);
draw.func(server);
redraw.func(server);
discuss.func(server);

; (async function main() {
  try {
    console.error(`Starting ${config.server.name}...`);

    if (!config.openai_api_key) {
      console.error("Warning: OPENAI_API_KEY not set — media tools will fail");
    }

    if (process.argv.includes("--stdio")) {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error(`${config.server.name} v${config.server.version} (stdio)`);
    } else {
      const idx = process.argv.indexOf("--port");
      const port = parseInt(process.argv[idx + 1] ?? "3100", 10);
      const app = express();
      const sessions = new Map<string, StreamableHTTPServerTransport>();

      app.post("/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (sessionId && sessions.has(sessionId)) {
          await sessions.get(sessionId)!.handleRequest(req, res, req.body);
          return;
        }

        if (!sessionId && isInitializeRequest(req.body)) {
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            onsessioninitialized: (id) => { sessions.set(id, transport); },
          });
          transport.onclose = () => {
            if (transport.sessionId) sessions.delete(transport.sessionId);
          };
          await server.connect(transport);
          await transport.handleRequest(req, res, req.body);
          return;
        }

        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: no valid session" },
          id: null,
        });
      });

      app.get("/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        if (!sessionId || !sessions.has(sessionId)) {
          res.status(400).send("Invalid or missing session ID");
          return;
        }
        await sessions.get(sessionId)!.handleRequest(req, res);
      });

      app.delete("/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        if (!sessionId || !sessions.has(sessionId)) {
          res.status(400).send("Invalid or missing session ID");
          return;
        }
        await sessions.get(sessionId)!.handleRequest(req, res);
      });

      app.get("/health", (_req: Request, res: Response) => {
        res.json({
          status: "ok",
          name: config.server.name,
          version: config.server.version,
          tools: ["remember", "search", "destroy", "upload", "download", "draw", "redraw", "discuss"],
        });
      });

      app.listen(port, () => {
        console.error(`${config.server.name} v${config.server.version}`);
        console.error(`HTTP: http://localhost:${port}/mcp`);
      });
    }
  } catch (error) {
    console.error("Fatal:", error);
    process.exit(1);
  }
})()