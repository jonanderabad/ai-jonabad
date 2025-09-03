export const metadata = {
  title: "Proyectos",
  description: "Selección de proyectos y casos con IA aplicada.",
};

import { Card } from "@/components/ui/card"

export default function Projects() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card className="rounded-2xl border border-border p-5 shadow-soft">
        <h3 className="text-xl font-medium">Máquina de Cuentos</h3>
        <p className="text-muted-foreground">Pipeline multi-agente para cuentos infantiles.</p>
      </Card>
      <Card className="rounded-2xl border border-border p-5 shadow-soft">
        <h3 className="text-xl font-medium">AI-JonAbad Assistant</h3>
        <p className="text-muted-foreground">Chat con RAG y guardarraíl sobre Jon Abad.</p>
      </Card>
    </div>
  )
}
