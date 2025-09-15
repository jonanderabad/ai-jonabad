"use client";

import { useEffect, useRef, useState } from "react";
import { useRetryAfter } from "@/hooks/useRetryAfter";           // 🔽 NUEVO
import { useToast } from "@/components/ui/use-toast";            // 🔽 NUEVO

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

const STORAGE_KEY = "ms_chat_history_v1";
const SUGGESTIONS = [
  "¿Qué puedes hacer por mí?",
  "Explícame el proyecto en 2 frases.",
  "Quiero una demo de capacidades.",
];

export default function ChatWidget() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "Eres el asistente de la web de Jon Ander Abad – Mente Sintética. Responde con claridad y utilidad. Si preguntan por servicios, explica breve y ofrece CTA educada.",
    },
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy? 😊",
    },
  ]);

  // 🔽 NUEVO: rate limit (429) — cuenta atrás y control de bloqueo
  const { isRateLimited, seconds, start: startCooldown } = useRetryAfter();
  const { toast } = useToast();

  // Cargar historial
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {}
  }, []);

  // Guardar historial (máx 50)
  useEffect(() => {
    try {
      const toStore = messages.slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {}
  }, [messages]);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || loading || isRateLimited) return;

    // Guardamos el valor para poder restaurarlo si hay 429
    const original = text;
    // No vaciamos el input aún; lo haremos tras éxito
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(nextMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Solo mandamos role+content por si añadimos metadatos en el futuro
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      // 🔽 NUEVO: manejo explícito de 429
      if (res.status === 429) {
        const retry = Number(res.headers.get("Retry-After") ?? "10");
        // Restauramos el input para que el usuario no pierda el texto
        setInput(original);
        // Disparamos cuenta atrás y aviso
        startCooldown(retry);
        toast({
          title: "Has alcanzado el límite",
          description: `Podrás enviar de nuevo en ${retry} segundos.`,
        });
        return; // no seguimos flujo normal
      }

      const data = await res.json();

      if (data?.reply?.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply.content },
        ]);
        // Éxito: ahora sí limpiamos el input
        setInput("");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Lo siento, no he podido obtener respuesta ahora mismo. Intenta de nuevo en unos segundos.",
          },
        ]);
        // Si falló por otra razón, dejamos el texto para reintentar manualmente
        setInput(original);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error de red: ${e?.message ?? "desconocido"}`,
        },
      ]);
      setInput(original);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  const isBlocked = loading || isRateLimited;
  const placeholder = isRateLimited
    ? `Espera ${seconds}s…`
    : loading
    ? "Generando respuesta..."
    : "Escribe tu mensaje...";

  return (
    <div className="w-full">
      {/* Panel del chat */}
      <div className="w-full h-[560px] rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="font-semibold">Asistente · Mente Sintética</div>
        </div>

        {/* Sugerencias rápidas */}
        <div className="px-4 pt-3 flex gap-2 flex-wrap">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={isBlocked} // 🔽 NUEVO: respeta envío/429
              className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-muted self-start"
                    : "bg-primary text-primary-foreground self-end ml-auto"
                }`}
              >
                {m.content}
              </div>
            ))}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            placeholder={placeholder}        // 🔽 NUEVO
            disabled={isBlocked}             // 🔽 NUEVO
            aria-disabled={isBlocked}        // accesibilidad
          />
          <button
            onClick={() => sendMessage()}
            disabled={isBlocked || !input.trim()} // 🔽 NUEVO
            className="rounded-xl px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            title={isRateLimited ? `Espera ${seconds}s` : "Enviar"}
            aria-disabled={isBlocked || !input.trim()}
          >
            {isRateLimited ? `Espera ${seconds}s` : loading ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
