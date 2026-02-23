import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";
import { loadConfig } from "../lib/config.js";

// Convert a JSON Schema object into a Zod shape for tool registration.
// Property names and descriptions are preserved; types are kept as unknown
// since we are proxying — Stitch validates its own inputs.
type JsonSchemaObject = {
  properties?: Record<string, { description?: string }>;
  required?: string[];
};

function buildZodShape(schema: unknown): Record<string, z.ZodTypeAny> {
  const s = schema as JsonSchemaObject;
  if (!s?.properties) return {};
  const required = new Set(s.required ?? []);
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, prop] of Object.entries(s.properties)) {
    const base: z.ZodTypeAny = prop.description
      ? z.unknown().describe(prop.description)
      : z.unknown();
    shape[key] = required.has(key) ? base : base.optional();
  }
  return shape;
}

export async function func(_app: Express, mcp: McpServer): Promise<void> {
  const { stitch_api_key } = loadConfig();
  if (!stitch_api_key) return;

  try {
    const client = new Client({ name: "arko-stitch-proxy", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(
      new URL("https://stitch.googleapis.com/mcp"),
      { requestInit: { headers: { "X-Goog-Api-Key": stitch_api_key } } }
    );

    await client.connect(transport);
    const { tools } = await client.listTools();

    for (const tool of tools) {
      const shape = buildZodShape(tool.inputSchema);
      mcp.registerTool(
        `stitch_${tool.name}`,
        {
          description: tool.description ?? tool.name,
          inputSchema: z.object(shape),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (input) => client.callTool({
          name: tool.name,
          arguments: input as Record<string, unknown>,
        }) as any
      );
    }

    console.error(`Stitch: ${tools.length} tools proxied`);
  } catch (err) {
    console.error(`Stitch: failed to connect —`, err instanceof Error ? err.message : String(err));
  }
}
