/* Validação e máscara dos campos do formulário (as mesmas regras do app). */

export const digitos = (v: string) => v.replace(/\D/g, "");

export function emailValido(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/** (99) 99999-9999 ou (99) 9999-9999 */
export function telefoneValido(v: string): boolean {
  const d = digitos(v);
  return d.length === 10 || d.length === 11;
}

/** máscara enquanto digita: (51) 99876-5432 */
export function fmtTelefone(v: string): string {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
