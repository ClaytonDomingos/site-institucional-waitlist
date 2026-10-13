import { useId, useState, type MouseEvent } from "react";
import { ChartTooltip, GridY, HatchPattern, XLabels, axisPad, linearPath, niceScale, smoothPath, useMeasure } from "./core";

/* ---------------------------------------------------------------------------
   Linhas e dispersão.

   LineChart     várias séries com cursor vertical e tooltip; área opcional,
                 série tracejada para meta/projeção, curva suave ou reta
   ScatterChart  dispersão / bolhas (x, y, tamanho) com grupos e tooltip
   SparkArea     área mínima para fundo de KPI (ocupa a largura)
   Sparkline     linha mínima de largura fixa, para tabela e KPI
--------------------------------------------------------------------------- */

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  points: number[];
  dashed?: boolean;
  /** preenche a área embaixo da linha com hachura (o estilo do ReUI) */
  area?: boolean;
}

export function LineChart({
  series,
  labels,
  height = 240,
  format,
  curve = "smooth",
  dots = false,
}: {
  series: LineSeries[];
  labels: string[];
  height?: number;
  format: (n: number) => string;
  curve?: "smooth" | "linear";
  /** bolinha em cada ponto (sempre aparece a do cursor) */
  dots?: boolean;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const all = series.flatMap((s) => s.points);
  const scale = niceScale(Math.min(0, ...all), Math.max(...all, 1));
  const padLeft = axisPad(scale.ticks.map(format));
  const padRight = 12;
  const padTop = 12;
  const plotW = Math.max(0, width - padLeft - padRight);
  const plotH = height - padTop - 6;
  const y = (v: number) => padTop + plotH - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const step = labels.length > 1 ? plotW / (labels.length - 1) : 0;
  const x = (i: number) => padLeft + step * i;
  const path = curve === "smooth" ? smoothPath : linearPath;

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round((e.clientX - rect.left - padLeft) / (step || 1));
    setHover(i < 0 || i >= labels.length ? null : i);
  };

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && (
        <svg width={width} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="overflow-visible">
          <defs>
            {series.map((s) => (
              <HatchPattern key={s.key} id={`${uid}-${s.key}`} color={s.color} opacity={0.35} />
            ))}
          </defs>
          <GridY ticks={scale.ticks} y={y} left={padLeft} right={width - padRight} format={format} zero={scale.min < 0} />
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padTop} y2={padTop + plotH} stroke="var(--border-strong)" />}
          {series.map((s) => {
            const pts: Array<[number, number]> = s.points.map((p, i) => [x(i), y(p)]);
            const base = y(Math.max(0, scale.min));
            return (
              <g key={s.key}>
                {s.area && (
                  <>
                    <path d={`${path(pts)} L ${pts[pts.length - 1][0]} ${base} L ${pts[0][0]} ${base} Z`} fill={s.color} fillOpacity={0.06} />
                    <path d={`${path(pts)} L ${pts[pts.length - 1][0]} ${base} L ${pts[0][0]} ${base} Z`} fill={`url(#${uid}-${s.key})`} />
                  </>
                )}
                <path d={path(pts)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeDasharray={s.dashed ? "5 5" : undefined} />
                {pts.map(([px, py], i) =>
                  dots || hover === i ? (
                    <circle key={i} cx={px} cy={py} r={hover === i ? 4.5 : 3} fill="var(--card)" stroke={s.color} strokeWidth="2" />
                  ) : null,
                )}
              </g>
            );
          })}
        </svg>
      )}
      <XLabels labels={labels} left={padLeft} right={padRight} mode="point" active={hover} />
      {hover !== null && (
        <ChartTooltip
          x={x(hover)}
          y={Math.min(...series.map((s) => y(s.points[hover] ?? 0)))}
          width={width}
          title={labels[hover]}
          rows={series.map((s) => ({ label: s.label, value: format(s.points[hover] ?? 0), color: s.color }))}
        />
      )}
    </div>
  );
}

/* ------------------------------ ScatterChart ------------------------------ */

export interface ScatterPoint {
  x: number;
  y: number;
  /** tamanho da bolha (opcional — sem ele, todos iguais) */
  size?: number;
  label?: string;
  group?: string;
}

