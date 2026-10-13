import { useState, type ReactNode } from "react";
import { cn, num } from "@/lib/format";
import { Swatch, arcPath, useMeasure } from "./core";

/* ---------------------------------------------------------------------------
   Radiais.

   PieChart     pizza ou rosca interativa: passar o mouse destaca a fatia e
                troca o centro; legenda opcional ao lado
   RadarChart   teia com várias séries (perfil, avaliação por critério)
   RadialBars   barras em arco concêntricas com legenda (metas paralelas)
   Gauge        meio-anel de meta
   Ring         anel de progresso pequeno com rótulo no centro
   Rings        anéis concêntricos de atividade
--------------------------------------------------------------------------- */

export function PieChart({
  slices,
  size = 200,
  inner = 0.62,
  format = (n) => num(n),
  center,
  legend = true,
}: {
  slices: Array<{ key: string; label: string; value: number; color: string }>;
  size?: number;
  /** raio interno em fração do externo: 0 = pizza, 0.6 = rosca */
  inner?: number;
  format?: (n: number) => string;
  /** conteúdo do centro quando nada está em hover (só rosca) */
  center?: ReactNode;
  legend?: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 6;
  const ri = inner > 0 ? r * inner : 0;
  const pad = inner > 0 ? 0.025 : 0.012;
  let angle = 0;
  const active = slices.find((s) => s.key === hover);

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6", !legend && "block")}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} onMouseLeave={() => setHover(null)}>
          {slices.map((s) => {
            const span = (s.value / total) * Math.PI * 2;
            const start = angle + pad / 2;
            const end = angle + span - pad / 2;
            angle += span;
            const isOn = hover === s.key;
            return (
              <path
                key={s.key}
                d={arcPath(size / 2, size / 2, isOn ? r + 4 : r, start, Math.max(start + 0.001, end), ri)}
                fill={s.color}
                opacity={hover && !isOn ? 0.35 : 1}
                stroke="var(--card)"
                strokeWidth={inner > 0 ? 0 : 1.5}
                onMouseEnter={() => setHover(s.key)}
                style={{ transition: "opacity 150ms" }}
              >
                <title>{`${s.label}: ${format(s.value)}`}</title>
              </path>
            );
          })}
        </svg>
        {inner > 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {active ? (
              <>
                <span className="text-title-1 font-semibold num text-fg">{Math.round((active.value / total) * 100)}%</span>
                <span className="max-w-[70%] truncate text-caption text-muted">{active.label}</span>
              </>
            ) : (
              center ?? (
                <>
                  <span className="text-title-1 font-semibold num text-fg">{format(total)}</span>
                  <span className="text-caption text-muted">total</span>
                </>
              )
            )}
          </div>
        )}
      </div>
      {legend && (
        <ul className="flex min-w-[160px] flex-col gap-1.5">
          {slices.map((s) => (
            <li
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "flex items-center justify-between gap-4 rounded-badge px-1.5 py-1 transition-colors",
                hover === s.key && "bg-surface-3",
              )}
            >
              <span className="flex items-center gap-2 text-body-2 text-muted">
                <Swatch color={s.color} />
                {s.label}
              </span>
              <span className="text-body-2 font-medium num text-fg">{format(s.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------- RadarChart ------------------------------- */

export function RadarChart({
  axes,
  series,
  max,
  height = 280,
  levels = 4,
  format = (n) => num(n),
}: {
  axes: string[];
  series: Array<{ key: string; label: string; color: string; values: number[] }>;
  /** valor da borda externa (padrão: maior valor) */
  max?: number;
  height?: number;
  levels?: number;
  format?: (n: number) => string;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);
  const top = max ?? Math.max(...series.flatMap((s) => s.values), 1);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.max(10, Math.min(width / 2 - 70, height / 2 - 24));
  const angle = (i: number) => (i / axes.length) * Math.PI * 2;
  const pt = (i: number, v: number): [number, number] => [cx + r * (v / top) * Math.sin(angle(i)), cy - r * (v / top) * Math.cos(angle(i))];
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg width={width} height={height} onMouseLeave={() => setHover(null)}>
          {Array.from({ length: levels }, (_, l) => (
            <polygon
              key={l}
              points={poly(axes.map(() => (top * (l + 1)) / levels))}
              fill={l === levels - 1 ? "var(--card)" : "none"}
              stroke="var(--border)"
              strokeDasharray={l === levels - 1 ? undefined : "4 4"}
            />
          ))}
          {axes.map((a, i) => {
            const [x, y] = pt(i, top);
            const [lx, ly] = pt(i, top * 1.14);
            const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
            return (
              <g key={a}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" />
                <text x={lx} y={ly + 4} textAnchor={anchor} fontSize="12" fontWeight="500" fill="var(--muted)">
                  {a}
                </text>
              </g>
            );
          })}
          {series.map((s) => (
            <g key={s.key} opacity={hover && hover !== s.key ? 0.25 : 1} onMouseEnter={() => setHover(s.key)} style={{ transition: "opacity 150ms" }}>
              <polygon points={poly(s.values)} fill={s.color} fillOpacity="0.18" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
              {s.values.map((v, i) => {
                const [x, y] = pt(i, v);
                return (
                  <circle key={i} cx={x} cy={y} r="3.5" fill="var(--card)" stroke={s.color} strokeWidth="2">
                    <title>{`${s.label} · ${axes[i]}: ${format(v)}`}</title>
                  </circle>
                );
              })}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

/* ------------------------------- RadialBars ------------------------------- */

export function RadialBars({
  items,
  size = 200,
  thickness = 10,
  format = (n) => `${num(n)}%`,
  center,
}: {
  /** de fora para dentro; value de 0 a max (padrão 100) */
  items: Array<{ label: string; value: number; max?: number; color: string }>;
  size?: number;
  thickness?: number;
  format?: (n: number) => string;
  center?: ReactNode;
}) {
  const gap = 5;
  const c = size / 2;
  const sweep = Math.PI * 1.5;
  const start = -Math.PI * 0.75;
  const arc = (r: number, a0: number, a1: number) => {
    const p = (a: number) => [c + r * Math.sin(a), c - r * Math.cos(a)];
    const [x1, y1] = p(a0);
    const [x2, y2] = p(a1);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {items.map((it, i) => {
            const r = c - thickness / 2 - 2 - i * (thickness + gap);
            if (r <= thickness) return null;
            const pct = Math.min(1, Math.max(0, it.value / (it.max ?? 100)));
            return (
              <g key={it.label}>
                <path d={arc(r, start, start + sweep)} fill="none" stroke={it.color} strokeOpacity="0.16" strokeWidth={thickness} strokeLinecap="round" />
                {pct > 0 && (
                  <path d={arc(r, start, start + Math.max(0.02, sweep * pct))} fill="none" stroke={it.color} strokeWidth={thickness} strokeLinecap="round">
                    <title>{`${it.label}: ${format(it.value)}`}</title>
                  </path>
                )}
              </g>
            );
          })}
        </svg>
        {center && <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
      </div>
      <ul className="flex min-w-[150px] flex-col gap-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-body-2 text-muted">
              <Swatch color={it.color} round />
              {it.label}
            </span>
            <span className="text-body-2 font-medium num text-fg">{format(it.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------- Gauge --------------------------------- */

export function Gauge({
  value,
  max,
  center,
  caption,
  height = 150,
  tone = "var(--chart-blue)",
}: {
  value: number;
  max: number;
  center: ReactNode;
  caption?: ReactNode;
  height?: number;
  tone?: string;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const w = Math.max(width, 10);
  const stroke = 14;
  const r = Math.min(w / 2 - stroke, height - stroke) - 2;
  const cx = w / 2;
  const cy = height - 6;
  const pct = Math.min(1, Math.max(0, value / max));
  const arc = Math.PI * r;

  return (
    <div ref={ref} className="w-full">
      {width > 0 && r > 0 && (
        <svg width={w} height={height} className="overflow-visible">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="var(--chart-track)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc * pct} ${arc}`}
            style={{ transition: "stroke-dasharray 700ms cubic-bezier(.22,1,.36,1)" }}
          />
          <foreignObject x={cx - r} y={cy - r * 0.72} width={r * 2} height={r * 0.72}>
            <div className="flex h-full flex-col items-center justify-end text-center">{center}</div>
          </foreignObject>
        </svg>
      )}
      {caption && <div className="mt-2 text-center text-body-2 text-muted">{caption}</div>}
    </div>
  );
}

/* ------------------------------- Ring / Rings ----------------------------- */

/**
 * Anéis de atividade concêntricos (traço 2.2, trilha a 16%).
 * `rings` vai de fora para dentro; cada um com valor de 0 a 1.
 */
export function Rings({
  rings,
  size = 28,
  stroke = 2.2,
  className,
}: {
  rings: Array<{ value: number; color: string }>;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const c = size / 2;
  const gapR = stroke + 1.4;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={cn("shrink-0", className)} aria-hidden>
      {rings.map((ring, i) => {
        const r = c - stroke / 2 - 0.5 - i * gapR;
        if (r <= 0) return null;
        const circ = 2 * Math.PI * r;
        const pct = Math.min(1, Math.max(0, ring.value));
        return (
          <g key={i} transform={`rotate(-90 ${c} ${c})`}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={ring.color} strokeWidth={stroke} opacity={0.16} />
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circ * pct} ${circ * (1 - pct) + 0.01}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Anel de progresso pequeno com rótulo no centro. */
export function Ring({
  value,
  max,
  size = 44,
  stroke = 5,
  color = "var(--chart-blue)",
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = size / 2 - stroke / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--chart-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-caption font-semibold num">{children}</span>
    </div>
  );
}
