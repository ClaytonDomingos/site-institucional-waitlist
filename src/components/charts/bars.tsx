import { useId, useState, type ReactNode } from "react";
import { cn, num } from "@/lib/format";
import { ChartTooltip, GridY, HatchPattern, Swatch, XLabels, axisPad, barPath, niceScale, niceTop, smoothPath, useMeasure, type Series } from "./core";

/* ---------------------------------------------------------------------------
   Barras.

   BarChart         barras verticais, uma ou várias séries lado a lado (Series.hatch
                    hachura a de comparação), destaque
   StackedBars      barras empilhadas + linha de tendência (receita por mês)
   ComboChart       barras + linha com dois eixos (volume × taxa)
   WaterfallChart   cascata: saldo inicial, entradas, saídas e total
   DistributionBar  barra 100% segmentada com legenda (participação)
   BulletChart      realizado × meta, com faixas de referência
   FunnelChart      funil de conversão por etapa
   HBars            barras horizontais com rótulo (ranking)
   SparkBars        mini barras para tabela/KPI
--------------------------------------------------------------------------- */

type Row = { label: string } & Record<string, number | string | undefined>;

/* -------------------------------- BarChart -------------------------------- */

export function BarChart({
  data,
  series,
  height = 220,
  format,
  highlight,
  track = false,
  showValues,
}: {
  data: Row[];
  series: Series[];
  height?: number;
  format: (n: number) => string;
  /** índice em destaque (as outras barras ficam suaves), ou "max" */
  highlight?: number | "max";
  /** trilha cinza de altura cheia atrás de cada barra */
  track?: boolean;
  /** valor escrito em cima de cada barra */
  showValues?: boolean;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const values = data.map((d) => series.map((s) => Number(d[s.key] ?? 0)));
  const top = niceTop(Math.max(...values.flat(), 1));
  const padLeft = axisPad([0, 0.25, 0.5, 0.75, 1].map((t) => format(top * t)));
  const padRight = 8;
  const padTop = showValues ? 22 : 12;
  const plotW = Math.max(0, width - padLeft - padRight);
  const plotH = height - padTop - 6;

  const y = (v: number) => padTop + plotH - (v / top) * plotH;
  const band = data.length ? plotW / data.length : 0;
  const gap = 6;
  const barW = Math.min(series.length > 1 ? 20 : 32, (band * 0.66 - gap * (series.length - 1)) / series.length);
  const groupW = barW * series.length + gap * (series.length - 1);
  const maxIdx = values.map((v) => v.reduce((a, b) => a + b, 0)).reduce((best, v, i, arr) => (v > arr[best] ? i : best), 0);
  const hi = highlight === "max" ? maxIdx : highlight;

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            {series.filter((s) => s.hatch).map((s) => (
              <HatchPattern key={s.key} id={`${uid}-${s.key}`} color={s.color} />
            ))}
          </defs>
          <GridY ticks={[0, 0.25, 0.5, 0.75, 1].map((t) => top * t)} y={y} left={padLeft} right={width - padRight} format={format} />
          {data.map((d, i) => {
            const x0 = padLeft + band * i + (band - groupW) / 2;
            const dim = hi !== undefined && hi !== i && hover !== i;
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)}>
                <rect x={padLeft + band * i + 2} y={padTop} width={Math.max(0, band - 4)} height={plotH} rx={4} fill={hover === i ? "var(--chart-track)" : "transparent"} />
                {series.map((s, si) => {
                  const v = values[i][si];
                  const x = x0 + si * (barW + gap);
                  const h = Math.max(0, (v / top) * plotH);
                  return (
                    <g key={s.key} opacity={dim ? 0.35 : 1} style={{ transition: "opacity 150ms" }}>
                      {track && <rect x={x} y={padTop} width={barW} height={plotH} rx={4} fill="var(--chart-track)" />}
                      {s.hatch ? (
                        <path d={barPath(x + 0.5, y(v) + 0.5, barW - 1, Math.max(0, h - 0.5))} fill={`url(#${uid}-${s.key})`} stroke={s.color} strokeWidth="1" />
                      ) : (
                        <path d={barPath(x, y(v), barW, h)} fill={s.color} />
                      )}
                      {showValues && (
                        <text x={x + barW / 2} y={y(v) - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--muted)" className="num">
                          {format(v)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}
      <XLabels labels={data.map((d) => d.label)} left={padLeft} right={padRight} active={hover ?? hi} />
      {hover !== null && (
        <ChartTooltip
          x={padLeft + band * hover + band / 2}
          y={y(Math.max(...values[hover]))}
          width={width}
          title={data[hover].label}
          rows={series.map((s, si) => ({ label: s.label, value: format(values[hover][si]), color: s.color }))}
        />
      )}
    </div>
  );
}

/* ------------------------------- StackedBars ------------------------------ */

/** Barras empilhadas + linha de tendência. `partial: true` hachura o mês em andamento. */

export function StackedBars({
  data,
  series,
  height = 220,
  format,
  showTrend = true,
}: {
  data: Array<{ label: string; partial?: boolean } & Record<string, number | string | boolean | undefined>>;
  series: Series[];
  height?: number;
  format: (n: number) => string;
  showTrend?: boolean;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");

  const totals = data.map((d) => series.reduce((s, sr) => s + Number(d[sr.key] ?? 0), 0));
  const top = niceTop(Math.max(...totals, 1));
  const padLeft = axisPad([0, 0.25, 0.5, 0.75, 1].map((t) => format(top * t)));
  const padRight = 8;
  const padTop = 12;
  const padBottom = 6;
  const plotW = Math.max(0, width - padLeft - padRight);
  const plotH = height - padTop - padBottom;

  const band = data.length ? plotW / data.length : 0;
  const barW = Math.min(36, band * 0.5);
  const y = (v: number) => padTop + plotH - (v / top) * plotH;

  const trend: Array<[number, number]> = totals.map((t, i) => [padLeft + band * i + band / 2, y(t)]);

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <pattern id={`${uid}-hatch`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--bg)" strokeWidth="2" opacity="0.7" />
            </pattern>
          </defs>

          <GridY ticks={[0, 0.25, 0.5, 0.75, 1].map((t) => top * t)} y={y} left={padLeft} right={width - padRight} format={format} />

          {data.map((d, i) => {
            const cx = padLeft + band * i + band / 2;
            let cursor = padTop + plotH;
            const isHover = hover === i;
            const total = totals[i];
            const totalH = (total / top) * plotH;
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)}>
                {/* faixa cinza atrás da coluna no hover */}
                <rect x={padLeft + band * i + 2} y={padTop} width={Math.max(0, band - 4)} height={plotH} rx={4} fill={isHover ? "var(--chart-track)" : "transparent"} />
                <clipPath id={`${uid}-bar-${i}`}>
                  <path d={barPath(cx - barW / 2, padTop + plotH - totalH, barW, totalH)} />
                </clipPath>
                <g clipPath={`url(#${uid}-bar-${i})`}>
                  {series.map((sr) => {
                    const v = Number(d[sr.key] ?? 0);
                    const h = (v / top) * plotH;
                    cursor -= h;
                    return (
                      <rect
                        key={sr.key}
                        x={cx - barW / 2}
                        y={cursor}
                        width={barW}
                        height={Math.max(0, h - 1)}
                        fill={sr.color}
                        opacity={d.partial ? 0.8 : 1}
                      />
                    );
                  })}
                  {d.partial && (
                    <rect
                      x={cx - barW / 2}
                      y={padTop + plotH - totalH}
                      width={barW}
                      height={totalH}
                      fill={`url(#${uid}-hatch)`}
                    />
                  )}
                </g>
              </g>
            );
          })}

          {showTrend && (
            <>
              <path d={smoothPath(trend)} fill="none" stroke="var(--fg)" strokeWidth="1.5" opacity="0.55" />
              {trend.map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={hover === i ? 4 : 2.5}
                  fill="var(--card)"
                  stroke="var(--fg)"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
              ))}
            </>
          )}

        </svg>
      )}
      <XLabels labels={data.map((d) => (d.partial ? `${d.label}*` : d.label))} left={padLeft} right={padRight} active={hover} />
      {hover !== null && (
        <ChartTooltip
          x={padLeft + band * hover + band / 2}
          y={y(totals[hover])}
          width={width}
          title={data[hover].partial ? `${data[hover].label} (parcial)` : data[hover].label}
          rows={[
            ...series.map((sr) => ({ label: sr.label, value: format(Number(data[hover][sr.key] ?? 0)), color: sr.color })),
            { label: "Total", value: format(totals[hover]) },
          ]}
        />
      )}
    </div>
  );
}

