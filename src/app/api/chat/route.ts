// src/app/api/chat/route.ts
import OpenAI from "openai";
import { sanitizeUserText } from "@/lib/sanitize";
import { topKByCosine, buildContext } from "@/lib/rag";

export const runtime = "edge";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const EMB_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

// Guardarraíl semántico
const OFF_TOPIC = 0.23;
const NEEDS_CLARIFY = 0.30;

const OFF_TOPIC_REPLY =
  "Solo puedo responder a preguntas sobre *Jon Ander Abad* (perfil, proyectos, habilidades y forma de trabajar). Reformula tu pregunta, por favor.";

// Rate limit
const RL_LIMIT = 10;          // 10 solicitudes
const RL_WINDOW_SECONDS = 60; // por minuto

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

type RlRow = { ok: boolean; remaining: number; reset_at: string; hits: number };

async function rateLimitCheck(ip: string): Promise<RlRow> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }

  const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/rl_hit`;
  const body = {
    p_key: `ip:${ip}`,
    p_limit: RL_LIMIT,
    p_window_seconds: RL_WINDOW_SECONDS,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Rate limit RPC failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as RlRow[];
  if (!Array.isArray(data) || !data[0]) {
    throw new Error("Rate limit RPC returned empty payload");
  }
  return data[0];
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Falta OPENAI_API_KEY." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ---------- RATE LIMIT ----------
    const ip = getIp(req);
    const rl = await rateLimitCheck(ip);
    if (!rl.ok) {
      const retryAfter = Math.max(
        1,
        Math.ceil((new Date(rl.reset_at).getTime() - Date.now()) / 1000)
      );
      return new Response(
        JSON.stringify({
          error: `Rate limit excedido. Inténtalo en ${retryAfter}s.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(RL_LIMIT),
            "X-RateLimit-Remaining": String(rl.remaining ?? 0),
            "X-RateLimit-Reset": new Date(rl.reset_at).toISOString(),
          },
        }
      );
    }

    // ---------- ENTRADA (soporta dos formatos) ----------
    const body = await req.json().catch(() => ({} as any));

    let incomingMessages: ChatMessage[] = [];
    if (Array.isArray(body?.messages)) {
      // Formato: { messages: [...] }
      incomingMessages = body.messages
        .map((m: any) => ({ role: m.role, content: m.content }))
        .slice(-20);
    } else if (typeof body?.message === "string") {
      // Formato: { message: "...", history: [...] }
      const history: ChatMessage[] = Array.isArray(body?.history)
        ? body.history.map((m: any) => ({ role: m.role, content: m.content })).slice(-20)
        : [];
      incomingMessages = [...history, { role: "user", content: body.message }];
    } else {
      return new Response(
        JSON.stringify({
          error:
            "Payload inválido. Usa { messages:[...] } o { message:'...', history:[...] }",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Último input de usuario (sanitizado)
    const lastUser = incomingMessages.filter((m) => m.role === "user").pop();
    const userText = sanitizeUserText(lastUser?.content || "");
    if (!userText) {
      return new Response("Necesito una pregunta o indicación clara.", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // ---------- RAG ----------
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let maxScore = 0;
    let context = "";

    try {
      // 1) Embedding de la pregunta
      const emb = await openai.embeddings.create({
        model: EMB_MODEL,
        input: userText,
      });
      const vec = emb.data[0].embedding;

      // 2) Recuperación (más recall: K=10)
      const retrieved = topKByCosine(vec, 10);
      maxScore = retrieved[0]?.score ?? 0;

      // 3) SIEMPRE construimos contexto (no añadimos citas en la respuesta)
      context = buildContext(retrieved, 1200);
    } catch {
      maxScore = 0;
      context = "";
    }

    // ---------- GUARDARRAÍL ----------
    if (maxScore < OFF_TOPIC && userText.length > 10) {
      // Respuesta directa (texto plano) para integrarse con el lector de stream del cliente
      return new Response(OFF_TOPIC_REPLY, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (maxScore >= OFF_TOPIC && maxScore < NEEDS_CLARIFY) {
      const clarify =
        "¿Podrías aclarar un poco tu pregunta para ajustarla al portfolio de *Jon Ander Abad*?\n" +
        "Ejemplos: “Resume la arquitectura del chat”, “¿Qué stack usa la web?”, “¿Qué mejoras IA hay previstas?”.";
      return new Response(clarify, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // ---------- PROMPT CON CONTEXTO ----------
    const systemWithContext: ChatMessage = {
      role: "system",
      content: [
        "Eres el asistente del portfolio de Jon Ander Abad.",
        "Reglas:",
        "- Responde SOLO si el tema es el portfolio (bio, proyectos, habilidades, arquitectura, forma de trabajo).",
        "- Usa EXCLUSIVAMENTE el CONTEXTO cuando exista; si falta, dilo explícitamente.",
        "- No inventes datos. Sé breve, claro y útil.",
        "- Extensión recomendada: 4–8 frases. Usa bullets si mejora la legibilidad.",
        "",
        "CONTEXTO:",
        context || "(No hay contexto relevante para esta pregunta).",
      ].join("\n"),
    };

    // Conserva las últimas 10 (sin systems previos del cliente)
    const messagesForAPI: ChatMessage[] = [
      systemWithContext,
      ...incomingMessages.filter((m) => m.role !== "system").slice(-10),
    ];

    // ---------- STREAMING A CLIENTE ----------
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: MODEL,
            temperature: 0.7,
            max_tokens: 500,
            stream: true,
            messages: messagesForAPI,
          });

          for await (const part of completion) {
            const delta = part.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (err) {
          // Emitimos un mensaje corto de error para que el cliente no se quede vacío
          controller.enqueue(
            encoder.encode("\n\n[Error] Ha ocurrido un problema generando la respuesta.")
          );
          // Señalamos error para cerrar correctamente el stream
          try { controller.error(err as any); } catch {}
        } finally {
          try { controller.close(); } catch {}
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // Evita buffering/proxy y transforma en tiempo real
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Error inesperado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
