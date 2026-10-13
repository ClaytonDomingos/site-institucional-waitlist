import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn, hm, monthLabel, sameDay } from "@/lib/format";
import { Avatar } from "./display";
import { Stepper } from "./buttons";
import { TONE_SOFT, TONE_VAR, type Tone } from "./tone";

/* ---------------------------------------------------------------------------
   Agenda.

   WeekStrip   faixa da semana para escolher o dia, com marcação de ocupação
   TimeSlots   grade de horários livres/ocupados para agendar
   AgendaDay   grade do dia com uma coluna por profissional/sala, eventos
               coloridos por tom, linha de "agora" e horário livre clicável
--------------------------------------------------------------------------- */

const WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WeekStrip({
  value,
  onChange,
  today = new Date(),
  counts,
}: {
  value: Date;
  onChange: (d: Date) => void;
  today?: Date;
  /** quantos compromissos em cada dia (mostra pontinhos) */
  counts?: (d: Date) => number;
}) {
  const [anchor, setAnchor] = useState(() => new Date(value.getFullYear(), value.getMonth(), value.getDate() - value.getDay()));
  const days = Array.from({ length: 7 }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + i));
  const shift = (n: number) => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + n));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body font-medium text-fg">{monthLabel(days[3])}</span>
        <Stepper label="Semana" onPrev={() => shift(-7)} onNext={() => shift(7)} prevLabel="Semana anterior" nextLabel="Próxima semana" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const sel = sameDay(d, value);
          const isToday = sameDay(d, today);
          const n = counts?.(d) ?? 0;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={sel}
              className={cn(
                "focus-ring flex flex-col items-center gap-0.5 rounded-tile py-2 transition-colors",
                sel ? "border border-primary bg-primary text-primary-fg shadow-xs" : "tile text-fg hover:bg-surface",
                !sel && isToday && "border-line-strong bg-surface-3",
              )}
            >
              <span className={cn("text-caption", sel ? "text-primary-fg/75" : "text-muted")}>{WEEK_SHORT[d.getDay()]}</span>
              <span className="text-headline font-semibold num">{d.getDate()}</span>
              <span className="flex h-1.5 items-center gap-0.5">
                {Array.from({ length: Math.min(3, n) }, (_, i) => (
                  <span key={i} className={cn("size-1 rounded-full", sel ? "bg-primary-fg" : "bg-blue")} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimeSlots({
  slots,
  value,
  onChange,
  columns = 4,
}: {
  slots: Array<{ time: string; available: boolean }>;
  value: string | null;
  onChange: (t: string) => void;
  columns?: 3 | 4 | 5 | 6;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "grid gap-1.5",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-3 sm:grid-cols-4",
        columns === 5 && "grid-cols-3 sm:grid-cols-5",
        columns === 6 && "grid-cols-4 sm:grid-cols-6",
      )}
    >
      {slots.map((s) => {
        const sel = value === s.time;
        return (
          <button
            key={s.time}
            type="button"
            role="radio"
            aria-checked={sel}
            disabled={!s.available}
            onClick={() => onChange(s.time)}
            className={cn(
              "focus-ring h-8 rounded-tile border text-body-2 font-medium num transition-colors",
              sel && "border-primary bg-primary text-primary-fg shadow-xs",
              !sel && s.available && "border-line bg-control text-fg shadow-xs hover:bg-control-hover",
              !s.available && "cursor-not-allowed border-transparent bg-surface-3 text-faint line-through",
            )}
          >
            {s.time}
          </button>
        );
      })}
    </div>
  );
}

export interface AgendaEvent {
  id: string;
  resource: string;
  /** minutos desde 00h00 */
  start: number;
  end: number;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: Tone;
}

export function AgendaDay({
  resources,
  events,
  startHour = 8,
  endHour = 18,
  now,
  slot = 30,
  pxPerSlot = 34,
  onEventClick,
  onSlotClick,
}: {
  resources: Array<{ key: string; label: string; sublabel?: string; photo?: string; color?: string }>;
  events: AgendaEvent[];
  startHour?: number;
  endHour?: number;
  /** minutos desde 00h00 — desenha a linha vermelha de agora */
  now?: number;
  /** duração de cada linha da grade, em minutos */
  slot?: number;
  pxPerSlot?: number;
  onEventClick?: (e: AgendaEvent) => void;
  /** clique em horário livre (ex.: encaixe) */
  onSlotClick?: (resource: string, minutes: number) => void;
}) {
  const start = startHour * 60;
  const end = endHour * 60;
  const rows = (end - start) / slot;
  const pxPerMin = pxPerSlot / slot;
  const height = rows * pxPerSlot;
  const top = (m: number) => (m - start) * pxPerMin;
  const busy = (res: string, m: number) => events.some((e) => e.resource === res && e.start < m + slot && e.end > m);

  return (
    <div className="overflow-x-auto scroll-thin rounded-card border border-line bg-card shadow-card">
      <div style={{ minWidth: 72 + resources.length * 170 }}>
        {/* cabeçalho com os profissionais */}
        <div className="sticky top-0 z-10 grid border-b border-line bg-surface" style={{ gridTemplateColumns: `64px repeat(${resources.length}, minmax(0, 1fr))` }}>
          <span />
          {resources.map((r) => (
            <div key={r.key} className="flex min-w-0 items-center gap-2 border-l border-line px-3 py-2.5">
              <Avatar name={r.label} src={r.photo} color={r.color} size={28} />
              <div className="min-w-0">
                <p className="truncate text-body font-medium text-fg">{r.label}</p>
                {r.sublabel && <p className="truncate text-caption text-muted">{r.sublabel}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: `64px repeat(${resources.length}, minmax(0, 1fr))`, height }}>
          {/* horas */}
          <div className="relative">
            {Array.from({ length: rows }, (_, i) =>
              (start + i * slot) % 60 === 0 ? (
                <span key={i} className="absolute right-2 -translate-y-1/2 text-caption font-medium text-muted num" style={{ top: i * pxPerSlot || 8 }}>
                  {hm(start + i * slot)}
                </span>
              ) : null,
            )}
          </div>

          {resources.map((r) => (
            <div key={r.key} className="relative border-l border-line">
              {Array.from({ length: rows }, (_, i) => {
                const m = start + i * slot;
                const free = !busy(r.key, m);
                return (
                  <div
                    key={i}
                    className={cn("group absolute inset-x-0 border-t", m % 60 === 0 ? "border-line" : "border-dashed border-line/70")}
                    style={{ top: i * pxPerSlot, height: pxPerSlot }}
                  >
                    {free && onSlotClick && (
                      <button
                        type="button"
                        onClick={() => onSlotClick(r.key, m)}
                        className="absolute inset-0.5 flex items-center justify-center gap-1 rounded-badge border border-dashed border-line-strong text-caption font-medium text-muted opacity-0 transition-opacity group-hover:bg-surface group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Plus className="size-3.5" /> {hm(m)}
                      </button>
                    )}
                  </div>
                );
              })}
              {events
                .filter((e) => e.resource === r.key)
                .map((e) => {
                  const h = Math.max(pxPerSlot * 0.6, (e.end - e.start) * pxPerMin - 3);
                  const tone = e.tone ?? "blue";
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onEventClick?.(e)}
                      className={cn(
                        "absolute inset-x-1 z-[1] flex flex-col overflow-hidden rounded-[6px] py-1 pr-2 pl-2.5 text-left transition-[filter] hover:brightness-95",
                        TONE_SOFT[tone],
                      )}
                      style={{ top: top(e.start) + 1.5, height: h, boxShadow: `inset 3px 0 0 ${TONE_VAR[tone]}` }}
                    >
                      <span className="truncate text-caption font-semibold">{e.title}</span>
                      {h > 34 && (
                        <span className="truncate text-caption opacity-80">
                          {hm(e.start)}–{hm(e.end)}
                          {e.subtitle ? <> · {e.subtitle}</> : null}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}

          {now !== undefined && now >= start && now <= end && (
            <div className="pointer-events-none absolute right-0 left-[56px] z-[2] flex items-center" style={{ top: top(now) }}>
              <span className="size-2 -translate-x-1 rounded-full bg-red" />
              <span className="h-0.5 flex-1 bg-red" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