/* ------------------------------- ComboChart ------------------------------- */

export function ComboChart({
  data,
  bar,
  line,
  height = 240,
  formatBar,
  formatLine,
}: {
  data: Row[];
  bar: Series;
  line: Series;
  height?: number;
  formatBar: (n: number) => string;
  formatLine: (n: number) => string;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const topB0 = niceTop(Math.max(...data.map((d) => Number(d[bar.key] ?? 0)), 1));
  const padLeft = axisPad([0, 0.25, 0.5, 0.75, 1].map((t) => formatBar(topB0 * t)));
  const padRight = 44;
  const padTop = 12;
  const plotW = Math.max(0, width - padLeft - padRight);
  const plotH = height - padTop - 6;
  const bars = data.map((d) => Number(d[bar.key] ?? 0));
  const lines = data.map((d) => Number(d[line.key] ?? 0));
  const topB = niceTop(Math.max(...bars, 1));
  const topL = niceTop(Math.max(...lines, 1));
  const yB = (v: number) => padTop + plotH - (v / topB) * plotH;
  const yL = (v: number) => padTop + plotH - (v / topL) * plotH;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.min(28, band * 0.5);
  const pts: Array<[number, number]> = lines.map((v, i) => [padLeft + band * i + band / 2, yL(v)]);

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <defs>{bar.hatch && <HatchPattern id={`${uid}-bar`} color={bar.color} />}</defs>
          <GridY ticks={[0, 0.25, 0.5, 0.75, 1].map((t) => topB * t)} y={yB} left={padLeft} right={width - padRight} format={formatBar} />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <text key={t} x={width - padRight + 8} y={yL(topL * t) + 4} fontSize="12" fill={line.color} className="num">
              {formatLine(topL * t)}
            </text>
          ))}
          {bars.map((v, i) => {
            const cx = padLeft + band * i + band / 2;
            const h = (v / topB) * plotH;
            return (
              <g key={i} onMouseEnter={() => setHover(i)}>
                <rect x={padLeft + band * i + 2} y={padTop} width={Math.max(0, band - 4)} height={plotH} rx={4} fill={hover === i ? "var(--chart-track)" : "transparent"} />
                <path
                  d={bar.hatch ? barPath(cx - barW / 2 + 0.5, yB(v) + 0.5, barW - 1, Math.max(0, h - 0.5)) : barPath(cx - barW / 2, yB(v), barW, h)}
                  fill={bar.hatch ? `url(#${uid}-bar)` : bar.color}
                  stroke={bar.hatch ? bar.color : undefined}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                />
              </g>
            );
          })}
          <path d={smoothPath(pts)} fill="none" stroke={line.color} strokeWidth="2" strokeLinecap="round" className="pointer-events-none" />
          {pts.map(([x, yy], i) => (
            <circle key={i} cx={x} cy={yy} r={hover === i ? 4.5 : 3} fill="var(--card)" stroke={line.color} strokeWidth="2" className="pointer-events-none" />
          ))}
        </svg>
      )}
      <XLabels labels={data.map((d) => d.label)} left={padLeft} right={padRight} active={hover} />
      {hover !== null && (
        <ChartTooltip
          x={padLeft + band * hover + band / 2}
          y={Math.min(yB(bars[hover]), yL(lines[hover]))}
          width={width}
          title={data[hover].label}
          rows={[
            { label: bar.label, value: formatBar(bars[hover]), color: bar.color },
            { label: line.label, value: formatLine(lines[hover]), color: line.color },
          ]}
        />
      )}
    </div>
  );
}

