// src/data/kb.ts
export type KBDoc = {
  id: string;
  title: string;
  text: string;   // texto plano (sin HTML)
  url?: string;
  tags?: string[];
};

export const KB_DOCS: KBDoc[] = [
  {
    id: "bio",
    title: "Resumen ejecutivo — Jon Ander Abad Fernández",
    text: `
Jon Ander Abad Fernández es Especialista en IA Generativa & Arte Digital y Arquitecto de IA.
Combina creatividad avanzada con dominio técnico profundo. Trabaja en la intersección del arte,
la tecnología y la estrategia, situándose en la vanguardia de la IA generativa.
    `.trim(),
    tags: ["perfil", "bio", "ia generativa", "arte digital", "arquitecto de ia", "jon ander"]
  },
  {
    id: "enfoque-profesional",
    title: "Enfoque profesional",
    text: `
Su trabajo explora cómo la IA transforma la creación visual, la narrativa digital y la producción audiovisual.
Apuesta por experiencias visuales impactantes, narrativas interactivas y soluciones automatizadas con IA.
    `.trim(),
    tags: ["enfoque", "narrativa", "producción audiovisual", "experiencias visuales"]
  },
  {
    id: "areas-especializacion",
    title: "Áreas de especialización",
    text: `
IA generativa (diseño y desarrollo de sistemas generativos), arte digital (experiencias visuales) y
arquitectura de IA (agentes inteligentes y sistemas automatizados).
    `.trim(),
    tags: ["especialización", "ia generativa", "arte digital", "arquitectura de ia"]
  },
  {
    id: "stack-herramientas",
    title: "Stack tecnológico y herramientas",
    text: `
Tecnologías: Model Context Protocol (MCP), ChatGPT, Claude, Cursor, VSCode, Freepik,
ComfyUI, Stable Diffusion, N8N, Flux Kontext, RunPod.
Especialización técnica: modelos de difusión, LLMs y sistemas generativos personalizados.
    `.trim(),
    tags: ["stack", "herramientas", "mcp", "stable diffusion", "comfyui", "n8n", "runpod", "llms"]
  },
  {
    id: "aptitudes-tecnicas-avanzadas",
    title: "Aptitudes técnicas avanzadas",
    text: `
Comprensión matemática de modelos de IA y del estado del arte en sistemas generativos.
Especialidades: creación visual, avatares hiperrealistas, experiencias inmersivas,
optimización de flujos de trabajo y agentes autónomos. Capacidades multimedia en música,
narrativa y producción audiovisual.
    `.trim(),
    tags: ["aptitudes", "matemáticas", "agentes", "flujos", "multimedia"]
  },
  {
    id: "experiencia-multidisciplinar",
    title: "Experiencia profesional multidisciplinar",
    text: `
Trayectoria en producción musical, diseño estratégico y campañas de marketing, organización de eventos
y creación de contenidos con impacto social y estético. Actualmente desarrolla su primer microservicio
de IA, optimiza workflows con soluciones generativas personalizadas y diseña sistemas escalables
orientados a objetivos de negocio.
    `.trim(),
    tags: ["experiencia", "producción musical", "marketing", "eventos", "microservicio", "workflows"]
  },
  {
    id: "soft-skills",
    title: "Soft skills de Jon Ander",
    text: `
Liderazgo de proyectos, coordinación de equipos en entornos de alta innovación y dirección técnica.
Visión estratégica, creatividad aplicada y pensamiento sistémico. Comunicación técnica clara,
colaboración interdisciplinar y alta adaptabilidad. Foco en resultados: impacto social, calidad estética
y propósito significativo.
    `.trim(),
    tags: ["soft-skills", "liderazgo", "comunicación", "visión", "pensamiento sistémico", "resultados"]
  },
  {
    id: "filosofia-valores",
    title: "Filosofía profesional y valores",
    text: `
Énfasis en la emoción humana, estética cuidada y propósito significativo. Compromiso con la innovación
continua y la evolución con herramientas de I+D.
    `.trim(),
    tags: ["valores", "filosofía", "innovación", "estética", "propósito"]
  },
  {
    id: "objetivos",
    title: "Objetivos profesionales",
    text: `
Crecimiento hacia roles de Project Engineer o liderazgo técnico. Participación en proyectos de vanguardia
que generen impacto positivo y fusionen creatividad con tecnología.
    `.trim(),
    tags: ["objetivos", "project engineer", "liderazgo técnico"]
  },
  {
    id: "disponibilidad-colaboracion",
    title: "Disponibilidad y colaboración",
    text: `
Abierto a nuevos proyectos, colaboraciones y oportunidades tecnológicas y creativas.
Prioriza iniciativas con innovación, creatividad y beneficio tangible.
    `.trim(),
    tags: ["colaboración", "oportunidades", "innovación", "creatividad"]
  },

  /** ——— Proyectos destacados ——— */
  {
    id: "proyecto-arte-antropomorfico",
    title: "Serie de Arte Digital Antropomórfico",
    text: `
Serie artística que fusiona esencia animal y forma humana. Exploración de la hibridación entre
naturaleza y humanidad para generar piezas con alto impacto visual.
    `.trim(),
    tags: ["proyecto", "arte digital", "antropomórfico", "creatividad"]
  },
  {
    id: "proyecto-modelo-hiperrealista-publicidad",
    title: "Modelo hiperrealista para publicidad",
    text: `
Desarrollo de avatares y modelos hiperrealistas para campañas publicitarias con foco en calidad visual,
consistencia estética y aplicación a marketing y branding.
    `.trim(),
    tags: ["proyecto", "hiperrealismo", "publicidad", "avatares"]
  },
  {
    id: "proyecto-introduccion-mcp",
    title: "Introducción completa al Model Context Protocol (MCP)",
    text: `
Material educativo/técnico sobre fundamentos, aplicaciones y puesta en práctica del MCP
para integrarlo en sistemas de IA generativa y automatización.
    `.trim(),
    tags: ["proyecto", "mcp", "formación", "protocolos", "automatización"]
  },
  {
    id: "proyecto-sistema-narrativas-visuales",
    title: "Sistema modular de narrativas visuales",
    text: `
Sistema que integra GPTs personalizados con generación de imágenes para crear narrativas visuales
interactivas y personalizadas. Une IA conversacional y generación visual.
    `.trim(),
    tags: ["proyecto", "narrativa", "gpt", "imágenes", "interactivo"]
  },
  {
    id: "proyecto-startup-contenido-ia",
    title: "Startup de contenido personalizado con IA",
    text: `
Iniciativa enfocada en escalar la creación de contenido personalizado mediante IA. Explora la frontera
entre creatividad humana y automatización inteligente con el objetivo de democratizar contenido de alta calidad.
    `.trim(),
    tags: ["proyecto", "startup", "contenido", "automatización", "escalado"]
  },

  /** ——— Fortalezas y valor diferencial ——— */
  {
    id: "fortalezas-clave",
    title: "Fortalezas clave para sistemas inteligentes",
    text: `
Expertise técnico profundo en IA generativa; visión creativa aplicada; experiencia práctica en implementación;
conocimiento multidisciplinar; comprensión del factor humano en aplicaciones tecnológicas.
    `.trim(),
    tags: ["fortalezas", "ia generativa", "multidisciplinar", "factor humano"]
  },
  {
    id: "valor-diferencial",
    title: "Valor diferencial",
    text: `
Perfil híbrido: rigor técnico de arquitecto de IA, sensibilidad artística de creador digital,
visión estratégica de liderazgo de proyectos y compromiso social orientado al impacto.
    `.trim(),
    tags: ["valor diferencial", "arquitecto de ia", "creatividad", "estrategia", "impacto"]
  },

  /** ——— NUEVOS: Servicios + Proyectos (resumen) ——— */
  {
    id: "servicios",
    title: "Servicios de Jon Ander Abad",
    text: `
- Desarrollo de microservicios de IA y agentes (RAG, workflows, automatización).
- Avatares y modelos hiperrealistas para publicidad y branding.
- Sistemas de narrativas visuales (GPT + generación de imágenes) e interactividad.
- Optimización de procesos con IA (ComfyUI, Stable Diffusion, N8N) y diseño de pipelines.
- Arquitectura de IA: diseño de sistemas escalables, evaluación y puesta en producción.
    `.trim(),
    tags: [
      "servicios", "ofrezco", "qué haces", "consultoría",
      "automatización", "agentes", "microservicios", "avatares",
      "narrativas", "workflows", "pipelines", "producción"
    ]
  },
  {
    id: "proyectos-destacados-resumen",
    title: "Proyectos destacados — Resumen",
    text: `
- Serie de Arte Digital Antropomórfico: fusión naturaleza/humanidad para piezas de alto impacto.
- Modelo hiperrealista para publicidad: avatares consistentes orientados a campañas.
- Introducción completa al Model Context Protocol (MCP): materiales técnicos y práctica.
- Sistema modular de narrativas visuales: GPTs + generación de imágenes para experiencias interactivas.
- Startup de contenido personalizado con IA: escalado de producción creativa con automatización inteligente.
    `.trim(),
    tags: ["proyectos", "proyectos destacados", "resumen", "portfolio", "experiencias"]
  },
];
