"use client"
import { Card } from "@/components/ui/card"

export default function AssistantPage() {
  return (
    <div className="max-w-3xl mx-auto grid gap-4">
      <h1 className="text-3xl font-semibold">Asistente</h1>
      <Card className="rounded-2xl border border-border p-5 shadow-soft">
        <p className="text-muted-foreground">
          Aquí irá el chat (Card + ScrollArea + input). De momento es un placeholder.
        </p>
      </Card>
    </div>
  )
}
