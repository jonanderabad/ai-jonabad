import type { ComponentType } from 'react';

export async function loadCase(id: string): Promise<ComponentType<any> | null> {
  switch (id) {
    case 'jon-abad-assistant':
      return (await import('../../../content/projects/jon-abad-assistant/case.mdx')).default;
    case 'maquina-de-cuentos':
      return (await import('../../../content/projects/maquina-de-cuentos/case.mdx')).default;
    case 'portfolio-inteligente':
      return (await import('../../../content/projects/portfolio-inteligente/case.mdx')).default;
    case 'mcp-academy':
      return (await import('../../../content/projects/mcp-academy/case.mdx')).default;
    default:
      return null;
  }
}
