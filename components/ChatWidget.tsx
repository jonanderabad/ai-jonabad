"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

const STORAGE_KEY = "ms_chat_history_v1";
const SUGGESTIONS = [
  "¿Qué puedes hacer por mí?",
  "Explícame el proyecto en 2 frases.",
  "Quiero una demo de capacidades.",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "Eres el asistente de la web de Jon Abad – Mente Sintética. Responde con claridad y utilidad. Si preguntan por servicios, explica breve y ofrece CTA educada.",
    },
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy? 😊",
    },
  ]);

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
  }, [messages, open]);

  async function sendMessage(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Solo mandamos role+content por si añadimos metadatos en el futuro
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json();

      if (data?.reply?.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply.content },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Lo siento, no he podido obtener respuesta ahora mismo. Intenta de nuevo en unos segundos.",
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error de red: ${e?.message ?? "desconocido"}`,
        },
      ]);
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

  return (
    <>
      {/* Botón flotante */}
      <button
        aria-label="Abrir chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg bg-black text-white hover:opacity-90 transition"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Panel del chat */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[min(92vw,380px)] h-[560px] rounded-2xl shadow-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="font-semibold">Asistente · Mente Sintética</div>
            <button
              onClick={() => setOpen(false)}
              className="text-sm opacity-70 hover:opacity-100"
              aria-label="Cerrar"
            >
              Cerrar
            </button>
          </div>

          {/* Sugerencias rápidas */}
          <div className="px-4 pt-3 flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                disabled={loading}
                className="text-xs px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
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
                      ? "bg-neutral-100 dark:bg-neutral-800 self-start"
                      : "bg-black text-white dark:bg-white dark:text-black self-end ml-auto"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none"
              placeholder={loading ? "Generando respuesta..." : "Escribe tu mensaje..."}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="rounded-xl px-3 py-2 text-sm bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}