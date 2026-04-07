/**
 * Sanitiza e trunca campos antes de serem interpolados em prompts de IA.
 * Previne prompts excessivamente longos e tentativas de injeção de prompt.
 */

const LIMITS = {
  short: 100,    // matéria, série, tipo, nome
  medium: 300,   // tema, duração, objetivos
  long: 2000,    // enunciado, critérios
  content: 8000, // resposta do aluno, contexto
} as const;

/** Remove caracteres de controle e trunca ao limite */
export function sanitize(value: unknown, limit: keyof typeof LIMITS = "short"): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // remove control chars
    .trim()
    .slice(0, LIMITS[limit]);
}

/** Sanitiza um objeto de campos com limites individuais */
export function sanitizeFields<T extends Record<string, unknown>>(
  obj: T,
  schema: Partial<Record<keyof T, keyof typeof LIMITS>>
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  for (const key of Object.keys(schema) as (keyof T)[]) {
    result[key] = sanitize(obj[key], schema[key]);
  }
  return result;
}
