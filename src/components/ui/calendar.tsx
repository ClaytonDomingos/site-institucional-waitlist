import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { cn, date, dateNum, MONTHS, monthLabel, plural, sameDay } from "@/lib/format";
import { Stepper } from "./buttons";
import { Popover } from "./overlays";

/* ---------------------------------------------------------------------------
   Calendário de mês e seletor de data. Dia selecionado em preto (primário),
   hoje em cinza, dias com marcação ganham um ponto azul embaixo.
--------------------------------------------------------------------------- */

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export function Calendar({
  value,
  onChange,
  today = new Date(),
  marked = [],
  className,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  today?: Date;
  /** dias com algo marcado (ponto embaixo do número) */
  marked?: Date[];
  className?: string;
}) {
  const base = value ?? today;
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const first = view.getDay();
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];

  return (
    <div className={cn("w-[260px]", className)}>
      <Stepper
        className="mb-2"
        label={monthLabel(view)}
        onPrev={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
        onNext={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
        prevLabel="Mês anterior"
        nextLabel="Próximo mês"
      />
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEK.map((w, i) => (
          <span key={i} className="py-1 text-caption font-medium text-muted">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const selected = value && sameDay(d, value);
          const isToday = sameDay(d, today);
          const hasMark = marked.some((m) => sameDay(m, d));
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={!!selected}
              aria-label={dateNum(d)}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-[6px] text-body-2 num transition-colors",
                selected ? "bg-primary font-medium text-primary-fg" : "text-fg hover:bg-surface-hover",
                !selected && isToday && "bg-surface-3 font-medium",
              )}
            >
              {d.getDate()}
              {hasMark && (
                <span className={cn("absolute bottom-1 size-1 rounded-full", selected ? "bg-primary-fg" : "bg-blue")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Campo de data que abre o Calendar num popover. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Escolher data",
  today,
  className,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  today?: Date;
  className?: string;
}) {
  return (
    <Popover
      trigger={(_, toggle) => (
        <button
          type="button"
          onClick={toggle}
          className={cn("field inline-flex h-8 w-full min-w-[180px] items-center gap-2 px-2.5 text-left", !value && "text-faint", className)}
        >
          <CalendarDays className="size-4 text-muted" />
          <span className="flex-1 num">{value ? dateNum(value) : placeholder}</span>
        </button>
      )}
    >
      {(close) => (
        <div className="p-2">
          <Calendar
            value={value}
            today={today}
            onChange={(d) => {
              onChange(d);
              close();
            }}
          />
        </div>
      )}
    </Popover>
  );
}

/* ---------------------------------------------------------------------------
   Período (range). Clique no início e depois no fim; enquanto escolhe o fim,
   passar o mouse já pinta a faixa. Pontas do período em preto, dias
   do meio numa faixa cinza que quebra no fim de cada semana.
--------------------------------------------------------------------------- */

export type DateRange = { from: Date | null; to: Date | null };

export type RangePreset = { id: string; label: string; range: (today: Date) => DateRange };

const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const sameRange = (a: DateRange, b: DateRange) =>
  (a.from ? dayKey(a.from) : 0) === (b.from ? dayKey(b.from) : 0) && (a.to ? dayKey(a.to) : 0) === (b.to ? dayKey(b.to) : 0);

/** Atalhos padrão do DateRangePicker, relativos a "hoje". */
export const RANGE_PRESETS: RangePreset[] = [
  { id: "tudo", label: "Todo o período", range: () => ({ from: null, to: null }) },
  { id: "hoje", label: "Hoje", range: (t) => ({ from: t, to: t }) },
  { id: "7d", label: "Últimos 7 dias", range: (t) => ({ from: addDays(t, -6), to: t }) },
  { id: "14d", label: "Últimos 14 dias", range: (t) => ({ from: addDays(t, -13), to: t }) },
  { id: "30d", label: "Últimos 30 dias", range: (t) => ({ from: addDays(t, -29), to: t }) },
  { id: "90d", label: "Últimos 90 dias", range: (t) => ({ from: addDays(t, -89), to: t }) },
  { id: "mes", label: "Este mês", range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }) },
  {
    id: "mes-passado",
    label: "Mês passado",
    range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) }),
  },
];

/** "9 – 24 set 2026", "28 ago – 3 set 2026", "17 set 2026" */
export function rangeLabel({ from, to }: DateRange): string {
  if (!from) return "";
  if (!to || dayKey(from) === dayKey(to)) return date(from);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  const left = sameMonth ? `${from.getDate()}` : sameYear ? `${from.getDate()} ${MONTHS[from.getMonth()]}` : date(from);
  return `${left} – ${date(to)}`;
}

