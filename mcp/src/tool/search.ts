import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as rag from "../lib/rag.js";

export const schema = z.object({
  content: z.string().describe("Search query for semantic memory"),
  tags: z.array(z.string()).optional().describe("Filter results by tags"),
  limit: z.number().min(1).max(20).default(5).optional().describe("Max results to return"),
});

export function func(server: McpServer) {
  server.registerTool("search", {
    description: "Semantic search across the knowledge base. Returns matching chunks with full content and total document length. Use tags to narrow results.",
    inputSchema: schema,
  }, async (input) => {
    const result = await rag.search({ content: input.content, tags: input.tags, limit: input.limit });
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  });
}
