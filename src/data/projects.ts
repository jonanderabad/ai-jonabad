// src/data/projects.ts
export type Project = {
  id: string;
  title: string;
  blurb: string;
  year: number;
  tags: string[];
  stack: string[];
  cover: string;
  alt: string;
  links?: { live?: string; repo?: string; case?: string };
  featured?: boolean;
  highlights?: string[];
};

export const projects: Project[] = [
  {
    id: "jon-abad-assistant",
    title: "Jon Abad Assistant",
    blurb:
      "Asistente conversacional con RAG, guardarraíles y streaming en Edge, integrado en mi portfolio.",
    year: 2025,
    tags: ["RAG", "Streaming", "Guardarraíles"],
    stack: ["Next.js (Edge)", "OpenAI SDK", "Supabase"],
    cover: "/projects/jon-abad-assistant/cover.webp",
    alt: "Interfaz del asistente con respuestas en streaming y citación de contexto",
    links: {
      live: "/assistant",
      repo: "https://github.com/jonanderabad/ai-jonabad",
      case: "/projects/jon-abad-assistant#case",
    },
    featured: true,
    highlights: [
      "P95 de respuesta ≈ 950 ms con streaming Edge.",
      "RAG con embeddings (top-K=10) y KB de 176 entradas.",
      "Rate limiting distribuido (Supabase): 429 + Retry-After y UX de bloqueo.",
    ],
  },
  {
    id: "maquina-de-cuentos",
    title: "Máquina de Cuentos",
    blurb:
      "Ecosistema multi-agente para generar cuentos: guion por escenas y arte consistente con Flux/ComfyUI.",
    year: 2025,
    tags: ["Generativo", "Narrativa", "Multi-agente"],
    stack: ["Flux Kontext", "ComfyUI", "PyTorch"],
    cover: "/projects/maquina-de-cuentos/cover.webp",
    alt: "Storyboard de cuento con prompts por escena y arte consistente",
    links: { case: "/projects/maquina-de-cuentos#case" },
    featured: true,
    highlights: [
      "Pipeline estructurado: texto → prompts por escena → imágenes con consistencia.",
      "Control de semilla y LoRA para continuidad de estilo y personaje.",
      "Operable localmente o con GPU externas; integración con Flux Playground.",
    ],
  },
  {
    id: "portfolio-inteligente",
    title: "Portfolio Inteligente (ai.jonabad.es)",
    blurb:
      "Sitio y sistema base con SEO, OG dinámico y asistente integrado para mostrar trabajo real en producción.",
    year: 2025,
    tags: ["Web", "SEO", "RAG"],
    stack: ["Next.js 15", "Tailwind + shadcn", "Vercel"],
    cover: "/projects/portfolio-inteligente/cover.webp",
    alt: "Homepage con hero animado y acceso al asistente",
    links: {
      live: "/",
      repo: "https://github.com/jonanderabad/ai-jonabad",
      case: "/projects/portfolio-inteligente#case",
    },
    featured: true,
  },
  {
    id: "mcp-academy",
    title: "MCP Academy / Mente Sintética",
    blurb:
      "Formación aplicada: fundamentos de MCP, creación de servidores y flujo real de despliegue.",
    year: 2025,
    tags: ["Formación", "MCP", "Agentes"],
    stack: ["Claude Desktop", "MCP", "GitHub"],
    cover: "/projects/mcp-academy/cover.webp",
    alt: "Diapositivas y demo en vivo de un servidor MCP",
    links: { live: "/academy", case: "/projects/mcp-academy#case" },
    featured: false,
    highlights: [
      "Masterclass de iniciación: los alumnos crean su primer servidor MCP.",
      "Recursos curados y guía paso a paso desde cero.",
      "Próxima sesión: clientes y MCPs personalizados en producción.",
    ],
  },
];