export function RangeCalendar({
  value,
  onChange,
  today = new Date(),
  className,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  today?: Date;
  className?: string;
}) {
  const t = startOf(today);
  const base = value.to ?? value.from ?? t;
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const [hover, setHover] = useState<Date | null>(null);

  const picking = !!value.from && !value.to;
  const end = picking ? hover : value.to;
  let lo = value.from ? dayKey(value.from) : null;
  let hi = end ? dayKey(end) : lo;
  if (lo !== null && hi !== null && hi < lo) [lo, hi] = [hi, lo];

  // semanas completas, com os dias dos meses vizinhos em cinza
  const lead = view.getDay();
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((lead + days) / 7) * 7 },
    (_, i) => new Date(view.getFullYear(), view.getMonth(), i - lead + 1),
  );

  const pick = (d: Date) => {
    if (!value.from || value.to) onChange({ from: d, to: null });
    else if (dayKey(d) < dayKey(value.from)) onChange({ from: d, to: value.from });
    else onChange({ from: value.from, to: d });
  };

  return (
    <div className={cn("w-[260px]", className)}>
      <Stepper
        className="mb-2"
        label={monthLabel(view)}
        onPrev={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
        onNext={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
        prevLabel="Mês anterior"
        nextLabel="Próximo mês"
      />
      <div className="grid grid-cols-7 gap-y-0.5 text-center" onMouseLeave={() => setHover(null)}>
        {WEEK.map((w, i) => (
          <span key={i} className="py-1 text-caption font-medium text-muted">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          const k = dayKey(d);
          const col = i % 7;
          const inRange = lo !== null && hi !== null && k >= lo && k <= hi;
          const isStart = k === lo;
          const isEnd = k === hi;
          const edge = (!!value.from && k === dayKey(value.from)) || (!!value.to && k === dayKey(value.to));
          const outside = d.getMonth() !== view.getMonth();
          const isToday = k === dayKey(t);
          return (
            <div key={k} className="relative flex h-8 items-center justify-center">
              {inRange && lo !== hi && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 bg-surface-3",
                    isStart ? "left-1/2" : "left-0",
                    isEnd ? "right-1/2" : "right-0",
                    col === 0 && !isStart && "rounded-l-badge",
                    col === 6 && !isEnd && "rounded-r-badge",
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => pick(d)}
                onMouseEnter={() => picking && setHover(d)}
                aria-pressed={edge}
                aria-label={dateNum(d)}
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-[6px] text-body-2 num transition-colors",
                  edge
                    ? "bg-primary font-medium text-primary-fg"
                    : inRange
                      ? cn("hover:bg-line", outside ? "text-muted" : "text-fg")
                      : cn("hover:bg-surface-hover", outside ? "text-faint" : "text-fg"),
                  !edge && isToday && "font-semibold underline underline-offset-4",
                )}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Campo de período: atalhos à esquerda + RangeCalendar num popover. `{ from: null, to: null }` = todo o período. */
export function DateRangePicker({
  value,
  onChange,
  today = new Date(),
  presets = RANGE_PRESETS,
  placeholder = "Escolher período",
  align,
  className,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  today?: Date;
  /** atalhos da coluna da esquerda; `[]` esconde a coluna */
  presets?: RangePreset[];
  placeholder?: string;
  align?: "start" | "end";
  className?: string;
}) {
  const t = startOf(today);
  const active = presets.find((p) => sameRange(p.range(t), value));
  const label = active?.label ?? (rangeLabel(value) || placeholder);

  return (
    <Popover
      align={align}
      trigger={(_, toggle) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "field inline-flex h-8 w-full min-w-[200px] items-center gap-2 px-2.5 text-left",
            !active && !value.from && "text-faint",
            className,
          )}
        >
          <CalendarDays className="size-4 text-muted" />
          <span className="flex-1 truncate num">{label}</span>
          <ChevronDown className="size-4 text-muted" />
        </button>
      )}
    >
      {(close) => (
        <RangePanel
          value={value}
          today={t}
          presets={presets}
          activeId={active?.id}
          onDone={(r) => {
            onChange(r);
            close();
          }}
        />
      )}
    </Popover>
  );
}

/** Miolo do popover. Guarda o rascunho (só o início escolhido) sem mexer no valor de fora. */
function RangePanel({
  value,
  today,
  presets,
  activeId,
  onDone,
}: {
  value: DateRange;
  today: Date;
  presets: RangePreset[];
  activeId?: string;
  onDone: (r: DateRange) => void;
}) {
  const [draft, setDraft] = useState(value);
  const total = draft.from && draft.to ? Math.round((+startOf(draft.to) - +startOf(draft.from)) / 86_400_000) + 1 : 0;

  return (
    <div className="flex flex-col sm:flex-row">
      {presets.length > 0 && (
        <div className="grid grid-cols-2 gap-0.5 border-b border-line p-2 sm:flex sm:w-[150px] sm:flex-col sm:border-r sm:border-b-0">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onDone(p.range(today))}
              className={cn(
                "rounded-[6px] px-2 py-1.5 text-left text-body-2 font-medium whitespace-nowrap transition-colors",
                p.id === activeId && draft === value
                  ? "bg-surface-3 text-fg"
                  : "text-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="p-2">
        <RangeCalendar value={draft} today={today} onChange={(r) => (r.to ? onDone(r) : setDraft(r))} />
        <p className="mt-2 px-1 text-caption text-faint">
          {draft.from && !draft.to
            ? `Início em ${date(draft.from)}. Escolha o dia final.`
            : total
              ? `${rangeLabel(draft)} · ${plural(total, "dia", "dias")}`
              : "Clique no dia inicial e depois no final."}
        </p>
      </div>
    </div>
  );
}
