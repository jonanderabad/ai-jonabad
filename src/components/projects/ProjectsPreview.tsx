// src/components/projects/ProjectsPreview.tsx
import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectsPreview() {
  const featured = projects.filter(p => p.featured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="container mx-auto py-12 space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Proyectos destacados</h2>
        <p className="text-sm text-muted-foreground">Una muestra rápida de mi trabajo reciente.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  );
}
