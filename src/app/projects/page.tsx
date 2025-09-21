// src/app/projects/page.tsx
export const metadata = {
  title: "Proyectos",
  description: "Selección de proyectos y casos con IA aplicada.",
};

import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default function ProjectsPage() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">Proyectos</h1>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </section>
    </main>
  );
}
