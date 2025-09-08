import type { Metadata } from "next";
import ClientChat from "./ClientChat";

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
  return (
    <section
      aria-label="Asistente"
      className="mx-auto max-w-3xl rounded-2xl p-8 md:p-12 border border-border shadow-soft bg-background"
    >
      <h1 className="text-2xl md:text-3xl font-semibold">Asistente</h1>
      <div className="mt-6">
        <ClientChat />
      </div>
    </section>
  );
}