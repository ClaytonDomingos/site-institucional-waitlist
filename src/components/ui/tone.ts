/* ---------------------------------------------------------------------------
   Tons semânticos — a única forma de dar cor a status, badge, alerta e ícone.

   primary  ação, navegação, seleção (preto; claro no tema escuro)
   blue     status informativo ("Confirmado", "Ativo")
   money    EXCLUSIVO de dinheiro / resultado financeiro
   lime     variação positiva que não é dinheiro (+12%)
   amber    atenção, pendência
   red      erro, urgência, destrutivo
   purple   ações automáticas / IA
   cyan     arquivos, anexos, novidades
   yellow   destaque secundário
   neutral  inativo, arquivado, sem status
--------------------------------------------------------------------------- */

export type Tone =
  | "money"
  | "primary"
  | "blue"
  | "amber"
  | "red"
  | "purple"
  | "yellow"
  | "lime"
  | "cyan"
  | "neutral";

/**
 * O "light" do ReUI: fundo 10% da cor, borda 15% e texto no tom escuro —
 * badges, notas, ícones em quadradinho. Já traz a borda de 1px.
 */
export const TONE_SOFT: Record<Tone, string> = {
  money: "border border-money/20 bg-money/10 text-money-fg",
  primary: "border border-primary/10 bg-primary/5 text-fg",
  blue: "border border-blue/15 bg-blue/10 text-blue-fg",
  amber: "border border-amber/20 bg-amber/10 text-amber-fg",
  red: "border border-red/15 bg-red/10 text-red-fg",
  purple: "border border-purple/15 bg-purple/10 text-purple-fg",
  yellow: "border border-yellow/20 bg-yellow/10 text-yellow-fg",
  lime: "border border-lime/20 bg-lime/10 text-lime-fg",
  cyan: "border border-cyan/15 bg-cyan/10 text-cyan-fg",
  neutral: "border border-line bg-surface-3 text-fg",
};

/** fundo cheio + texto claro */
export const TONE_SOLID: Record<Tone, string> = {
  money: "bg-money text-solid-fg",
  primary: "bg-primary text-primary-fg",
  blue: "bg-blue text-solid-fg",
  amber: "bg-amber text-solid-fg",
  red: "bg-red text-solid-fg",
  purple: "bg-purple text-solid-fg",
  yellow: "bg-yellow text-solid-fg",
  lime: "bg-lime text-solid-fg",
  cyan: "bg-cyan text-solid-fg",
  neutral: "bg-muted text-bg",
};

/** a cor pura, para SVG, bolinhas e style={{}} */
export const TONE_VAR: Record<Tone, string> = {
  money: "var(--money)",
  primary: "var(--primary)",
  blue: "var(--blue)",
  amber: "var(--amber)",
  red: "var(--red)",
  purple: "var(--purple)",
  yellow: "var(--yellow)",
  lime: "var(--lime)",
  cyan: "var(--cyan)",
  neutral: "var(--faint)",
};

/** paleta categórica dos gráficos, na ordem de uso */
export const CHART_COLORS = [
  "var(--chart-blue)",
  "var(--chart-sky)",
  "var(--chart-yellow)",
  "var(--chart-emerald)",
  "var(--chart-purple)",
  "var(--chart-pink)",
  "var(--chart-teal)",
  "var(--chart-indigo)",
  "var(--chart-lime)",
];
