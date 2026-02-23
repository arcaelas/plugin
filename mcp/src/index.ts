#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express, { type Express } from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import config, { initConfig, openBrowser } from "./lib/config.js";

import * as api from "./func/api.js";
import * as destroy from "./func/destroy.js";
import * as download from "./func/download.js";
import * as draw from "./func/draw.js";
import * as redraw from "./func/redraw.js";
import * as remember from "./func/remember.js";
import * as search from "./func/search.js";
import * as stitch from "./func/stitch.js";
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
app.use(express.static(resolve(dirname(fileURLToPath(import.meta.url)), "public")));

// --- Register funcs ---
const funcs: Array<{ func: (_app: Express, _mcp: McpServer) => void | Promise<void> }> = [
  api, remember, search, destroy, upload, download, draw, redraw, stitch,
];
for (const f of funcs) {
  await f.func(app, server);
}

// --- Start ---
try {
  console.error(`Starting ${config.server.name}...`);

  const isStdio = process.argv.includes("--stdio");
  const portIdx = process.argv.indexOf("--port");
  const requestedPort = portIdx !== -1 ? parseInt(process.argv[portIdx + 1], 10) : (isStdio ? 0 : 3100);

  if (isStdio) {
    await server.connect(new StdioServerTransport());
    console.error(`${config.server.name} v${config.server.version} (stdio)`);
  } else {
    transport.func(app, server);
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
