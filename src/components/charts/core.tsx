import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

/* ---------------------------------------------------------------------------
   Base comum dos gráficos — medição, escalas, eixo, grade e tooltip.

   Estética dos templates do ReUI, que TODO gráfico novo deve seguir:
   - barras retas com só o topo arredondado (barPath, raio 4), sem trilha
   - a série de comparação vem hachurada: listras diagonais + contorno da cor
     (Series.hatch → HatchPattern); a principal é cheia
   - áreas embaixo das linhas também hachuradas, sobre um véu de 6% da cor
   - grade horizontal tracejada "4 4" em --border, quase invisível
   - rótulos de eixo 12px em --muted; valores com a classe `num`
   - linhas com traço 2, pontas redondas, curva suave (smoothPath)
   - hover: faixa cinza (--chart-track) atrás da coluna
   - tooltip: painel `floating` (ChartTooltip); legenda com Swatch / Legend
   - partir de um gráfico parecido já pronto é o caminho mais curto
   - cores só de --chart-* (CHART_COLORS) ou dos tons semânticos
   - cada gráfico mede o próprio contêiner (useMeasure) e desenha em px reais
--------------------------------------------------------------------------- */

export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.round(w));
    });
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** Margem esquerda do gráfico que cabe o maior rótulo do eixo Y ("R$ 40 mil"). */
export function axisPad(labels: string[], min = 32): number {
  const longest = Math.max(0, ...labels.map((l) => l.length));
  return Math.max(min, Math.ceil(longest * 6.8 + 14));
}

/** Topo "redondo" da escala: 0 → niceTop(máximo) em `steps` degraus. */
export function niceTop(max: number, steps = 4): number {
  if (max <= 0) return steps;
  const raw = max / steps;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return nice * mag * steps;
}

/** Escala com mínimo e máximo "redondos" (aceita negativos). */
export function niceScale(min: number, max: number, steps = 4): { min: number; max: number; ticks: number[] } {
  if (min === max) {
    max = min + 1;
  }
  const span = max - min;
  const raw = span / steps;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { min: lo, max: hi, ticks };
}

/** Caminho suave (Catmull-Rom convertido em Bézier) para áreas e linhas. */
export function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`);
  }
  return d.join(" ");
}

/** Caminho reto ponto a ponto. */
export function linearPath(points: Array<[number, number]>): string {
  return points.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
}

/** Arco de anel (rosca, pizza, radial) entre dois ângulos em radianos, 0 = topo. */
export function arcPath(cx: number, cy: number, r: number, start: number, end: number, inner = 0): string {
  const pt = (rad: number, a: number) => [cx + rad * Math.sin(a), cy - rad * Math.cos(a)];
  const large = end - start > Math.PI ? 1 : 0;
  const [x1, y1] = pt(r, start);
  const [x2, y2] = pt(r, end);
  if (inner <= 0) return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  const [x3, y3] = pt(inner, end);
  const [x4, y4] = pt(inner, start);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
}

export const AXIS = { fontSize: 12, fill: "var(--muted)", fontWeight: 400 } as const;

export interface Series {
  key: string;
  label: string;
  color: string;
  /** desenha a série hachurada (listras + contorno) — a de comparação */
  hatch?: boolean;
}

/** Retângulo com só os cantos de cima arredondados — a barra do ReUI. */
export function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M ${x} ${y + h} V ${y + rr} Q ${x} ${y} ${x + rr} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h} Z`;
}

/**
 * Listras diagonais na cor da série, para `fill="url(#id)"`. Ponha dentro do
 * <defs> do gráfico. `opacity` controla a força das listras.
 */
export function HatchPattern({ id, color, opacity = 0.55, gap = 5 }: { id: string; color: string; opacity?: number; gap?: number }) {
  return (
    <pattern id={id} width={gap} height={gap} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2={gap} stroke={color} strokeWidth="1.5" opacity={opacity} />
    </pattern>
  );
}