/* ----------------------------- WaterfallChart ----------------------------- */

export function WaterfallChart({
  items,
  height = 240,
  format,
  colors = { up: "var(--chart-emerald)", down: "var(--red)", total: "var(--chart-blue)" },
}: {
  /** `total: true` desenha a barra do saldo acumulado até ali */
  items: Array<{ label: string; value: number; total?: boolean }>;
  height?: number;
  format: (n: number) => string;
  colors?: { up: string; down: string; total: string };
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  let run = 0;
  const bars = items.map((it) => {
    if (it.total) return { ...it, from: 0, to: run, value: run };
    const from = run;
    run += it.value;
    return { ...it, from, to: run };
  });
  const scale = niceScale(Math.min(0, ...bars.map((b) => Math.min(b.from, b.to))), Math.max(...bars.map((b) => Math.max(b.from, b.to)), 1));
  const padLeft = axisPad(scale.ticks.map(format));
  const padRight = 8;
  const padTop = 22;
  const plotW = Math.max(0, width - padLeft - padRight);
  const plotH = height - padTop - 6;
  const y = (v: number) => padTop + plotH - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const band = items.length ? plotW / items.length : 0;
  const barW = Math.min(36, band * 0.6);

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <GridY ticks={scale.ticks} y={y} left={padLeft} right={width - padRight} format={format} zero />
          {bars.map((b, i) => {
            const cx = padLeft + band * i + band / 2;
            const top = y(Math.max(b.from, b.to));
            const h = Math.max(2, Math.abs(y(b.from) - y(b.to)));
            const color = b.total ? colors.total : b.value >= 0 ? colors.up : colors.down;
            const next = bars[i + 1];
            return (
              <g key={b.label} onMouseEnter={() => setHover(i)}>
                <rect x={padLeft + band * i} y={padTop} width={band} height={plotH} fill="transparent" />
                <rect x={cx - barW / 2} y={top} width={barW} height={h} rx={3} fill={color} opacity={hover === null || hover === i ? 1 : 0.6} />
                {next && (
                  <line x1={cx + barW / 2} x2={cx + band - barW / 2} y1={y(b.to)} y2={y(b.to)} stroke="var(--border-strong)" strokeDasharray="3 3" />
                )}
                <text x={cx} y={top - 6} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--muted)" className="num">
                  {b.total ? format(b.value) : `${b.value >= 0 ? "+" : "−"}${format(Math.abs(b.value))}`}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      <XLabels labels={items.map((d) => d.label)} left={padLeft} right={padRight} active={hover} />
    </div>
  );
}

/* ----------------------------- DistributionBar ---------------------------- */

export function DistributionBar({
  items,
  format = (n) => num(n),
  size = "md",
  legend = true,
}: {
  items: Array<{ key: string; label: string; value: number; color: string }>;
  format?: (n: number) => string;
  size?: "sm" | "md" | "lg";
  legend?: boolean;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="w-full">
      <div className={cn("flex w-full gap-0.5 overflow-hidden rounded-full", size === "sm" ? "h-2" : size === "md" ? "h-3" : "h-7 rounded-tile")}>
        {items.map((it) => (
          <div
            key={it.key}
            title={`${it.label}: ${format(it.value)}`}
            onMouseEnter={() => setHover(it.key)}
            onMouseLeave={() => setHover(null)}
            className="h-full transition-opacity first:rounded-l-[inherit] last:rounded-r-[inherit]"
            style={{ width: `${(it.value / total) * 100}%`, background: it.color, opacity: hover && hover !== it.key ? 0.4 : 1 }}
          />
        ))}
      </div>
      {legend && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {items.map((it) => (
            <div key={it.key} className={cn("min-w-0 transition-opacity", hover && hover !== it.key && "opacity-50")}>
              <span className="flex items-center gap-1.5 text-body-2 text-muted">
                <Swatch color={it.color} />
                <span className="truncate">{it.label}</span>
              </span>
              <span className="text-body font-medium num text-fg">
                {Math.round((it.value / total) * 100)}%<span className="ml-1.5 text-body-2 font-normal text-faint">{format(it.value)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- BulletChart ------------------------------ */

export function BulletChart({
  items,
  format = (n) => num(n),
  color = "var(--chart-blue)",
}: {
  /** ranges: limites das faixas de referência (ex.: [60, 85] = ruim/ok/bom) */
  items: Array<{ label: ReactNode; value: number; target: number; max?: number; ranges?: number[]; hint?: ReactNode }>;
  format?: (n: number) => string;
  color?: string;
}) {
  return (
    <div className="space-y-4">
      {items.map((it, i) => {
        const max = it.max ?? Math.max(it.value, it.target) * 1.15;
        const pctOf = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
        const ranges = it.ranges ?? [max * 0.5, max * 0.8];
        const hit = it.value >= it.target;
        return (
          <div key={i}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-body text-fg">{it.label}</span>
              <span className="shrink-0 text-body-2 text-muted num">
                <span className="font-semibold text-fg">{format(it.value)}</span> / meta {format(it.target)}
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-badge" style={{ background: "var(--chart-track)" }}>
              {[...ranges].reverse().map((r, ri) => (
                <div key={ri} className="absolute inset-y-0 left-0" style={{ width: pctOf(r), background: "var(--chart-neutral)", opacity: 0.25 + ri * 0.2 }} />
              ))}
              <div className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full transition-[width] duration-700" style={{ width: pctOf(it.value), background: color }} />
              <div className="absolute inset-y-0.5 w-0.5 rounded-full bg-fg" style={{ left: `calc(${pctOf(it.target)} - 1px)` }} title={`Meta: ${format(it.target)}`} />
            </div>
            {it.hint !== undefined ? (
              <p className="mt-1 text-caption text-muted">{it.hint}</p>
            ) : (
              <p className={cn("mt-1 text-caption", hit ? "text-lime-fg" : "text-muted")}>
                {hit ? "Meta atingida" : `Faltam ${format(it.target - it.value)} para a meta`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- FunnelChart ------------------------------ */

export function FunnelChart({
  steps,
  format = (n) => num(n),
  color = "var(--chart-blue)",
}: {
  steps: Array<{ label: string; value: number }>;
  format?: (n: number) => string;
  color?: string;
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="flex flex-col">
      {steps.map((s, i) => {
        const prev = steps[i - 1];
        const conv = prev ? (s.value / prev.value) * 100 : null;
        return (
          <div key={s.label}>
            {conv !== null && (
              <div className="flex items-center justify-center gap-1.5 py-1 text-caption text-muted">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                  <path d="M5 1v8M2 6l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="num">{num(conv, 0)}%</span> seguem
              </div>
            )}
            <div className="grid grid-cols-[minmax(80px,140px)_minmax(0,1fr)_64px] items-center gap-3">
              <span className="truncate text-body text-fg">{s.label}</span>
              <div className="flex justify-center">
                <div
                  className="h-9 rounded-tile transition-[width] duration-700"
                  style={{ width: `${Math.max(4, (s.value / max) * 100)}%`, background: color, opacity: 1 - (i / Math.max(1, steps.length)) * 0.55 }}
                />
              </div>
              <span className="text-right text-body font-medium num text-fg">{format(s.value)}</span>
            </div>
          </div>
        );
      })}
      <p className="mt-3 text-center text-body-2 text-muted">
        Conversão total <span className="font-semibold num text-fg">{num((steps[steps.length - 1].value / steps[0].value) * 100, 1)}%</span>
      </p>
    </div>
  );
}

/* ---------------------------------- HBars --------------------------------- */

export function HBars({
  items,
  format,
  className,
}: {
  items: Array<{ label: string; value: number; color?: string; hint?: string }>;
  format?: (n: number) => string;
  className?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((i) => (
        <div key={i.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-body text-fg">{i.label}</span>
            <span className="shrink-0 text-body font-semibold num text-fg">{format ? format(i.value) : i.value}</span>
          </div>
          <svg width="100%" height="6" className="block">
            <rect x="0" y="0" width="100%" height="6" rx="3" fill="var(--chart-track)" />
            <rect x="0" y="0" width={`${(i.value / max) * 100}%`} height="6" rx="3" fill={i.color ?? "var(--chart-blue)"} />
          </svg>
          {i.hint && <p className="mt-1 text-caption text-muted">{i.hint}</p>}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- SparkBars ------------------------------- */

export function SparkBars({
  points,
  color = "var(--chart-blue)",
  width = 96,
  height = 28,
  highlightLast = true,
}: {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
  highlightLast?: boolean;
}) {
  const max = Math.max(...points, 1);
  const gap = 2;
  const w = (width - gap * (points.length - 1)) / points.length;
  return (
    <svg width={width} height={height} className="block" aria-hidden>
      {points.map((p, i) => {
        const h = Math.max(2, (p / max) * height);
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={height - h}
            width={w}
            height={h}
            rx={Math.min(1.5, w / 2)}
            fill={color}
            opacity={highlightLast && i !== points.length - 1 ? 0.4 : 1}
          />
        );
      })}
    </svg>
  );
}
