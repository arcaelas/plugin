import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Agent, Tool, Rule, ClaudeCode } from "@arcaelas/agent";
import * as rag from "../lib/rag.js";
import config from "../lib/config.js";

export function func(_app: Express, mcp: McpServer) {
  mcp.registerTool("research", {
    description:
      "Deep research in semantic memory. An AI agent searches RAG autonomously " +
      "with varied queries and returns a synthesized summary.",
    inputSchema: z.object({
      search: z.string().describe("What to research in semantic memory"),
      model: z.enum(["haiku", "sonnet", "opus"]).default("haiku").optional(),
      think: z.enum(["none", "low", "medium", "high"]).default("none").optional(),
      score: z.number().min(0).max(1).default(0.7).optional(),
    }),
  }, async (input) => {
    const score = input.score ?? 0.7;

    const agent = new Agent({
      name: "researcher",
      description: "Searches semantic memory and synthesizes findings",
      providers: [new ClaudeCode({ model: input.model ?? "haiku", think: input.think ?? "none", dirname: config.claude.dirname })],
      rules: [new Rule(
        "You are a research agent with access to semantic memory (RAG). " +
        "Search multiple times using varied phrasing to gather comprehensive information. " +
        "Synthesize findings into a clear, structured summary. " +
        "Respond in the same language as the query."
      )],
      tools: [new Tool("rag_search", {
        description: "Search semantic memory. Vary query phrasing for better coverage.",
        parameters: { query: "Semantic search query" },
        func: async (_: any, args: any) => {
          const results = await rag.search({ content: args.query, limit: 5 });
          if (!results.length) return "No results found.";
          return results.map((r: any) => r.content).join("\n\n---\n\n");
        },
      })],
    });

    const prompt = `${input.search}\n\n[Confidence threshold: ${score} — keep searching with different queries until at least ${Math.round(score * 100)}% confident your findings answer comprehensively. If below threshold, search again with different phrasing.]`;

    const [messages, ok] = await agent.call(prompt);
    if (!ok) return { content: [{ type: "text" as const, text: "Research could not be completed." }] };

    const last = (messages[messages.length - 1] as any).toJSON();
    return { content: [{ type: "text" as const, text: last.content || "No findings." }] };
  });
}
