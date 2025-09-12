export function sanitizeUserText(s: string) {
    return s.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 1500);
  }
  