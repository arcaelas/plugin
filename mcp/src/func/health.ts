import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Express } from "express";
import { z } from "zod";
import config from "../lib/config.js";

export function func(_app: Express, mcp: McpServer) {
  mcp.registerTool("health", {
    description: "Returns MCP server health info: HTTP port, base URL, available tool endpoints, and RAG connection status. Use this to discover the HTTP bridge for calling tools via REST.",
    inputSchema: z.object({}),
  }, async () => {
    const port = process.env.PORT || "unknown";
    const baseUrl = `http://localhost:${port}`;

    const tools = (mcp as unknown as { _registeredTools: Record<string, { enabled: boolean }> })._registeredTools;
    const availableTools = Object.entries(tools)
      .filter(([, t]) => t.enabled)
      .map(([name]) => name);

    let ragStatus = "unknown";
    try {
      const url = config.ollama_base_url || "http://localhost:11434";
      const res = await fetch(`${url}/api/version`, { signal: AbortSignal.timeout(3000) });
      ragStatus = res.ok ? "connected" : `error: HTTP ${res.status}`;
    } catch {
      ragStatus = "unreachable";
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          port,
          baseUrl,
          tools: availableTools,
          endpoints: availableTools.map((name) => ({
            name,
            schema: `GET ${baseUrl}/mcp/${name}`,
            execute: `POST ${baseUrl}/mcp/${name}`,
          })),
          rag: ragStatus,
        }),
      }],
    };
  });
}
