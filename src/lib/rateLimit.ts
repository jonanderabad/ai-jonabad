// src/lib/rateLimit.ts

// Interfaz compatible con tu código actual
export type Limiter = {
  ok: boolean;
  /** milisegundos restantes hasta que termine la ventana */
  reset: number;
  /** campos extra (si quieres usarlos en headers) */
  limit?: number;
  remaining?: number;
};

// ENV (solo servidor/edge)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Parámetros del RL (con defaults)
const RL_LIMIT = Number(process.env.RL_LIMIT ?? 10);
const RL_WINDOW_SECS = Number(process.env.RL_WINDOW_SECS ?? 60);

// ----------------- Backend distribuido (Supabase RPC) -----------------
async function rateLimitSupabase(key: string): Promise<Limiter> {
  const url = `${SUPABASE_URL}/rest/v1/rpc/rl_hit`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_key: key,
      p_limit: RL_LIMIT,
      p_window_secs: RL_WINDOW_SECS,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  const row = Array.isArray(data) ? data[0] : data;

  // Si falla la RPC o no hay fila, cae a local
  if (!res.ok || !row) return rateLimitLocal(key);

  // La RPC devuelve `reset` como epoch (segundos). Lo convertimos a ms restantes.
  const msRemaining = Math.max(0, Number(row.reset) * 1000 - Date.now());

  return {
    ok: !!row.ok,
    reset: msRemaining,
    limit: Number(row.limit),
    remaining: Number(row.remaining),
  };
}

// ----------------- Fallback local (dev) -----------------
type Bucket = { count: number; windowStartMs: number };
const g = globalThis as unknown as { __rl?: Map<string, Bucket> };
if (!g.__rl) g.__rl = new Map<string, Bucket>();

function rateLimitLocal(key: string): Limiter {
  const now = Date.now();
  const winMs = RL_WINDOW_SECS * 1000;
  const winStartMs = Math.floor(now / winMs) * winMs;

  const bucket = g.__rl!.get(key);
  if (!bucket || bucket.windowStartMs !== winStartMs) {
    g.__rl!.set(key, { count: 1, windowStartMs: winStartMs });
    return {
      ok: true,
      reset: winMs - (now - winStartMs),
      limit: RL_LIMIT,
      remaining: RL_LIMIT - 1,
    };
  }

  bucket.count += 1;
  const ok = bucket.count <= RL_LIMIT;
  return {
    ok,
    reset: Math.max(0, winMs - (now - bucket.windowStartMs)),
    limit: RL_LIMIT,
    remaining: Math.max(0, RL_LIMIT - bucket.count),
  };
}

// ----------------- API pública -----------------
/**
 * rateLimit(key) -> { ok, reset, limit?, remaining? }
 * - Usa Supabase si hay ENV; si no, cae a local.
 */
export async function rateLimit(key: string): Promise<Limiter> {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return await rateLimitSupabase(key);
    } catch {
      // fallback si hay error puntual de red/RPC
      return rateLimitLocal(key);
    }
  }
  return rateLimitLocal(key);
}
