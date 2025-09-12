// src/app/api/chat/route.ts
import OpenAI from "openai";
import { sanitizeUserText } from "@/lib/sanitize";
import { topKByCosine, buildContext } from "@/lib/rag";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "edge";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const EMB_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

// Guardarraíl semántico (por umbral de similitud)
const OFF_TOPIC = 0.23;
const NEEDS_CLARIFY = 0.30;

const OFF_TOPIC_REPLY =
  "Solo puedo responder a preguntas sobre *Jon Ander Abad* (perfil, proyectos, habilidades y forma de trabajar). Reformula tu pregunta, por favor.";

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

    // Rate limit (util modular)
    const { ok, reset } = await rateLimit(getIp(req));
    if (!ok) {
      return new Response(
        JSON.stringify({ error: `Rate limit excedido. Inténtalo en ${(reset / 1000).toFixed(0)}s.` }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse y saneo de entrada
    const body = await req.json().catch(() => ({}));
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    if (!rawMessages.length) {
      return new Response(JSON.stringify({ error: "Payload inválido. Se espera { messages: [...] }" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages: ChatMessage[] = rawMessages
      .map((m: any) => ({ role: m.role, content: m.content }))
      .slice(-20);

    const lastUser = messages.filter((m) => m.role === "user").pop();
    const userText = sanitizeUserText(lastUser?.content || "");
    if (!userText) {
      return new Response(
        JSON.stringify({ reply: { role: "assistant", content: "Necesito una pregunta o indicación clara." } }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Recuperación semántica con embeddings
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let maxScore = 0;
    let context = "";

    try {
      const emb = await openai.embeddings.create({ model: EMB_MODEL, input: userText });
      const vec = emb.data[0].embedding;

      const retrieved = topKByCosine(vec, 6);
      maxScore = retrieved[0]?.score ?? 0;

      if (maxScore >= NEEDS_CLARIFY) {
        context = buildContext(retrieved, 1200);
      }
    } catch {
      maxScore = 0;
      context = "";
    }

    // Guardarraíl semántico por umbral
    if (maxScore < OFF_TOPIC && userText.length > 10) {
      return new Response(JSON.stringify({ reply: { role: "assistant", content: OFF_TOPIC_REPLY } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (maxScore >= OFF_TOPIC && maxScore < NEEDS_CLARIFY) {
      const content =
        "¿Podrías aclarar un poco tu pregunta para ajustarla al portfolio de *Jon Ander Abad*?\n" +
        "Ejemplos: “Resume la arquitectura del chat”, “¿Qué stack usa la web?”, “¿Qué mejoras IA hay previstas?”.";
      return new Response(JSON.stringify({ reply: { role: "assistant", content } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // System prompt con CONTEXTO (citas [KB: …] en el propio contexto)
    const systemWithContext = {
      role: "system" as const,
      content: [
        "Eres el asistente del portfolio de Jon Ander Abad.",
        "Reglas:",
        "- Responde SOLO si el tema es el portfolio (bio, proyectos, habilidades, arquitectura, forma de trabajo).",
        "- Usa EXCLUSIVAMENTE el CONTEXTO cuando exista; si falta, dilo explícitamente.",
        "- No inventes datos. Sé breve, claro y útil. Incluye citas tipo [KB: Título] cuando apliquen.",
        "- Extensión recomendada: 4–8 frases. Usa bullets si mejora la legibilidad.",
        "",
        "CONTEXTO:",
        context || "(No hay contexto relevante para esta pregunta).",
      ].join("\n"),
    };

    const messagesForAPI: ChatMessage[] = [
      systemWithContext,
      ...messages.filter((m) => m.role !== "system").slice(-10),
    ];

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 500,
      messages: messagesForAPI,
    });

    const reply = completion.choices?.[0]?.message;
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Error inesperado" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
