// src/app/projects/[id]/page.tsx
import { projects } from "@/data/projects";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { loadCase } from "./cases"; // <- loader que importa el MDX según el id

type Params = { id: string };

/**
 * Pre-renderiza una página por cada proyecto (SSG).
 * Next generará /projects/<id> para todos los ids de src/data/projects.ts.
 */
export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

/**
 * SEO/OG dinámico por proyecto usando los datos del data source.
 */
export function generateMetadata({ params }: { params: Params }) {
  const p = projects.find((x) => x.id === params.id);
  if (!p) return { title: "Proyecto no encontrado" };
  return {
    title: `${p.title} – Proyecto`,
    description: p.blurb,
    openGraph: {
      title: p.title,
      description: p.blurb,
      url: `/projects/${p.id}`,
      images: p.cover
        ? [{ url: p.cover, width: 1200, height: 630, alt: p.alt }]
        : undefined,
      type: "article",
    },
  };
}

export default async function ProjectDetail({ params }: { params: Params }) {
  const p = projects.find((x) => x.id === params.id);
  if (!p) notFound();

  // Importa el componente MDX del caso si existe para este id.
  const Case = await loadCase(params.id);

  return (
    <main className="container mx-auto max-w-4xl py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {p.title}
        </h1>
        <p className="text-muted-foreground">{p.blurb}</p>
        <div className="flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <Badge key={t} variant="secondary" className="rounded-2xl">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      {/* Cover: mantiene la estética del detalle */}
      {p.cover && (
        <div className="relative aspect-video rounded-2xl overflow-hidden border">
          <Image src={p.cover} alt={p.alt} fill className="object-cover" />
        </div>
      )}

      {/* Highlights tal y como los tenías */}
      {p.highlights?.length ? (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Highlights</h2>
          <ul className="list-disc pl-5 space-y-1">
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {(p.stack?.length || p.links) && (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            {p.stack?.length ? (
              <div className="space-y-2">
                <h3 className="text-base font-medium">Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <Badge key={s} variant="outline" className="rounded-2xl">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {p.links && (
              <div className="flex gap-4 pt-2">
                {p.links.live && (
                  <Link className="underline" href={p.links.live}>
                    Ver
                  </Link>
                )}
                {p.links.repo && (
                  <a
                    className="underline"
                    href={p.links.repo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Repo
                  </a>
                )}
                {/* El enlace “Caso” ahora suele apuntar a /projects/<id>#case */}
                {p.links.case && p.links.case !== `/projects/${p.id}` && (
                  <Link className="underline" href={p.links.case}>
                    Caso
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sección de Caso embebida (MDX), mantiene la UI del detalle */}
      {Case && (
        <section
          id="case"
          className="mt-12 rounded-2xl border border-border bg-background p-8 md:p-12 shadow-soft"
        >
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <Case />
          </div>
        </section>
      )}
    </main>
  );
}
