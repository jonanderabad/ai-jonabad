type Limiter = { ok: boolean; reset: number };

const windowMs = 60_000;
const maxReq = 10;
const hits = new Map<string, number[]>();

export async function rateLimit(ip: string): Promise<Limiter> {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return { ok: arr.length <= maxReq, reset: windowMs - (now - arr[0]) };
}
