import OpenAI from "openai";

export const runtime = "edge";

// Rate limit simple en memoria por IP (mejorable con Redis/Upstash)
const WINDOW_MS = 60_000;
const MAX_REQ = 10;
const ipHits = new Map<string, number[]>();

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Falta OPENAI_API_KEY." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    if (!rawMessages.length) {
      return new Response(JSON.stringify({ error: "Payload inválido. Se espera { messages: [...] }" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rate limit
    const ip = getIp(req);
    const now = Date.now();
    const arr = ipHits.get(ip) ?? [];
    const recent = arr.filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_REQ) {
      return new Response(JSON.stringify({ error: "Rate limit excedido. Inténtalo en un minuto." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    recent.push(now);
    ipHits.set(ip, recent);

    // Asegura solo {role, content} y corta a los últimos 20
    const messages = rawMessages
      .map((m: any) => ({ role: m.role, content: m.content }))
      .slice(-20);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.7,
      messages,
    });

    const reply = completion.choices?.[0]?.message;
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Error inesperado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
