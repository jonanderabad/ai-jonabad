import OpenAI from "openai";
import { KB_DOCS, type KBDoc } from "@/data/kb";

export const runtime = "edge";

// Rate limit simple en memoria por IP (mejorable con Redis/Upstash)
const WINDOW_MS = 60_000;
const MAX_REQ = 10;
const ipHits = new Map<string, number[]>();

// Umbral de on-topic (ajústalo si hace falta)
const ON_TOPIC_THRESHOLD = 0.30;

// Mensaje de rechazo fuera de tema
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

    // Obtener la última consulta del usuario para RAG
    const lastUserMessage = messages
      .filter((m: any) => m.role === "user")
      .pop()?.content || "";

    // Buscar en base de conocimiento (búsqueda simple por texto)
    const knowledgeResults = KB_DOCS.filter((doc: KBDoc) => 
      doc.text.toLowerCase().includes(lastUserMessage.toLowerCase()) ||
      doc.title.toLowerCase().includes(lastUserMessage.toLowerCase()) ||
      doc.tags?.some((tag: string) => lastUserMessage.toLowerCase().includes(tag.toLowerCase()))
    ).slice(0, 2);
    
    const context = knowledgeResults.length > 0 
      ? knowledgeResults.map((doc: KBDoc) => `**${doc.title}**: ${doc.text}`).join("\n\n")
      : "";

    // Verificar si la consulta es relevante (guardarraíl básico)
    const isOnTopic = knowledgeResults.length > 0 || 
      lastUserMessage.toLowerCase().includes("jon") ||
      lastUserMessage.toLowerCase().includes("abad") ||
      lastUserMessage.toLowerCase().includes("mente sintética") ||
      lastUserMessage.toLowerCase().includes("portfolio") ||
      lastUserMessage.toLowerCase().includes("servicios") ||
      lastUserMessage.toLowerCase().includes("proyectos");

    // Si está fuera de tema, devolver mensaje de rechazo
    if (!isOnTopic && lastUserMessage.length > 10) {
      return new Response(JSON.stringify({ 
        reply: { 
          role: "assistant", 
          content: OFF_TOPIC_REPLY 
        } 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Reemplazar el system message con contexto RAG
    const systemWithContext = {
      role: "system" as const,
      content: `
Eres el asistente del portfolio de Jon Ander Abad.
Reglas:
- Responde SOLO a preguntas sobre Jon Ander Abad (bio, proyectos, habilidades, forma de trabajar).
- Usa EXCLUSIVAMENTE el CONTEXTO proporcionado; si falta, dilo y pide que reformulen.
- No inventes datos. Sé breve, claro y orientado a quien visita su portfolio.

CONTEXTO:
${context || "(No hay contexto relevante para esta pregunta)"}
      `.trim(),
    };

    // Reemplazar system message y mantener solo conversación reciente
    const messagesForAPI = [
      systemWithContext,
      ...messages.filter((m: any) => m.role !== "system").slice(-10)
    ];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.7,
      messages: messagesForAPI,
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
