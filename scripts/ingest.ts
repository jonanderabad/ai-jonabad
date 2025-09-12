// scripts/ingest.ts
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import OpenAI from "openai";
import { config as loadEnv } from "dotenv";

// Cargar variables de entorno desde .env.local (raíz del repo)
loadEnv({ path: ".env.local" });

type KBDoc = { id: string; title: string; text: string; url?: string; tags?: string[] };

const CHUNK_SIZE_TOKENS = 800;
const CHUNK_OVERLAP_TOKENS = 120;

function approxTokens(s: string) {
  return Math.ceil(s.length / 4); // ~4 chars ≈ 1 token
}

function chunkText(text: string) {
  const words = text.split(" ");
  const chunks: string[] = [];
  let cur: string[] = [];
  let curTokens = 0;

  for (const w of words) {
    const t = approxTokens(w + " ");
    if (curTokens + t > CHUNK_SIZE_TOKENS) {
      chunks.push(cur.join(" ").trim());
      const overlapWords = cur.join(" ").split(" ");
      const keep = overlapWords.slice(-Math.floor((CHUNK_OVERLAP_TOKENS * 4) / 5));
      cur = keep.length ? keep : [];
      curTokens = approxTokens(cur.join(" "));
    }
    cur.push(w);
    curTokens += t;
  }
  if (cur.length) chunks.push(cur.join(" ").trim());
  return chunks.filter(Boolean);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está definido. Añádelo en .env.local");
  }
  const embedModel = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

  const openai = new OpenAI({ apiKey });

  // Carga robusta del KB (Windows-friendly)
  const kbPath = path.resolve("src/data/kb.ts");
  const mod = await import(pathToFileURL(kbPath).href);
  const KB_DOCS: KBDoc[] = (mod as any).KB_DOCS || (mod as any).default || [];

  const out: any[] = [];
  for (const doc of KB_DOCS) {
    const chunks = chunkText(doc.text);
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i].slice(0, 8000); // seguridad
      const emb = await openai.embeddings.create({ model: embedModel, input: text });
      out.push({
        id: `${doc.id}::${i}`,
        docId: doc.id,
        title: doc.title,
        url: doc.url ?? null,
        tags: doc.tags ?? [],
        text,
        embedding: emb.data[0].embedding,
      });
    }
  }

  const outPath = path.resolve("src/data/kb_embeddings.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ model: embedModel, dim: out[0]?.embedding?.length ?? 1536, chunks: out }, null, 2)
  );
  console.log(`OK: ${out.length} chunks → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
