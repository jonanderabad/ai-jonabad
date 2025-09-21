export const about = {
    pitch:
      "Arquitecto IA: llevo la IA de la idea al impacto, en producción.",
    intro:
      "Soy Jon Abad, Arquitecto IA. Diseño y construyo asistentes y flujos generativos que pasan de la demo al producto. Trabajo con equipos de producto, pymes y creadores que quieren resultados medibles: RAG con embeddings, respuesta en streaming en Edge y guardarraíles que mantienen el control. Pienso en todo el ciclo: saneado de entradas, recuperación y re-ranking, límites de uso, trazabilidad y observabilidad. Mido antes de opinar: latencia P95, recall@k, tasas 4xx/5xx y satisfacción real de usuario. En mi Portfolio Inteligente aplico este enfoque con RAG, guardarraíles semánticos, rate limiting distribuido y streaming; en Máquina de Cuentos exploro consistencia visual y narrativa con pipelines multi-agente (Flux/ComfyUI). Comparto lo que aprendo en Mente Sintética y MCP Academy, con sesiones prácticas sobre MCP, agentes y despliegue en producción. Mi objetivo: llevar la IA de la idea al impacto, con código mínimo, diseño claro y métricas que importan.",
    how: [
      "Definir problema, métricas y restricciones; acordar éxito verificable.",
      "Prototipar rápido en Edge; iterar con usuarios y datos reales.",
      "Blindar seguridad: guardarraíles, saneado, límites, observabilidad y pruebas.",
    ],
    stack: ["Next.js (Edge)", "Vercel", "OpenAI SDK", "Supabase", "pgvector"],
    highlights: [
      "Asistente en producción con streaming Edge; P95 ≈ 950 ms.",
      "RAG con embeddings y guardarraíl semántico; KB con 176 entradas.",
      "Rate limiting distribuido en Supabase; 429 + Retry-After implementados.",
    ],
    cta: { label: "Hablemos", href: "/assistant" },
  } as const;
  