import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Bloque intro debajo del Hero */}
      <section
        id="intro"
        className="rounded-2xl p-8 md:p-12 border border-border shadow mt-12 bg-background"
      >
        <h2 className="text-2xl md:text-3xl font-semibold">Portfolio inteligente</h2>
        <p className="mt-3 text-muted-foreground max-w-prose">
          RAG con guardarraíl, demo en vivo y proyectos seleccionados.
        </p>
      </section>
    </main>
  );
}
