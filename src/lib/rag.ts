import { z } from "zod";
import kb from "@/data/kb_embeddings.json";

/**
 * Tipado y validación de cada chunk embebido en la KB.
 */
export const EmbChunk = z.object({
  id: z.string(),
  docId: z.string(),
  title: z.string(),
  url: z.string().nullable(),
  tags: z.array(z.string()),
  text: z.string(),
  embedding: z.array(z.number()),
});
export type EmbChunk = z.infer<typeof EmbChunk>;

/**
 * Carga segura de la KB (si falla el parseo, deja estructura vacía).
 */
const KB = (() => {
  try {
    const chunks: EmbChunk[] = (kb as any).chunks.map((c: unknown) =>
      EmbChunk.parse(c)
    );
    return { ok: true, chunks, dim: (kb as any).dim as number };
  } catch {
    return { ok: false, chunks: [] as EmbChunk[], dim: 0 };
  }
})();

/* ----------------------- Utilidades vectoriales puras ---------------------- */

/** Producto escalar. */
export function dot(a: number[], b: number[]) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** Norma Euclídea con guardia para 0. */
export function norm(a: number[]) {
  return Math.sqrt(dot(a, a)) || 1;
}

/** Coseno clásico (equivale a cosineSim). */
export function cosine(a: number[], b: number[]) {
  const denom = norm(a) * norm(b);
  return denom ? dot(a, b) / denom : 0;
}

/**
 * Alias puro para tests: misma implementación que `cosine`,
 * expuesto con nombre estable para las specs.
 */
export function cosineSim(a: number[], b: number[]): number {
  return cosine(a, b);
}

/**
 * Ranking por similitud coseno. Devuelve los índices de `docs` ordenados
 * por mayor similitud respecto a `query` y recorta a `topK`.
 * No accede a la KB: es 100% determinista y testeable.
 */
export function rankBySimilarity(
  query: number[],
  docs: number[][],
  topK = 3
): number[] {
  const scored = docs.map((vec, i) => ({ i, s: cosineSim(query, vec) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, topK).map(({ i }) => i);
}

/* ------------------------ Recuperación sobre la KB ------------------------- */

export type Retrieval = { chunk: EmbChunk; score: number };

/**
 * Top-K chunks de la KB por coseno frente a `queryVec`.
 */
export function topKByCosine(queryVec: number[], k = 6): Retrieval[] {
  if (!KB.ok) return [];
  const scored = KB.chunks.map((chunk) => ({
    chunk,
    score: cosine(queryVec, chunk.embedding),
  }));
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, k);
}

/**
 * Construye contexto con presupuesto aproximado de tokens.
 */
export function buildContext(retrieved: Retrieval[], tokenBudget = 1200) {
  const parts: string[] = [];
  let approx = 0;
  for (const { chunk, score } of retrieved) {
    const head = `### ${chunk.title} [KB]\n`;
    const block = `${head}${chunk.text}\n\n[[KB: ${chunk.title} | score: ${score.toFixed(
      2
    )}]]\n`;
    const cost = Math.ceil(block.length / 4); // aprox 4 chars/token
    if (approx + cost > tokenBudget) break;
    parts.push(block);
    approx += cost;
  }
  return parts.join("");
}
