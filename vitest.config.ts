// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    reporters: 'default',
    passWithNoTests: false,

    // --- Cobertura rápida (baseline) ---
    // Medimos solo librerías (núcleo lógico), no UI.
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'], // foco en lógica (rag/guardrails/sanitize)
      exclude: [
        'src/tests/**',
        '**/*.d.ts',
        'scripts/**',
        'src/data/kb_embeddings.*', // snapshot generado
        'src/lib/utils.ts',         // ⬅️ EXCLUIDO temporalmente (sin tests aún)
      ],
      reporter: ['text', 'html', 'lcov'], // consola + informe navegable
      all: true, // cuenta también ficheros no tocados
      // Nota: por ahora sin thresholds para no bloquear el flujo.
    },
    // --- fin cobertura ---
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
});
