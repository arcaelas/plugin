import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const schema = z.object({
  topic: z.string().describe("Topic or question to discuss"),
});

export function func(server: McpServer) {
  server.registerTool("discuss", {
    description: "Generate a debate or discussion with a sub-model on a given topic. (Not yet implemented)",
    inputSchema: schema,
  }, async (input) => {
    return { content: [{ type: "text" as const, text: JSON.stringify({ status: "not_implemented", topic: input.topic }) }] };
  });
}