/** Grade horizontal tracejada + rótulos do eixo Y. */
export function GridY({
  ticks,
  y,
  left,
  right,
  format,
  zero,
}: {
  ticks: number[];
  y: (v: number) => number;
  left: number;
  right: number;
  format: (n: number) => string;
  /** desenha a linha do zero sólida (gráficos com negativos) */
  zero?: boolean;
}) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={left}
            x2={right}
            y1={y(t)}
            y2={y(t)}
            stroke={zero && t === 0 ? "var(--border-strong)" : "var(--border)"}
            strokeDasharray={zero && t === 0 ? undefined : "4 4"}
          />
          <text x={left - 8} y={y(t) + 4} textAnchor="end" {...AXIS} className="num">
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Rótulos do eixo X como HTML embaixo do SVG (quebram melhor que <text>). */
export function XLabels({
  labels,
  left,
  right,
  active,
  mode = "band",
}: {
  labels: string[];
  left: number;
  right: number;
  active?: number | null;
  /** band: centro de cada faixa (barras) · point: nas pontas (linhas) */
  mode?: "band" | "point";
}) {
  return (
    <div
      className={cn("mt-1 flex", mode === "point" && "justify-between")}
      style={{ paddingLeft: mode === "point" ? left - 12 : left, paddingRight: mode === "point" ? Math.max(0, right - 12) : right }}
    >
      {labels.map((l, i) => (
        <span
          key={`${l}-${i}`}
          className={cn(
            "truncate text-center text-caption",
            mode === "band" && "flex-1",
            active === i ? "font-medium text-fg" : "text-muted",
          )}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

/**
 * Tooltip padrão dos gráficos: tile branco, sombra de dropdown, título em
 * legenda e linhas com quadradinho de cor. Posicione com x/y em px relativos
 * ao contêiner `relative` do gráfico; ele se afasta sozinho das bordas.
 */
export function ChartTooltip({
  x,
  y,
  width,
  title,
  rows,
  children,
}: {
  x: number;
  y: number;
  /** largura do contêiner, para virar o tooltip perto da borda direita */
  width: number;
  title?: ReactNode;
  rows?: Array<{ label: ReactNode; value: ReactNode; color?: string }>;
  children?: ReactNode;
}) {
  const flip = x > width - 180;
  return (
    <div
      className="floating pointer-events-none absolute z-20 min-w-[140px] px-2.5 py-2 animate-fade-up"
      style={{ left: flip ? undefined : x + 12, right: flip ? width - x + 12 : undefined, top: Math.max(0, y - 12) }}
    >
      {title && <p className="mb-1 text-caption font-medium text-muted">{title}</p>}
      {rows?.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-px">
          <span className="flex items-center gap-1.5 text-body-2 text-muted">
            {r.color && <Swatch color={r.color} round />}
            {r.label}
          </span>
          <span className="text-body-2 font-medium num text-fg">{r.value}</span>
        </div>
      ))}
      {children}
    </div>
  );
}

/** Quadradinho de cor das legendas e tooltips. `hatch` desenha listrado, como a série hachurada. */
export function Swatch({ color, size = 10, round, hatch }: { color: string; size?: number; round?: boolean; hatch?: boolean }) {
  return (
    <span
      className={cn("shrink-0", round ? "rounded-full" : "rounded-[3px]", hatch && "hatch border")}
      style={{ width: size, height: size, background: hatch ? undefined : color, color, borderColor: hatch ? color : undefined }}
    />
  );
}

/** Legenda como fileira de tiles ("Visitas · 96,4 mil"). */
export function Legend({ series, className }: { series: Array<Series & { value?: string }>; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:flex sm:items-stretch", className)}>
      {series.map((s) => (
        <div key={s.key} className="tile flex min-w-0 flex-1 flex-col items-start gap-px px-2.5 py-2">
          <span className="flex items-center gap-1.5 text-body-2 text-muted">
            <Swatch color={s.color} size={10} hatch={s.hatch} />
            <span className="truncate">{s.label}</span>
          </span>
          {s.value && <span className="text-body font-medium num text-fg">{s.value}</span>}
        </div>
      ))}
    </div>
  );
}

/** Legenda compacta em linha (bolinha + rótulo), para quando a de tiles for demais. */
export function InlineLegend({ items, className }: { items: Array<{ label: ReactNode; color: string; dashed?: boolean; hatch?: boolean }>; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5 text-body-2 text-muted">
          {it.dashed ? (
            <svg width="14" height="4" aria-hidden>
              <line x1="0" y1="2" x2="14" y2="2" stroke={it.color} strokeWidth="2" strokeDasharray="3 2" />
            </svg>
          ) : (
            <Swatch color={it.color} hatch={it.hatch} round={!it.hatch} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}
