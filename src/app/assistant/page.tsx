import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asistente",
  description: "Habla con mi asistente sobre mi trabajo y proyectos.",
  alternates: { canonical: "/assistant" },
  openGraph: {
    title: "Asistente – Jon Abad",
    description: "Habla con mi asistente sobre mi trabajo y proyectos.",
    url: "/assistant",
    images: ["/og"],
  },
  twitter: {
    title: "Asistente – Jon Abad",
    description: "Habla con mi asistente sobre mi trabajo y proyectos.",
    images: ["/og"],
  },
};

export default function AssistantPage() {
  // Página server (SIN 'use client' y SIN hooks) para que compile limpia.
  return (
    <section className="rounded-2xl p-8 md:p-12 border border-border shadow-soft bg-background">
      <h1 className="text-2xl md:text-3xl font-semibold">Asistente</h1>
      <p className="mt-3 text-muted-foreground max-w-prose">
        Próximamente: chat con RAG y guardarraíl.
      </p>
    </section>
  );
}
