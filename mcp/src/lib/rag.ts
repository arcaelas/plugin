import { randomUUID } from "crypto";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { createInterface } from "readline";
import { LocalIndex } from "vectra";
import chunk from "./chunker.js";
import config from "./config.js";
import ollama from "./ollama.js";
import { Mutex } from "./rwlock.js";

// --- State ---

interface Doc {
  tags: string[];
  chunks: number;
  length: number;
}

let index: LocalIndex;
let docs: Record<string, Doc> = {};
let initialized = false;
const mutex = new Mutex();

const VECTORS_DIR = join(config.data_dir, "vectors");
const DOCS_PATH = join(config.data_dir, "documents.json");

// --- Init (idempotent) ---

async function ensure_init(): Promise<void> {
  if (initialized) return;
  await mkdir(config.data_dir, { recursive: true });
  index = new LocalIndex(VECTORS_DIR);
  if (!(await index.isIndexCreated())) await index.createIndex();
  if (existsSync(DOCS_PATH)) {
    docs = JSON.parse(await readFile(DOCS_PATH, "utf-8"));
  }
  initialized = true;
}

async function embed(input: string | string[]): Promise<number[][]> {
  const res = await ollama("/api/embed", { model: config.ollama_embedding_model, input });
  return ((await res.json()) as { embeddings: number[][] }).embeddings;
}

async function save(): Promise<void> {
  await writeFile(DOCS_PATH, JSON.stringify(docs, null, 2), "utf-8");
}

function assemble(chunks: string[]): string {
  if (chunks.length <= 1) return chunks[0] ?? "";
  let result = chunks[0];
  for (let i = 1; i < chunks.length; i++) {
    let overlap = 0;
    for (let len = Math.min(400, result.length, chunks[i].length); len > 10; len--) {
      if (result.endsWith(chunks[i].slice(0, len))) { overlap = len; break; }
    }
    result += chunks[i].slice(overlap);
  }
  return result;
}

// --- remember ---

export async function remember(params: {
  content: string;
  tags?: string[];
}): Promise<{ document: string }> {
  await ensure_init();
  const tags = params.tags ?? [];
  const chunks = chunk(params.content, 1600, 200);
  const vectors = await embed(chunks);

  return mutex.run(async () => {
    const id = randomUUID();
    await index.batchInsertItems(
      chunks.map((text, i) => ({
        id: randomUUID(),
        vector: vectors[i],
        metadata: { document_id: id, chunk_index: i, total_chunks: chunks.length, content: text },
      }))
    );
    docs[id] = { tags, chunks: chunks.length, length: params.content.length };
    await save();
    return { document: id };
  });
}

// --- search ---

export async function search(params: {
  content: string;
  tags?: string[];
  limit?: number;
}): Promise<Array<{ document: string; content: string; length: number }>> {
  await ensure_init();
  const limit = params.limit ?? 5;
  const filter_tags = params.tags ?? [];
  const [query_vector] = await embed(params.content);

  return mutex.run(async () => {
    let results = (await index.queryItems(query_vector, params.content, limit * 3))
      .filter((r) => r.score >= 0.3);

    if (filter_tags.length > 0) {
      results = results.filter((r) => {
        const doc = docs[r.item.metadata.document_id as string];
        return doc && filter_tags.some((t) => doc.tags.includes(t));
      });
    }

    const groups = new Map<string, { score: number; indices: Set<number>; total: number }>();
    for (const r of results) {
      const did = r.item.metadata.document_id as string;
      const ci = r.item.metadata.chunk_index as number;
      const tc = r.item.metadata.total_chunks as number;
      if (!groups.has(did)) groups.set(did, { score: r.score, indices: new Set(), total: tc });
      const g = groups.get(did)!;
      g.score = Math.max(g.score, r.score);
      g.indices.add(ci);
    }

    const out: Array<{ document: string; content: string; length: number }> = [];
    for (const [id, g] of groups) {
      const needed = new Set<number>();
      for (const idx of g.indices) {
        if (idx > 0) needed.add(idx - 1);
        needed.add(idx);
        if (idx < g.total - 1) needed.add(idx + 1);
      }
      const items = (await index.listItemsByMetadata({ document_id: id }))
        .filter((i) => needed.has(i.metadata.chunk_index as number))
        .sort((a, b) => (a.metadata.chunk_index as number) - (b.metadata.chunk_index as number));
      out.push({
        document: id,
        content: assemble(items.map((i) => i.metadata.content as string)),
        length: docs[id]?.length ?? 0,
      });
    }

    return out.sort((a, b) => b.length - a.length).slice(0, limit);
  });
}

// --- destroy ---

export async function destroy(params: {
  document: string | string[];
}): Promise<{ success: string[]; error: string[] }> {
  await ensure_init();
  const ids = Array.isArray(params.document) ? params.document : [params.document];

  return mutex.run(async () => {
    const success: string[] = [];
    const error: string[] = [];

    for (const id of ids) {
      if (!docs[id]) { error.push(id); continue; }
      const items = await index.listItemsByMetadata({ document_id: id });
      if (items.length > 0) {
        await index.beginUpdate();
        for (const item of items) await index.deleteItem(item.id);
        await index.endUpdate();
      }
      delete docs[id];
      success.push(id);
    }

    if (success.length > 0) await save();
    return { success, error };
  });
}

// --- upload ---

export async function upload(params: {
  filename: string;
}): Promise<{ errors: number[] }> {
  await ensure_init();
  const errors: number[] = [];

  const rl = createInterface({
    input: createReadStream(params.filename, "utf-8"),
    crlfDelay: Infinity,
  });

  let line = 0;
  for await (const raw of rl) {
    line++;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed);
      if (!entry.content || typeof entry.content !== "string") {
        errors.push(line);
        continue;
      }
      await remember({ content: entry.content, tags: entry.tags });
    } catch {
      errors.push(line);
    }
  }

  return { errors };
}

// --- download ---

export async function download(params: {
  filename: string;
}): Promise<{ errors: number[] }> {
  await ensure_init();
  const errors: number[] = [];
  const stream = createWriteStream(params.filename, "utf-8");

  let line = 0;
  for (const [id, doc] of Object.entries(docs)) {
    line++;
    try {
      const items = (await index.listItemsByMetadata({ document_id: id }))
        .sort((a, b) => (a.metadata.chunk_index as number) - (b.metadata.chunk_index as number));
      const content = assemble(items.map((i) => i.metadata.content as string));
      stream.write(JSON.stringify({ content, tags: doc.tags }) + "\n");
    } catch {
      errors.push(line);
    }
  }

  await new Promise<void>((resolve, reject) => {
    stream.end(() => resolve());
    stream.on("error", reject);
  });

  return { errors };
}
