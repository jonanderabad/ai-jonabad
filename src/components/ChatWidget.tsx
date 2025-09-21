"use client";

import { useEffect, useRef, useState } from "react";
import { useRetryAfter } from "@/hooks/useRetryAfter";
import { useToast } from "@/components/ui/use-toast";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

const STORAGE_KEY = "ms_chat_history_v1";
const SUGGESTIONS = [
  "Portfolio de Jon Abad.",
  "Proyectos destacados.",
  "Flujo RAG del asistente.",
];

export default function ChatWidget() {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false); // 🔄 streaming en curso
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

  const { isRateLimited, seconds, start: startCooldown } = useRetryAfter();
  const { toast } = useToast();

  // Control para cancelar el stream
  const abortRef = useRef<AbortController | null>(null);

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

  // Autoscroll al final en cada actualización de mensajes
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || isStreaming || isRateLimited) return;

    const original = text; // para restaurar en caso de 429/error
    setInput(""); // limpiamos visualmente al enviar
    setIsStreaming(true);

    // 1) Insertar mensaje del usuario
    const userMsg: ChatMessage = { role: "user", content: text };
    // Historial que enviaremos al backend (sin systems), últimas 10
    const historyForServer: ChatMessage[] = [...messages, userMsg]
      .filter((m) => m.role !== "system")
      .slice(-10);

    // 2) Insertar placeholder del asistente (se irá rellenando con el stream)
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);

    // 3) Petición con lectura de stream
    const controller = new AbortController();
    abortRef.current = controller;

    let acc = ""; // acumulador del texto que llega por chunks

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Formato ligero y compatible con tu route.ts unificado:
        // { message, history }
        body: JSON.stringify({
          message: userMsg.content,
          history: historyForServer.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      // 429 → countdown + restaurar input y quitar placeholder
      if (res.status === 429) {
        const retry = Number(res.headers.get("Retry-After") ?? "10");
        startCooldown(retry);
        toast({
          title: "Has alcanzado el límite",
          description: `Podrás enviar de nuevo en ${retry} segundos.`,
        });
        // Quitamos el placeholder de asistente vacío
        setMessages((prev) => prev.slice(0, -1));
        setInput(original);
        setIsStreaming(false);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("La respuesta no es válida.");
      }

      // Leer el cuerpo por chunks (texto plano: streaming o respuestas cortas)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          acc += chunk;
          // Actualizamos el último mensaje (assistant) en vivo
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (lastIdx >= 0 && copy[lastIdx].role === "assistant") {
              copy[lastIdx] = { role: "assistant", content: acc };
            }
            return copy;
          });
        }
      }
    } catch (e: any) {
      // Error de red/cancelación antes de recibir stream
      setMessages((prev) => {
        const copy = [...prev];
        // Si el último era el placeholder vacío, lo sustituimos por un aviso
        const lastIdx = copy.length - 1;
        if (lastIdx >= 0 && copy[lastIdx].role === "assistant" && copy[lastIdx].content === "") {
          copy[lastIdx] = {
            role: "assistant",
            content: `No se pudo completar la respuesta. ${e?.name === "AbortError" ? "(detenido por el usuario)" : ""}`,
          };
        } else {
          copy.push({
            role: "assistant",
            content: `No se pudo completar la respuesta. ${e?.message ?? "Error desconocido."}`,
          });
        }
        return copy;
      });
      // Restauramos el input si no llegó nada
      if (!acc) setInput(original);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function cancelStreaming() {
    if (abortRef.current) {
      abortRef.current.abort();
      // Opcional: marca visual de truncado
      setMessages((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (lastIdx >= 0 && copy[lastIdx].role === "assistant") {
          copy[lastIdx] = {
            role: "assistant",
            content: copy[lastIdx].content ? copy[lastIdx].content + " …" : "…",
          };
        }
        return copy;
      });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  const isBlocked = isStreaming || isRateLimited;
  const placeholder = isRateLimited
    ? `Espera ${seconds}s…`
    : isStreaming
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
              disabled={isBlocked}
              className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mensajes */}
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

        {/* Input + acciones */}
        <div className="p-3 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            placeholder={placeholder}
            disabled={isBlocked}
            aria-disabled={isBlocked}
          />
          {!isStreaming ? (
            <button
              onClick={() => sendMessage()}
              disabled={isBlocked || !input.trim()}
              className="rounded-xl px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              title={isRateLimited ? `Espera ${seconds}s` : "Enviar"}
              aria-disabled={isBlocked || !input.trim()}
            >
              {isRateLimited ? `Espera ${seconds}s` : "Enviar"}
            </button>
          ) : (
            <button
              onClick={cancelStreaming}
              className="rounded-xl px-3 py-2 text-sm bg-secondary text-secondary-foreground"
              title="Detener respuesta"
            >
              Detener
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
