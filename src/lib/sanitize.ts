// Util de sanitización minimalista y determinista.
// Objetivos:
// 1) Quitar caracteres de control invisibles.
// 2) Eliminar <script>...</script> y atributos on* peligrosos.
// 3) Retirar etiquetas HTML simples, dejando texto plano legible.
// 4) Normalizar espacios/lineas y recortar a longitud máxima (por defecto 1500).

/** Sanitiza texto de usuario a texto plano seguro y compacto. */
export function sanitize(input: string, maxLen = 1500): string {
  let out = input ?? '';

  // 1) Quitar caracteres de control (0x00-0x1F y 0x7F)
  out = out.replace(/[\u0000-\u001F\u007F]/g, '');

  // 2) Eliminar bloques <script>...</script> y atributos on*
  out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  out = out.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');

  // 3) Retirar etiquetas HTML simples
  out = out.replace(/<\/?[^>]+>/g, '');

  // 4) Normalizar espacios/lineas y recortar
  out = out.replace(/[ \t]+\n/g, '\n').trim();
  if (out.length > maxLen) out = out.slice(0, maxLen);

  return out;
}

/**
 * Alias por compatibilidad con tu código previo.
 * Equivale a sanitize(s, 1500).
 */
export function sanitizeUserText(s: string): string {
  return sanitize(s, 1500);
}
