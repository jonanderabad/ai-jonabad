import { describe, it, expect } from 'vitest';
import { sanitize } from '../lib/sanitize';

describe('sanitize', () => {
  it('elimina scripts y on* pero conserva el texto', () => {
    const input = '<script>alert(1)</script><b onclick="x">Hola</b>';
    const out = sanitize(input);
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/onclick=/i);
    expect(out).toMatch(/Hola/);
  });

  it('mantiene tildes y normaliza espacios simples', () => {
    const input = '  ¡Hóla,\n  Jon!  ';
    const out = sanitize(input);
    expect(out).toContain('¡Hóla,');
    expect(out.endsWith('Jon!')).toBe(true);
  });

  // --- Cobertura de ramas: recorte por maxLen ---
  it('recorta cuando supera maxLen', () => {
    const long = 'x'.repeat(2000);
    const out = sanitize(long, 100);
    expect(out.length).toBe(100);
  });

  // --- Cobertura de ramas: input undefined (usa "" por el ??) ---
  it('tolera undefined (usa "" por el ??)', () => {
    const out = sanitize(undefined as any);
    expect(out).toBe('');
  });
});
