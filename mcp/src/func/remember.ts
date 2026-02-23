import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as rag from "../lib/rag.js";

export const schema = z.object({
  content: z.string().describe("Text to store in semantic memory"),
  tags: z.array(z.string()).optional().describe("Tags for categorization"),
});

export function func(_app: Express, mcp: McpServer) {
  mcp.registerTool("remember", {
    description: "Store knowledge in semantic memory. Automatically splits long text into chunks linked by a single document ID. Use tags for categorization and filtering.",
    inputSchema: schema,
  }, async (input) => {
    const result = await rag.remember({ content: input.content, tags: input.tags });
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  });
}
