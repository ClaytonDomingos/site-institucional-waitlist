import { useState, type ReactNode } from "react";
import { cn, MONTHS, num } from "@/lib/format";
import { CHART_COLORS, TONE_SOFT, TONE_VAR, type Tone } from "@/components/ui/tone";
import { AXIS, Swatch, useMeasure } from "./core";

/* ---------------------------------------------------------------------------
   Especiais.

   Heatmap          mapa de calor dia × hora
   CalendarHeatmap  ano em quadradinhos por dia (frequência, check-ins)
   Treemap          áreas proporcionais (participação com muitas categorias)
   GanttChart       linha do tempo por linha: agenda, cronograma, ocupação
   WaffleChart      100 quadradinhos = 100% (proporção fácil de ler)
--------------------------------------------------------------------------- */

/* --------------------------------- Heatmap -------------------------------- */

/** Mapa de calor com células de raio 3px (atividade por dia). */
export function Heatmap({
  rows,
  cols,
  grid,
  color = "var(--chart-purple)",
  cell = 28,
  gap = 4,
  onCellTitle,
}: {
  rows: string[];
  cols: string[];
  grid: number[][];
  color?: string;
  cell?: number;
  gap?: number;
  onCellTitle?: (row: string, col: string, value: number) => string;
}) {
  const max = Math.max(...grid.flat(), 1);
  const labelW = 34;
  const width = labelW + cols.length * (cell + gap);
  const height = 18 + rows.length * (cell + gap);
  return (
    <div className="overflow-x-auto scroll-thin">
      <svg width={width} height={height}>
        {cols.map((c, i) => (
          <text key={c} x={labelW + i * (cell + gap) + cell / 2} y={11} textAnchor="middle" {...AXIS}>
            {c}
          </text>
        ))}
        {rows.map((r, ri) => (
          <g key={r}>
            <text x={0} y={18 + ri * (cell + gap) + cell / 2 + 4} {...AXIS}>
              {r}
            </text>
            {cols.map((c, ci) => {
              const v = grid[ri]?.[ci] ?? 0;
              const tier = v === 0 ? 0 : Math.max(1, Math.ceil((v / max) * 4));
              const alpha = [0, 0.3, 0.55, 0.8, 1][tier];
              return (
                <rect
                  key={c}
                  x={labelW + ci * (cell + gap)}
                  y={18 + ri * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={3}
                  fill={tier === 0 ? "var(--chart-track)" : color}
                  opacity={tier === 0 ? 1 : alpha}
                >
                  <title>{onCellTitle ? onCellTitle(r, c, v) : `${r} ${c}: ${v}`}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ----------------------------- CalendarHeatmap ---------------------------- */

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CalendarHeatmap({
  from,
  to,
  values,
  color = "var(--chart-teal)",
  cell = 12,
  gap = 3,
  format = (n) => num(n),
  unit = "registros",
}: {
  from: Date;
  to: Date;
  /** chave "aaaa-mm-dd" → valor */
  values: Record<string, number>;
  color?: string;
  cell?: number;
  gap?: number;
  format?: (n: number) => string;
  unit?: string;
}) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate() - from.getDay());
  const weeks: Date[][] = [];
  for (let d = new Date(start); d <= to; ) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
  }
  const max = Math.max(...Object.values(values), 1);
  const tier = (v: number) => (v <= 0 ? 0 : Math.max(1, Math.ceil((v / max) * 4)));
  const alpha = [0, 0.28, 0.5, 0.75, 1];
  const labelW = 28;
  const w = labelW + weeks.length * (cell + gap);
  const h = 16 + 7 * (cell + gap);

  return (
    <div>
      <div className="overflow-x-auto scroll-thin pb-1">
        <svg width={w} height={h}>
          {weeks.map((wk, wi) => {
            const first = wk.find((d) => d.getDate() === 1 && d >= from && d <= to);
            return first ? (
              <text key={`m${wi}`} x={labelW + wi * (cell + gap)} y={10} fontSize="11" fill="var(--muted)">
                {MONTHS[first.getMonth()]}
              </text>
            ) : null;
          })}
          {[1, 3, 5].map((d) => (
            <text key={d} x={0} y={16 + d * (cell + gap) + cell - 2} fontSize="11" fill="var(--muted)">
              {["", "Seg", "", "Qua", "", "Sex", ""][d]}
            </text>
          ))}
          {weeks.map((wk, wi) =>
            wk.map((d, di) => {
              if (d < from || d > to) return null;
              const v = values[isoDay(d)] ?? 0;
              const t = tier(v);
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={labelW + wi * (cell + gap)}
                  y={16 + di * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={3}
                  fill={t === 0 ? "var(--chart-track)" : color}
                  opacity={t === 0 ? 1 : alpha[t]}
                >
                  <title>{`${d.toLocaleDateString("pt-BR")}: ${format(v)} ${unit}`}</title>
                </rect>
              );
            }),
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-caption text-muted">
        Menos
        {alpha.map((a, i) => (
          <span key={i} className="size-2.5 rounded-[3px]" style={{ background: i === 0 ? "var(--chart-track)" : color, opacity: i === 0 ? 1 : a }} />
        ))}
        Mais
      </div>
    </div>
  );
}

/* --------------------------------- Treemap -------------------------------- */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function squarify(values: number[], box: Rect): Rect[] {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const areas = values.map((v) => (v / total) * box.w * box.h);
  const out: Rect[] = [];
  let rect = { ...box };
  let row: number[] = [];
  const worst = (r: number[], side: number) => {
    const s = r.reduce((a, b) => a + b, 0);
    return Math.max((side * side * Math.max(...r)) / (s * s), (s * s) / (side * side * Math.min(...r)));
  };
  const place = (r: number[]) => {
    const s = r.reduce((a, b) => a + b, 0);
    if (rect.w >= rect.h) {
      const colW = s / rect.h;
      let yy = rect.y;
      for (const a of r) {
        out.push({ x: rect.x, y: yy, w: colW, h: a / colW });
        yy += a / colW;
      }
      rect = { x: rect.x + colW, y: rect.y, w: rect.w - colW, h: rect.h };
    } else {
      const rowH = s / rect.w;
      let xx = rect.x;
      for (const a of r) {
        out.push({ x: xx, y: rect.y, w: a / rowH, h: rowH });
        xx += a / rowH;
      }
      rect = { x: rect.x, y: rect.y + rowH, w: rect.w, h: rect.h - rowH };
    }
  };
  let i = 0;
  while (i < areas.length) {
    const side = Math.min(rect.w, rect.h);
    if (row.length === 0 || worst([...row, areas[i]], side) <= worst(row, side)) {
      row.push(areas[i]);
      i++;
    } else {
      place(row);
      row = [];
    }
  }
  if (row.length) place(row);
  return out;
}

export function Treemap({
  items,
  height = 260,
  format = (n) => num(n),
}: {
  items: Array<{ key: string; label: string; value: number; color?: string }>;
  height?: number;
  format?: (n: number) => string;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, i) => s + i.value, 0) || 1;
  const rects = width > 0 ? squarify(sorted.map((i) => i.value), { x: 0, y: 0, w: width, h: height }) : [];

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {rects.map((r, i) => {
        const it = sorted[i];
        const big = r.w > 70 && r.h > 44;
        return (
          <div
            key={it.key}
            onMouseEnter={() => setHover(it.key)}
            onMouseLeave={() => setHover(null)}
            title={`${it.label}: ${format(it.value)}`}
            className="absolute overflow-hidden rounded-[6px] border p-2 transition-opacity"
            style={{
              left: r.x + 1.5,
              top: r.y + 1.5,
              width: Math.max(0, r.w - 3),
              height: Math.max(0, r.h - 3),
              // o "light" do ReUI: cor a 18% com borda cheia e uma faixa sólida à esquerda
              background: `color-mix(in srgb, ${it.color ?? CHART_COLORS[i % CHART_COLORS.length]} 18%, var(--card))`,
              borderColor: `color-mix(in srgb, ${it.color ?? CHART_COLORS[i % CHART_COLORS.length]} 45%, var(--card))`,
              boxShadow: `inset 3px 0 0 ${it.color ?? CHART_COLORS[i % CHART_COLORS.length]}`,
              opacity: hover && hover !== it.key ? 0.45 : 1,
            }}
          >
            {big && (
              <>
                <p className="truncate text-body-2 font-semibold text-fg">{it.label}</p>
                <p className="truncate text-caption text-muted num">
                  {format(it.value)} · {Math.round((it.value / total) * 100)}%
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- GanttChart ------------------------------- */

export interface GanttBar {
  start: number;
  end: number;
  label: ReactNode;
  tone?: Tone;
}

export function GanttChart({
  rows,
  start,
  end,
  step = 1,
  formatTick = (n) => `${String(Math.floor(n)).padStart(2, "0")}h`,
  now,
  onBarClick,
}: {
  /** cada linha: rótulo à esquerda + barras na linha do tempo */
  rows: Array<{ key: string; label: ReactNode; sublabel?: ReactNode; bars: GanttBar[] }>;
  /** início e fim da escala (mesma unidade das barras — horas, dias…) */
  start: number;
  end: number;
  step?: number;
  formatTick?: (n: number) => string;
  /** linha vertical de "agora" */
  now?: number;
  onBarClick?: (row: string, bar: GanttBar) => void;
}) {
  const span = end - start;
  const pos = (v: number) => `${((v - start) / span) * 100}%`;
  const ticks: number[] = [];
  for (let t = start; t <= end; t += step) ticks.push(t);

  return (
    <div className="overflow-x-auto scroll-thin">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[140px_minmax(0,1fr)] items-end border-b border-line pb-1.5">
          <span />
          <div className="relative h-4">
            {ticks.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 text-caption text-muted num" style={{ left: pos(t) }}>
                {formatTick(t)}
              </span>
            ))}
          </div>
        </div>
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-[140px_minmax(0,1fr)] items-center border-b border-line last:border-0">
            <div className="min-w-0 py-2 pr-3">
              <p className="truncate text-body font-medium text-fg">{r.label}</p>
              {r.sublabel && <p className="truncate text-caption text-muted">{r.sublabel}</p>}
            </div>
            <div className="relative h-11">
              {ticks.map((t) => (
                <span key={t} className="absolute inset-y-0 w-px bg-line" style={{ left: pos(t) }} />
              ))}
              {r.bars.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onBarClick?.(r.key, b)}
                  className={cn(
                    "absolute top-1.5 bottom-1.5 flex items-center overflow-hidden rounded-badge px-2 text-left text-caption font-medium whitespace-nowrap transition-[filter] hover:brightness-95",
                    TONE_SOFT[b.tone ?? "primary"],
                    !onBarClick && "cursor-default",
                  )}
                  style={{ left: pos(b.start), width: `calc(${pos(b.end)} - ${pos(b.start)} - 2px)`, boxShadow: `inset 3px 0 0 ${TONE_VAR[b.tone ?? "primary"]}` }}
                >
                  <span className="truncate">{b.label}</span>
                </button>
              ))}
              {now !== undefined && now >= start && now <= end && (
                <span className="absolute inset-y-0 w-0.5 bg-red" style={{ left: pos(now) }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- WaffleChart ------------------------------ */

export function WaffleChart({
  items,
  columns = 10,
  cell = 16,
  gap = 3,
}: {
  items: Array<{ key: string; label: string; value: number; color: string }>;
  columns?: number;
  cell?: number;
  gap?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  /* maior resto: a soma fecha exatamente em 100 quadradinhos */
  const raw = items.map((i) => (i.value / total) * 100);
  const counts = raw.map(Math.floor);
  const left = 100 - counts.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, rest: r - Math.floor(r) }))
    .sort((a, b) => b.rest - a.rest)
    .slice(0, left)
    .forEach(({ i }) => counts[i]++);
  const cells = items.flatMap((it, i) => Array.from({ length: counts[i] }, () => it));

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="grid shrink-0" style={{ gridTemplateColumns: `repeat(${columns}, ${cell}px)`, gap }}>
        {cells.map((it, i) => (
          <span
            key={i}
            className="rounded-[3px] transition-opacity"
            style={{ width: cell, height: cell, background: it.color, opacity: hover && hover !== it.key ? 0.25 : 1 }}
            onMouseEnter={() => setHover(it.key)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </div>
      <ul className="flex min-w-[140px] flex-col gap-2">
        {items.map((it, i) => (
          <li key={it.key} className="flex items-center justify-between gap-4" onMouseEnter={() => setHover(it.key)} onMouseLeave={() => setHover(null)}>
            <span className="flex items-center gap-2 text-body-2 text-muted">
              <Swatch color={it.color} />
              {it.label}
            </span>
            <span className="text-body-2 font-medium num text-fg">{counts[i]}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
