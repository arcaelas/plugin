import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as ws from "../lib/whatsapp.js";

// ═══════════════════════════════════════════════════════════════════════
// Action schemas — ordered most-specific first for z.union matching
// ═══════════════════════════════════════════════════════════════════════

const O = z.string().optional().describe("Owner account phone (required if >1 account)");

const ReactAction = z.object({ chat: z.string(), message: z.string(), react: z.string(), owner: O });
const DeleteMessageAction = z.object({ chat: z.string(), message: z.string(), delete: z.enum(["all"]), owner: O });
const SendTextAction = z.object({ chat: z.string(), text: z.string(), owner: O });
const SendImageAction = z.object({ chat: z.string(), image: z.string(), owner: O, caption: z.string().optional() });
const SendVideoAction = z.object({ chat: z.string(), video: z.string(), owner: O, caption: z.string().optional() });
const SendAudioAction = z.object({ chat: z.string(), audio: z.string(), owner: O, ptt: z.boolean().optional() });
const SendLocationAction = z.object({ chat: z.string(), location: z.object({ lat: z.number(), lng: z.number(), caption: z.string().optional() }), owner: O });
const SendPollAction = z.object({ chat: z.string(), poll: z.object({ caption: z.string(), options: z.array(z.string()).min(2) }), owner: O });
const SeenAction = z.object({ chat: z.string(), seen: z.literal(true), owner: O });
const ArchiveAction = z.object({ chat: z.string(), archive: z.boolean(), owner: O });
const PinAction = z.object({ chat: z.string(), pin: z.boolean(), owner: O });
const DeleteChatAction = z.object({ chat: z.string(), delete: z.literal(true), owner: O });
const MessagesAction = z.object({ chat: z.string(), messages: z.number().min(1).max(100), owner: O, offset: z.number().min(0).optional() });
const ContactAction = z.object({ contact: z.string(), owner: O });
const UnreadAction = z.object({ unread: z.literal(true), owner: O });
const AccountsAction = z.object({ accounts: z.literal(true) });
const CloseAction = z.object({ close: z.literal(true), owner: O });

const Action = z.union([
  ReactAction, DeleteMessageAction,
  SendTextAction, SendImageAction, SendVideoAction, SendAudioAction, SendLocationAction, SendPollAction, SeenAction, ArchiveAction, PinAction, DeleteChatAction, MessagesAction,
  ContactAction, UnreadAction, AccountsAction, CloseAction,
]);

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

interface ActionResult { ok: boolean; data?: unknown; error?: string }

const CONTENT_TAGS: Record<string, string> = {
  image: "Image", video: "Video", audio: "Audio", location: "Location", poll: "Poll",
};

function format_content(msg: any): string | Record<string, unknown> {
  const { type, caption } = msg;
  if (type === "location") {
    const loc = msg.raw?.message?.locationMessage ?? msg.raw?.message?.liveLocationMessage;
    return { lat: loc?.degreesLatitude ?? 0, lng: loc?.degreesLongitude ?? 0, caption: caption || "" };
  }
  if (type === "poll") {
    const poll = msg.raw?.message?.pollCreationMessage ?? msg.raw?.message?.pollCreationMessageV2 ?? msg.raw?.message?.pollCreationMessageV3;
    return { caption: poll?.name ?? caption ?? "", options: poll?.options?.map((o: any) => o.optionName) ?? [] };
  }
  const tag = CONTENT_TAGS[type];
  if (!tag) return caption || "";
  return caption ? `[<${tag} />] ${caption}` : `[<${tag} />]`;
}

async function resolve_contact(wa: any, jid: string): Promise<{ phone: string; name: string }> {
  const phone = jid.split("@")[0];
  try {
    const c = await wa.Contact.get(jid);
    if (c) return { phone: c.phone, name: c.name };
  } catch {}
  return { phone, name: phone };
}

// ═══════════════════════════════════════════════════════════════════════
// Action handler
// ═══════════════════════════════════════════════════════════════════════

