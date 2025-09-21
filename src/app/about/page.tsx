// src/app/about/page.tsx
import { about } from "@/data/about";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sobre mí",
  description: "Perfil, enfoque y experiencia de Jon Abad.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-3xl py-12 space-y-8">
      <article className="prose prose-zinc dark:prose-invert">
        <h1>Sobre mí</h1>

        {/* Pitch corto (tu “one-liner”) */}
        <p className="text-lg text-muted-foreground">{about.pitch}</p>

        {/* Intro larga desde data */}
        <p>{about.intro}</p>

        <h2>Cómo trabajo</h2>
        <ul>
          {about.how.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2>Stack</h2>
        <div className="not-prose flex flex-wrap gap-2">
          {about.stack.map((t) => (
            <Badge key={t} variant="secondary" className="rounded-2xl">
              {t}
            </Badge>
          ))}
        </div>

        <h2>Highlights</h2>
        <ul>
          {about.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </article>

      <div className="not-prose">
        <Button asChild size="lg" className="rounded-2xl">
          <a href={about.cta.href}>{about.cta.label}</a>
        </Button>
      </div>
    </main>
  );
}