export function ScatterChart({
  points,
  groups,
  height = 260,
  formatX,
  formatY,
  xLabel,
  yLabel,
}: {
  points: ScatterPoint[];
  /** cor por grupo; pontos sem grupo usam a primeira */
  groups: Array<{ key: string; label: string; color: string }>;
  height?: number;
  formatX: (n: number) => string;
  formatY: (n: number) => string;
  xLabel?: string;
  yLabel?: string;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const sy0 = niceScale(Math.min(0, ...points.map((p) => p.y)), Math.max(...points.map((p) => p.y)));
  const padLeft = axisPad(sy0.ticks.map(formatY));
  const padRight = 16;
  const padTop = 12;
  const padBottom = 26;
  const plotW = Math.max(0, width - padLeft - padRight);
  const plotH = height - padTop - padBottom;
  const sx = niceScale(Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x)));
  const sy = niceScale(Math.min(0, ...points.map((p) => p.y)), Math.max(...points.map((p) => p.y)));
  const maxSize = Math.max(...points.map((p) => p.size ?? 1), 1);
  const x = (v: number) => padLeft + ((v - sx.min) / (sx.max - sx.min)) * plotW;
  const y = (v: number) => padTop + plotH - ((v - sy.min) / (sy.max - sy.min)) * plotH;
  const r = (s?: number) => (s === undefined ? 5 : 4 + Math.sqrt(s / maxSize) * 16);
  const colorOf = (g?: string) => groups.find((gr) => gr.key === g)?.color ?? groups[0]?.color ?? "var(--chart-blue)";

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          <GridY ticks={sy.ticks} y={y} left={padLeft} right={width - padRight} format={formatY} />
          {sx.ticks.map((t) => (
            <text key={t} x={x(t)} y={height - 8} textAnchor="middle" fontSize="12" fill="var(--muted)" className="num">
              {formatX(t)}
            </text>
          ))}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={x(p.x)}
              cy={y(p.y)}
              r={r(p.size)}
              fill={colorOf(p.group)}
              fillOpacity={hover === null || hover === i ? 0.55 : 0.2}
              stroke={colorOf(p.group)}
              strokeWidth={hover === i ? 2 : 1}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: "fill-opacity 150ms" }}
            />
          ))}
        </svg>
      )}
      {(xLabel || yLabel) && (
        <div className="mt-1 flex justify-between text-caption text-muted" style={{ paddingLeft: padLeft }}>
          <span>{yLabel && `↑ ${yLabel}`}</span>
          <span>{xLabel && `${xLabel} →`}</span>
        </div>
      )}
      {hover !== null && (
        <ChartTooltip
          x={x(points[hover].x)}
          y={y(points[hover].y)}
          width={width}
          title={points[hover].label}
          rows={[
            { label: xLabel ?? "x", value: formatX(points[hover].x), color: colorOf(points[hover].group) },
            { label: yLabel ?? "y", value: formatY(points[hover].y) },
            ...(points[hover].size !== undefined ? [{ label: "tamanho", value: String(points[hover].size) }] : []),
          ]}
        />
      )}
    </div>
  );
}

/* -------------------------------- SparkArea ------------------------------- */

export function SparkArea({
  points,
  color = "var(--chart-blue)",
  height = 48,
  className,
}: {
  points: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const uid = useId().replace(/:/g, "");
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const pts: Array<[number, number]> = points.map((p, i) => [step * i, height - 2 - ((p - min) / (max - min || 1)) * (height - 6)]);
  const line = smoothPath(pts);
  return (
    <div ref={ref} className={className} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="block" aria-hidden>
          <defs>
            <HatchPattern id={uid} color={color} opacity={0.35} />
          </defs>
          <path d={`${line} L ${width} ${height} L 0 ${height} Z`} fill={color} fillOpacity={0.06} />
          <path d={`${line} L ${width} ${height} L 0 ${height} Z`} fill={`url(#${uid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

/* -------------------------------- Sparkline ------------------------------- */

export function Sparkline({
  points,
  color = "var(--chart-blue)",
  width = 96,
  height = 28,
}: {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const coords: Array<[number, number]> = points.map((p, i) => [
    step * i,
    height - ((p - min) / (max - min || 1)) * (height - 4) - 2,
  ]);
  return (
    <svg width={width} height={height} className="block">
      <path d={smoothPath(coords)} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
