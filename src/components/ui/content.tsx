import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Check, ChevronLeft, ChevronRight, File, FileImage, FileSpreadsheet, FileText, X } from "lucide-react";
import { cn, num } from "@/lib/format";
import { SparkArea } from "@/components/charts/lines";
import { Button, IconButton } from "./buttons";
import { Avatar, Badge, Count } from "./display";
import { Progress } from "./feedback";
import { CheckMark, ChoiceCard, RadioGroup, Textarea } from "./forms";
import { Popover } from "./overlays";
import { Card } from "./surfaces";
import { TONE_SOFT, TONE_VAR, type Tone } from "./tone";

/* ---------------------------------------------------------------------------
   Blocos de conteúdo prontos.

   KanbanBoard       colunas com cartões arrastáveis (funil, triagem, tarefas)
   NotificationList  lista de avisos com não lidos; NotificationBell no topo
   PricingCard       plano com preço, itens e botão
   ProfileCard       pessoa com foto, papel, números e ações
   FileItem          arquivo com ícone por tipo, tamanho e envio em andamento
   Checklist         passos com progresso (onboarding, implantação)
   Banner            faixa de anúncio no topo da página
   StatTrend         KPI com área de tendência no rodapé
   Carousel          faixa de slides com setas, pontos e arraste
   Questionnaire     perguntas uma a uma (única, múltipla, texto), com resumo

   A conversa (ChatThread, ChatComposer, Marker, MessageScroller) está em chat.tsx.
--------------------------------------------------------------------------- */

/* --------------------------------- Kanban --------------------------------- */

