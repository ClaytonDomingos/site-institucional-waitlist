/* Validação e máscara dos campos do formulário (as mesmas regras do app). */

export const digitos = (v: string) => v.replace(/\D/g, "");

/** Texto livre sem os caracteres que fazem uma célula virar fórmula no Excel ou no Google Planilhas
 *  (= + - @ e tab/CR no começo). O banco e a planilha também se protegem; aqui é para quem digitou sem querer. */
export function semFormula(v: string | null | undefined, max = 120): string | null {
  return v?.trim().replace(/^[\s=+@-]+/, "").slice(0, max) || null;
}

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
