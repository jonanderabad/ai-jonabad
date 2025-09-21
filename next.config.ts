// next.config.ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Envoltorio MDX: habilita soporte para archivos .md y .mdx en el App Router.
 * Puedes añadir remark/rehype plugins en `options` si los necesitas.
 */
const withMDX = createMDX({
  extension: /\.mdx?$/,
  // options: {
  //   remarkPlugins: [],
  //   rehypePlugins: [],
  // },
});

const nextConfig: NextConfig = {
  /**
   * Next tratará también .md/.mdx como páginas.
   * Ejemplo de ruta: src/app/projects/<id>/case/page.mdx
   */
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  experimental: {
    /**
     * Compilador MDX rápido (Rust). Seguro en Next 15.
     * Si ya tienes otras flags experimentales, mantenlas aquí.
     */
    mdxRs: true,
  },

  // Aquí puedes seguir añadiendo más opciones si las necesitas:
  // images: { remotePatterns: [...] },
  // redirects: async () => [...],
};

export default withMDX(nextConfig);
