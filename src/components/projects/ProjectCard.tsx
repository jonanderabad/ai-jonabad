// src/components/projects/ProjectCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  const { id, title, blurb, tags, cover, alt, links } = project;
  return (
    <Card className="overflow-hidden rounded-2xl hover:shadow-soft transition-shadow">
      <div className="relative aspect-video">
        <Image src={cover} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority={false}/>
      </div>
      <CardContent className="p-5 space-y-3">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{blurb}</p>

        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Badge key={`${id}-${t}`} variant="secondary" className="rounded-2xl">
              {t}
            </Badge>
          ))}
        </div>

        <nav className="flex gap-3 text-sm pt-1">
          {links?.live && (
            <Link className="underline underline-offset-4" href={links.live}>Ver</Link>
          )}
          {links?.case && (
            <Link className="underline underline-offset-4" href={links.case}>Caso</Link>
          )}
          {links?.repo && (
            <a className="underline underline-offset-4" href={links.repo} target="_blank" rel="noreferrer">Repo</a>
          )}
        </nav>
      </CardContent>
    </Card>
  );
}
