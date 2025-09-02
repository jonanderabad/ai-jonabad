"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

type ChatMessage = { role: "user" | "assistant"; content: string }
const MODES = ["FAQ", "CV", "Proyectos"] as const
const LS_KEY = "ai-jonabad-chat"

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<(typeof MODES)[number]>("FAQ")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const endRef = useRef<HTMLDivElement | null>(null)

  // Persistencia en localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setMessages(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: ChatMessage = { role: "user", content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setLoading(true)
    try {
      // Tu API ya acepta { messages:[...] }. Añadimos el modo en el último mensaje.
      const payload = {
        messages: [
          ...history.slice(0, -1),
          { role: "user", content: `[Modo: ${mode}] ${userMsg.content}` },
        ],
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const assistantText =
        data?.reply?.content ??
        data?.reply ??
        "…"
      setMessages(m => [...m, { role: "assistant", content: String(assistantText) }])
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Fallo al contactar con el asistente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="max-w-3xl mx-auto grid gap-4">
      <h1 className="text-3xl font-semibold">Asistente</h1>

      {/* Chips de modo */}
      <div className="flex gap-2">
        {MODES.map(m => (
          <Button
            key={m}
            size="sm"
            variant={m === mode ? "default" : "outline"}
            onClick={() => setMode(m)}
          >
            {m}
          </Button>
        ))}
      </div>

      <Card className="rounded-2xl border border-border">
        <ScrollArea className="h-[60vh] p-4">
          <div className="grid gap-3">
            {messages.length === 0 && !loading && (
              <p className="text-muted-foreground">
                Empieza una conversación. Prueba: "¿Quién es Jon Abad?" o "Muestra proyectos".
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "justify-self-end" : "justify-self-start"}>
                <div
                  className={
                    msg.role === "user"
                      ? "px-3 py-2 rounded-xl bg-primary/20 text-foreground"
                      : "px-3 py-2 rounded-xl bg-card border border-border text-foreground"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-muted-foreground">Escribiendo…</div>}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="p-3 flex gap-2">
          <Input
            placeholder={`Escribe en modo ${mode}… (Enter para enviar)`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <Button onClick={send} disabled={loading} aria-label="Enviar">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