async function handle(action: Record<string, unknown>): Promise<ActionResult> {
  try {
    if ("accounts" in action) {
      const result = [];
      for (const a of ws.list_accounts()) {
        let unread = 0;
        try { unread = (await a.wa.Chat.list(0, 500)).filter((c: { read: boolean }) => !c.read).length; } catch {}
        result.push({ phone: a.phone, status: a.status, synced_at: a.synced_at, unread });
      }
      return { ok: true, data: result };
    }

    if ("close" in action) {
      return { ok: true, data: { phone: await ws.close_account(action.owner as string | undefined), status: "closed" } };
    }

    if ("unread" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const chats = await account.wa.Chat.list(0, 500);
      const data = [];
      for (const c of chats as any[]) {
        const contact = await resolve_contact(account.wa, c.id);
        const msgs = await account.wa.Message.list(c.id, 0, 1);
        const last = msgs[0] as any;
        const raw_content = last ? format_content(last) : "";
        const content = typeof raw_content === "string" ? raw_content.slice(0, 100) : raw_content;
        data.push({ id: c.id, contact, read: c.read, content });
      }
      return { ok: true, data };
    }

    if ("react" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { reacted: await account.wa.Message.react(action.chat as string, action.message as string, action.react as string) } };
    }

    if ("delete" in action && "message" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { deleted: await account.wa.Message.remove(action.chat as string, action.message as string) } };
    }

    if ("text" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const msg = await account.wa.Message.text(action.chat as string, action.text as string);
      if (!msg) return { ok: false, error: "Failed to send message" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("image" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const buffer = await ws.read_file(action.image as string);
      const msg = await account.wa.Message.image(action.chat as string, buffer, action.caption as string | undefined);
      if (!msg) return { ok: false, error: "Failed to send image" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("video" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const buffer = await ws.read_file(action.video as string);
      const msg = await account.wa.Message.video(action.chat as string, buffer, action.caption as string | undefined);
      if (!msg) return { ok: false, error: "Failed to send video" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("audio" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const buffer = await ws.read_file(action.audio as string);
      const msg = await account.wa.Message.audio(action.chat as string, buffer, (action.ptt as boolean | undefined) ?? true);
      if (!msg) return { ok: false, error: "Failed to send audio" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("location" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const loc = action.location as { lat: number; lng: number };
      const msg = await account.wa.Message.location(action.chat as string, loc);
      if (!msg) return { ok: false, error: "Failed to send location" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("poll" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const p = action.poll as { caption: string; options: string[] };
      const msg = await account.wa.Message.poll(action.chat as string, { content: p.caption, options: p.options.map(o => ({ content: o })) });
      if (!msg) return { ok: false, error: "Failed to send poll" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("seen" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { seen: await account.wa.Chat.seen(action.chat as string) } };
    }

    if ("archive" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { archived: await account.wa.Chat.archive(action.chat as string, action.archive as boolean) } };
    }

    if ("pin" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { pinned: await account.wa.Chat.pin(action.chat as string, action.pin as boolean) } };
    }

    if ("delete" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { deleted: await account.wa.Chat.remove(action.chat as string) } };
    }

    if ("messages" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const msgs = await account.wa.Message.list(action.chat as string, (action.offset as number | undefined) ?? 0, action.messages as number);
      const data = [];
      for (const m of msgs as any[]) {
        const contact = await resolve_contact(account.wa, m.author);
        data.push({ id: m.id, contact, content: format_content(m) });
      }
      return { ok: true, data };
    }

    if ("contact" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const c = await account.wa.Contact.get(action.contact as string);
      if (!c) return { ok: false, error: "Contact not found" };
      return { ok: true, data: { id: c.id, name: c.name, phone: c.phone, photo: c.photo, bio: c.content } };
    }

    return { ok: false, error: "Unknown action shape" };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════

export async function func(app: Express, mcp: McpServer) {
  mcp.registerTool("whatsapp", {
    description: [
      "WhatsApp batch actions. Each object shape determines the operation:",
      "  { chat, text, owner? }               — Send text message",
      "  { chat, image, owner?, caption? }     — Send image",
      "  { chat, video, owner?, caption? }     — Send video",
      "  { chat, audio, owner?, ptt? }         — Send audio (ptt=true for voice note, default true)",
      "  { chat, location:{lat,lng}, owner? }  — Send location",
      "  { chat, poll:{caption,options:[]}, owner? } — Send poll",
      "  { chat, message, react, owner? }      — React to a message",
      "  { chat, message, delete:'all', owner?} — Delete message for everyone",
      "  { chat, seen: true, owner? }          — Mark chat as read",
      "  { chat, archive: bool, owner? }       — Archive/unarchive chat",
      "  { chat, pin: bool, owner? }           — Pin/unpin chat",
      "  { chat, delete: true, owner? }        — Delete chat",
      "  { chat, messages: N, owner?, offset? } — List N messages (non-text shown as [<Image/>] etc.)",
      "  { contact, owner? }                   — Get contact info",
      "  { unread: true, owner? }              — List unread chats",
      "  { accounts: true }                    — List linked accounts",
      "  { close: true, owner? }               — Disconnect and remove account",
      "Returns [{ ok, data?, error? }] in the same order.",
    ].join("\n"),
    inputSchema: z.object({
      actions: z.array(Action).describe("Array of action objects"),
    }),
  }, async (input) => {
    const results: ActionResult[] = [];
    for (const action of input.actions) results.push(await handle(action as Record<string, unknown>));
    return { content: [{ type: "text" as const, text: JSON.stringify(results) }] };
  });

  await ws.boot();
}