export function KanbanBoard<T extends { id: string; column: string }>({
  columns,
  items,
  onMove,
  renderCard,
  onAdd,
}: {
  columns: Array<{ key: string; title: string; tone?: Tone }>;
  items: T[];
  onMove: (id: string, column: string) => void;
  renderCard: (item: T) => ReactNode;
  /** mostra "+ Adicionar" no fim de cada coluna */
  onAdd?: (column: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  return (
    <div className="flex gap-3 overflow-x-auto scroll-thin pb-2">
      {columns.map((c) => {
        const list = items.filter((i) => i.column === c.key);
        return (
          <div
            key={c.key}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(c.key);
            }}
            onDragLeave={() => setOver((o) => (o === c.key ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) onMove(id, c.key);
              setOver(null);
              setDragging(null);
            }}
            className={cn(
              "flex w-[272px] shrink-0 flex-col gap-2 rounded-card border border-line bg-surface p-[5px] transition-shadow",
              over === c.key && dragging && "shadow-[inset_0_0_0_1px_var(--ring)]",
            )}
          >
            <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
              <span className="flex items-center gap-2 text-body font-semibold text-fg">
                <span className="size-2 rounded-full" style={{ background: TONE_VAR[c.tone ?? "neutral"] }} />
                {c.title}
              </span>
              <Count>{list.length}</Count>
            </div>
            {list.map((it) => (
              <div
                key={it.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", it.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragging(it.id);
                }}
                onDragEnd={() => setDragging(null)}
                className={cn(
                  "tile cursor-grab p-3 transition-opacity active:cursor-grabbing",
                  dragging === it.id && "opacity-40",
                )}
              >
                {renderCard(it)}
              </div>
            ))}
            {list.length === 0 && (
              <div className="rounded-tile border border-dashed border-line-strong px-3 py-5 text-center text-caption text-muted">Arraste um cartão para cá</div>
            )}
            {onAdd && (
              <button
                type="button"
                onClick={() => onAdd(c.key)}
                className="rounded-[6px] px-2 py-1.5 text-left text-body-2 font-medium text-muted transition-colors hover:bg-surface-hover hover:text-fg"
              >
                + Adicionar
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Notificações ------------------------------ */

export interface NotificationItem {
  id: string;
  title: ReactNode;
  detail?: ReactNode;
  time: string;
  tone?: Tone;
  icon?: ReactNode;
  unread?: boolean;
}

export function NotificationList({
  items,
  onOpen,
  compact,
}: {
  items: NotificationItem[];
  onOpen?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <ul className="flex flex-col">
      {items.map((n) => (
        <li key={n.id}>
          <button
            type="button"
            onClick={() => onOpen?.(n.id)}
            className={cn("focus-ring flex w-full items-start gap-3 rounded-tile text-left transition-colors hover:bg-surface-hover", compact ? "px-2 py-2" : "px-3 py-2.5")}
          >
            <span className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-tile [&>svg]:size-4", TONE_SOFT[n.tone ?? "neutral"])}>
              {n.icon ?? <Bell />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-body", n.unread ? "font-semibold text-fg" : "text-fg")}>{n.title}</span>
              {n.detail && <span className="block truncate text-body-2 text-muted">{n.detail}</span>}
              <span className="mt-0.5 block text-caption text-faint">{n.time}</span>
            </span>
            {n.unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-blue" aria-label="não lida" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Sino com contagem que abre a lista num popover. */
export function NotificationBell({
  items,
  onOpen,
  onReadAll,
}: {
  items: NotificationItem[];
  onOpen?: (id: string) => void;
  onReadAll?: () => void;
}) {
  const unread = items.filter((i) => i.unread).length;
  return (
    <Popover
      align="end"
      width={360}
      trigger={(open, toggle) => (
        <span className="relative inline-flex">
          <IconButton label="Notificações" onClick={toggle} aria-expanded={open}>
            <Bell />
          </IconButton>
          {unread > 0 && (
            <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-semibold text-solid-fg num ring-2 ring-[var(--bg)]">
              {unread}
            </span>
          )}
        </span>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <span className="text-body font-semibold text-fg">Notificações</span>
            {onReadAll && unread > 0 && (
              <button type="button" onClick={onReadAll} className="text-body-2 font-medium text-muted underline-offset-4 hover:text-fg hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto scroll-thin p-1">
            <NotificationList
              compact
              items={items}
              onOpen={(id) => {
                onOpen?.(id);
                close();
              }}
            />
          </div>
        </div>
      )}
    </Popover>
  );
}

/* --------------------------------- Cartões -------------------------------- */

export function PricingCard({
  name,
  price,
  period = "/mês",
  description,
  features,
  highlighted,
  badge = "Mais escolhido",
  cta = "Escolher plano",
  onSelect,
  current,
}: {
  name: string;
  price: string;
  period?: string;
  description?: ReactNode;
  features: Array<string | { label: string; included: boolean }>;
  highlighted?: boolean;
  badge?: string;
  cta?: string;
  onSelect?: () => void;
  /** plano atual: botão vira "Plano atual" desabilitado */
  current?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-card border bg-card p-5 shadow-card",
        highlighted ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-line",
      )}
    >
      {highlighted && (
        <Badge tone="primary" variant="solid" size="sm" className="absolute -top-2.5 left-5">
          {badge}
        </Badge>
      )}
      <p className="text-headline font-semibold text-fg">{name}</p>
      {description && <p className="mt-1 text-body-2 text-muted">{description}</p>}
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-[32px] leading-[40px] font-semibold num text-fg">{price}</span>
        <span className="text-body text-muted">{period}</span>
      </p>
      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {features.map((f, i) => {
          const it = typeof f === "string" ? { label: f, included: true } : f;
          return (
            <li key={i} className={cn("flex items-start gap-2 text-body", it.included ? "text-fg" : "text-faint line-through")}>
              <span
                className={cn(
                  "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full",
                  it.included ? "bg-primary text-primary-fg" : "bg-surface-3 text-faint",
                )}
              >
                {it.included ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
              </span>
              {it.label}
            </li>
          );
        })}
      </ul>
      <Button className="mt-5" block variant={highlighted ? "primary" : "secondary"} disabled={current} onClick={onSelect}>
        {current ? "Plano atual" : cta}
      </Button>
    </div>
  );
}

export function ProfileCard({
  name,
  role,
  photo,
  color,
  stats,
  actions,
  status,
  children,
}: {
  name: string;
  role?: ReactNode;
  photo?: string;
  color?: string;
  stats?: Array<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
  status?: Tone;
  children?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center text-center">
      <Avatar name={name} src={photo} color={color} size={72} status={status} />
      <p className="mt-3 text-headline font-semibold text-fg">{name}</p>
      {role && <p className="text-body-2 text-muted">{role}</p>}
      {children && <div className="mt-2">{children}</div>}
      {stats && (
        <div className="mt-4 grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map((s) => (
            <div key={s.label} className="rounded-tile border border-line bg-surface p-2">
              <p className="text-headline font-semibold num text-fg">{s.value}</p>
              <p className="truncate text-caption text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      {actions && <div className="mt-4 flex w-full gap-2 [&>*]:flex-1">{actions}</div>}
    </Card>
  );
}

function fileMeta(name: string): { icon: typeof File; tone: Tone } {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) return { icon: FileImage, tone: "purple" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { icon: FileSpreadsheet, tone: "lime" };
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return { icon: FileText, tone: "cyan" };
  return { icon: File, tone: "neutral" };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${num(bytes / 1024)} KB`;
  return `${num(bytes / 1024 / 1024, 1)} MB`;
}

export function FileItem({
  name,
  size,
  meta,
  progress,
  actions,
}: {
  name: string;
  size?: number;
  /** texto extra: "enviado por Helena · 12 ago" */
  meta?: ReactNode;
  /** 0–100 enquanto envia; omita quando pronto */
  progress?: number;
  actions?: ReactNode;
}) {
  const { icon: Icon, tone } = fileMeta(name);
  const uploading = progress !== undefined && progress < 100;
  return (
    <div className="tile flex items-center gap-3 px-3 py-2.5">
      <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-tile", TONE_SOFT[tone])}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-fg">{name}</p>
        {uploading ? (
          <div className="mt-1 flex items-center gap-2">
            <Progress value={progress} height={4} className="flex-1" label={`Enviando ${name}`} />
            <span className="text-caption text-muted num">{Math.round(progress)}%</span>
          </div>
        ) : (
          <p className="truncate text-caption text-muted">
            {[size !== undefined ? formatBytes(size) : null, meta].filter(Boolean).map((x, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {x}
              </span>
            ))}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}

/* -------------------------------- Checklist ------------------------------- */

export function Checklist({
  items,
  onToggle,
  title,
}: {
  items: Array<{ id: string; label: ReactNode; description?: ReactNode; done: boolean; action?: ReactNode }>;
  onToggle: (id: string) => void;
  title?: ReactNode;
}) {
  const done = items.filter((i) => i.done).length;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        {title && <p className="text-body font-medium text-fg">{title}</p>}
        <span className="text-body-2 text-muted num">
          {done} de {items.length}
        </span>
      </div>
      <Progress value={(done / items.length) * 100} tone={done === items.length ? "lime" : "primary"} className="mb-3" label="Progresso" />
      <ul className="flex flex-col gap-1.5">
        {items.map((it) => (
          <li key={it.id} className="tile flex items-start gap-3 px-3 py-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={it.done}
              aria-label={typeof it.label === "string" ? it.label : "Concluir"}
              onClick={() => onToggle(it.id)}
              className={cn(
                "mt-px flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                it.done ? "bg-primary text-primary-fg" : "border border-line-strong bg-control shadow-xs hover:border-ring",
              )}
            >
              {it.done && <Check className="size-3" strokeWidth={3} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn("text-body font-medium", it.done ? "text-muted line-through" : "text-fg")}>{it.label}</p>
              {it.description && !it.done && <p className="text-body-2 text-muted">{it.description}</p>}
            </div>
            {it.action && !it.done && <div className="shrink-0">{it.action}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Banner --------------------------------- */

export function Banner({
  children,
  icon,
  action,
  onClose,
  variant = "solid",
}: {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  /** solid: preto (primário) · soft: faixa cinza com borda */
  variant?: "solid" | "soft";
}) {
  const solid = variant === "solid";
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-tile border px-4 py-2.5",
        solid ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-fg",
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:size-4">{icon}</span>}
      <div className="min-w-0 flex-1 text-body font-medium">{children}</div>
      {action}
      {onClose && (
        <button type="button" aria-label="Fechar" onClick={onClose} className="shrink-0 opacity-75 transition-opacity hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------- StatTrend ------------------------------- */

export function StatTrend({
  label,
  value,
  delta,
  points,
  color = "var(--chart-blue)",
  hint,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  points: number[];
  color?: string;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <Card padded={false} className={cn("flex min-h-[132px] flex-col justify-between overflow-hidden", className)}>
      <div className="px-4 pt-4">
        <p className="text-body font-medium text-fg">{label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-title-1 font-semibold num text-fg">{value}</span>
          {delta}
        </div>
        {hint && <p className="text-body-2 text-muted">{hint}</p>}
      </div>
      <SparkArea points={points} color={color} height={44} className="mt-2" />
    </Card>
  );
}

/* -------------------------------- Carousel -------------------------------- */

/**
 * Faixa de slides com setas, pontos e arraste/rolagem nativos (snap). A
 * largura de cada slide vem de `slideClassName`: "basis-full" mostra um por
 * vez; "basis-4/5 sm:basis-1/2 lg:basis-1/3" mostra vários e deixa o próximo
 * aparecendo. `autoPlay` em ms avança sozinho e pausa com o mouse em cima.
 */
export function Carousel({
  children,
  slideClassName = "basis-full",
  autoPlay,
  label = "Carrossel",
  className,
}: {
  children: ReactNode;
  slideClassName?: string;
  autoPlay?: number;
  label?: string;
  className?: string;
}) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [stops, setStops] = useState(slides.length);
  const [paused, setPaused] = useState(false);

  /* distância entre o início de um slide e o do próximo */
  const stepPx = () => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return 1;
    return first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
  };

  const measure = () => {
    const el = track.current;
    if (!el) return;
    const step = stepPx();
    const perView = Math.max(1, Math.round((el.clientWidth + 1) / step));
    const n = Math.max(1, slides.length - perView + 1);
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    setStops(n);
    setIndex(atEnd ? n - 1 : Math.min(n - 1, Math.round(el.scrollLeft / step)));
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slides.length]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const to = Math.max(0, Math.min(stops - 1, i));
    el.scrollTo({ left: to * stepPx(), behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoPlay || paused || stops < 2) return;
    const t = window.setTimeout(() => go(index >= stops - 1 ? 0 : index + 1), autoPlay);
    return () => window.clearTimeout(t);
  }, [autoPlay, paused, index, stops]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={track}
        tabIndex={0}
        onScroll={measure}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(index - 1);
          }
        }}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-none rounded-tile outline-none focus-visible:ring-3 focus-visible:ring-ring/45"
      >
        {slides.map((s, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${slides.length}`} className={cn("min-w-0 shrink-0 snap-start", slideClassName)}>
            {s}
          </div>
        ))}
      </div>

      {stops > 1 && (
        <>
          {index > 0 && (
            <IconButton label="Anterior" onClick={() => go(index - 1)} className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full shadow-dropdown">
              <ChevronLeft />
            </IconButton>
          )}
          {index < stops - 1 && (
            <IconButton label="Próximo" onClick={() => go(index + 1)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full shadow-dropdown">
              <ChevronRight />
            </IconButton>
          )}
          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: stops }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === index || undefined}
                onClick={() => go(i)}
                className={cn("h-1.5 rounded-full transition-all duration-200", i === index ? "w-4 bg-primary" : "w-1.5 bg-line-strong hover:bg-ring")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------ Questionnaire ----------------------------- */

export interface Question {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  type: "single" | "multiple" | "text";
  options?: Array<{ value: string; label: ReactNode; description?: ReactNode }>;
  /** sem `required`, a pergunta mostra "Pular" */
  required?: boolean;
  placeholder?: string;
}

/** respostas por id da pergunta; pergunta pulada não aparece */
export type QuestionnaireAnswers = Record<string, string | string[]>;

/**
 * Questionário de uma pergunta por vez: escolha única, múltipla ou texto
 * livre, com progresso, Voltar, Pular (se opcional) e validação. No fim
 * chama `onSubmit` e mostra o resumo das respostas.
 */
export function Questionnaire({
  questions,
  onSubmit,
  submitLabel = "Enviar respostas",
  className,
}: {
  questions: Question[];
  onSubmit: (answers: QuestionnaireAnswers) => void;
  submitLabel?: string;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[step];
  const last = step === questions.length - 1;
  const value = answers[q?.id];
  const empty = value === undefined || (Array.isArray(value) ? value.length === 0 : !value.trim());

  const set = (v: string | string[]) => {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    setError(false);
  };

  const advance = (next: QuestionnaireAnswers) => {
    if (!last) {
      setStep(step + 1);
      return;
    }
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v.trim() !== "")));
    setAnswers(clean);
    setDone(true);
    onSubmit(clean);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
    setError(false);
  };

  if (done) {
    const shown = (item: Question) => {
      const v = answers[item.id];
      if (v === undefined) return <span className="text-faint">Pulada</span>;
      if (item.type === "text") return v;
      const vals = Array.isArray(v) ? v : [v];
      return vals.map((x, i) => (
        <span key={x}>
          {i > 0 && ", "}
          {item.options?.find((o) => o.value === x)?.label ?? x}
        </span>
      ));
    };
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-col items-center pt-2 text-center">
          <span className="mb-3 inline-flex size-10 items-center justify-center rounded-tile border border-lime/20 bg-lime/10 text-lime">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <p className="text-headline font-semibold text-fg">Respostas enviadas</p>
          <p className="mt-0.5 text-body-2 text-muted num">
            {Object.keys(answers).length} de {questions.length} perguntas respondidas
          </p>
        </div>
        <div className="space-y-1.5">
          {questions.map((item) => (
            <div key={item.id} className="tile px-3 py-2">
              <p className="text-caption text-muted">{item.title}</p>
              <p className="mt-0.5 text-body text-fg">{shown(item)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button size="sm" onClick={restart}>
            Responder de novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-caption text-muted">
        <span className="num">
          Pergunta {step + 1} de {questions.length}
        </span>
        {!q.required && <span>Opcional</span>}
      </div>
      <Progress value={((step + 1) / questions.length) * 100} label={`Pergunta ${step + 1} de ${questions.length}`} height={4} />

      <div key={q.id} className="mt-4 animate-fade-up">
        <p className="text-headline font-semibold text-fg">
          {q.title}
          {q.required && <span className="ml-0.5 text-red">*</span>}
        </p>
        {q.description && <p className="mt-0.5 text-body-2 text-muted">{q.description}</p>}

        <div className="mt-3">
          {q.type === "single" && (
            <RadioGroup variant="cards" value={typeof value === "string" ? value : ""} onChange={set} options={q.options ?? []} label={typeof q.title === "string" ? q.title : undefined} />
          )}
          {q.type === "multiple" && (
            <div className="grid gap-2" role="group">
              {(q.options ?? []).map((o) => {
                const list = Array.isArray(value) ? value : [];
                const on = list.includes(o.value);
                return (
                  <ChoiceCard
                    key={o.value}
                    role="checkbox"
                    selected={on}
                    onClick={() => set(on ? list.filter((x) => x !== o.value) : [...list, o.value])}
                    label={o.label}
                    description={o.description}
                    indicator={<CheckMark checked={on} />}
                  />
                );
              })}
            </div>
          )}
          {q.type === "text" && (
            <Textarea
              value={typeof value === "string" ? value : ""}
              onChange={(e) => set(e.target.value)}
              placeholder={q.placeholder ?? "Escreva aqui…"}
              aria-label={typeof q.title === "string" ? q.title : undefined}
              invalid={error}
              rows={4}
            />
          )}
        </div>
        {error && <p className="mt-2 text-caption text-red">Responda para continuar.</p>}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button variant="ghost" icon={<ChevronLeft className="size-4" />} disabled={step === 0} onClick={() => setStep(step - 1)}>
          Voltar
        </Button>
        <span className="flex-1" />
        {!q.required && (
          <Button
            variant="ghost"
            onClick={() => {
              const next = { ...answers };
              delete next[q.id];
              setAnswers(next);
              setError(false);
              advance(next);
            }}
          >
            Pular
          </Button>
        )}
        <Button
          variant="primary"
          iconRight={last ? undefined : <ChevronRight className="size-4" />}
          onClick={() => (q.required && empty ? setError(true) : advance(answers))}
        >
          {last ? submitLabel : "Próxima"}
        </Button>
      </div>
    </div>
  );
}
