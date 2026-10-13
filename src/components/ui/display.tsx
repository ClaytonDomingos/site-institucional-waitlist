import { createContext, useContext, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn, initials } from "@/lib/format";
import { TONE_SOFT, TONE_SOLID, TONE_VAR, type Tone } from "./tone";

/* ---------------------------------------------------------------------------
   Exibição: badge, variação, chip, tag, avatar, KPI, linha do tempo, acordeão.
--------------------------------------------------------------------------- */

/* --------------------------------- Badge ---------------------------------- */

export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  className,
  dot,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-badge font-medium whitespace-nowrap [&>svg]:size-3",
        size === "sm" ? "h-5 px-1.5 text-caption" : "h-6 px-2 text-body-2",
        variant === "soft" && TONE_SOFT[tone],
        variant === "solid" && cn("border border-transparent", TONE_SOLID[tone]),
        variant === "outline" && "border border-line bg-bg text-fg",
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ background: TONE_VAR[tone] }} />}
      {icon}
      {children}
    </span>
  );
}

/** Badge de variação — o "+14,8%". Lima quando sobe, vermelho quando cai; passe tone="money" se for dinheiro. */
export function Delta({ value, suffix = "%", tone, size = "sm" }: { value: number; suffix?: string; tone?: Tone; size?: "sm" | "md" }) {
  const positive = value >= 0;
  const resolved: Tone = tone ?? (positive ? "lime" : "red");
  return (
    <Badge tone={resolved} size={size} className="num">
      {positive ? "+" : ""}
      {value.toString().replace(".", ",")}
      {suffix}
    </Badge>
  );
}

/** Contagem numa caixinha com borda, ao lado de rótulos (abas, menu, coluna). `active` = dentro de algo preto (chip ligado). */
export function Count({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-badge border px-1 text-caption font-medium num",
        active ? "border-primary-fg/20 bg-primary-fg/15 text-primary-fg" : "border-line bg-bg text-fg",
      )}
    >
      {children}
    </span>
  );
}

/** Bolinha de status com rótulo opcional ("● Online"). */
export function StatusDot({ tone = "neutral", label, pulse }: { tone?: Tone; label?: ReactNode; pulse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-body-2 text-muted">
      <span className="relative flex size-2">
        {pulse && (
          <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: TONE_VAR[tone] }} />
        )}
        <span className="relative size-2 rounded-full" style={{ background: TONE_VAR[tone] }} />
      </span>
      {label}
    </span>
  );
}

/* ---------------------------------- Chip ---------------------------------- */

/** Chip de filtro. Ativo em preto (primário), inativo como controle com borda. */
export function Chip({
  active,
  children,
  onClick,
  tone = "neutral",
  count,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  tone?: Tone;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={cn(
        "focus-ring inline-flex h-7 items-center gap-1.5 rounded-tile border px-2.5 text-body-2 font-medium whitespace-nowrap shadow-xs transition-colors duration-150",
        active ? "border-primary bg-primary text-primary-fg" : "border-line bg-control text-muted hover:bg-control-hover hover:text-fg",
      )}
    >
      {tone !== "neutral" && !active && <span className="size-1.5 rounded-full" style={{ background: TONE_VAR[tone] }} />}
      {children}
      {count !== undefined && <Count active={active}>{count}</Count>}
    </button>
  );
}

/** Etiqueta removível (filtros aplicados, tags de um registro). */
export function Tag({ children, onRemove, tone = "neutral" }: { children: ReactNode; onRemove?: () => void; tone?: Tone }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-badge pr-1 pl-2 text-body-2 font-medium", TONE_SOFT[tone], !onRemove && "pr-2")}>
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remover"
          onClick={onRemove}
          className="inline-flex size-4 items-center justify-center rounded-[4px] opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-line bg-surface px-1 font-sans text-caption font-medium text-muted">
      {children}
    </kbd>
  );
}

/* --------------------------------- Avatar --------------------------------- */

export function Avatar({
  name,
  color,
  size = 32,
  className,
  fg,
  src,
  status,
}: {
  name: string;
  /** fundo das iniciais; sem cor, fica cinza */
  color?: string;
  size?: number;
  className?: string;
  /** cor das iniciais; passe "var(--bg)" quando o fundo for "var(--fg)" */
  fg?: string;
  /** foto; cai nas iniciais se faltar ou se a imagem não carregar */
  src?: string;
  /** bolinha no canto (online, ocupado…) */
  status?: Tone;
}) {
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(src) && !broken;

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className={cn(
          "inline-flex size-full items-center justify-center overflow-hidden rounded-full text-center font-semibold select-none",
          className,
        )}
        style={{
          background: showPhoto ? "var(--avatar-bg)" : (color ?? "var(--avatar-bg)"),
          color: fg ?? (color ? "#ffffff" : "var(--avatar-fg)"),
          fontSize: Math.max(10, Math.round(size * 0.4)),
          lineHeight: 1,
        }}
        aria-label={name}
        role="img"
      >
        {showPhoto ? (
          <img
            src={src}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="size-full object-cover"
          />
        ) : (
          initials(name)
        )}
      </span>
      {status && (
        <span
          className="absolute right-0 bottom-0 rounded-full ring-2 ring-[var(--bg)]"
          style={{ width: Math.max(6, size / 4), height: Math.max(6, size / 4), background: TONE_VAR[status] }}
        />
      )}
    </span>
  );
}

/** Pilha de avatares sobrepostos com "+N". */
export function AvatarGroup({
  people,
  max = 4,
  size = 28,
}: {
  people: Array<{ name: string; src?: string; color?: string }>;
  max?: number;
  size?: number;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span key={p.name + i} className="rounded-full ring-2 ring-[var(--card)]" style={{ marginLeft: i ? -size / 4 : 0 }}>
          <Avatar name={p.name} src={p.src} color={p.color} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-surface-3 text-caption font-semibold text-muted ring-2 ring-[var(--card)]"
          style={{ width: size, height: size, marginLeft: -size / 4 }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

/** Ícone num quadradinho com borda (o IconTile do ReUI) — cabeçalho de KPI, item de lista. */
export function IconBox({ children, tone, size = "md" }: { children: ReactNode; tone?: Tone; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 shadow-xs",
        size === "sm" && "size-7 [&>svg]:size-3.5",
        size === "md" && "size-8 [&>svg]:size-4",
        size === "lg" && "size-10 [&>svg]:size-5",
      )}
      style={{ color: tone && tone !== "neutral" ? TONE_VAR[tone] : "var(--fg)" }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------- KPIs ---------------------------------- */

/**
 * KPI no Frame do ReUI: painel branco com ícone, rótulo, número de 24px e a
 * variação; o `hint` fica na faixa cinza embaixo. Com `onClick`, vira clicável.
 */
export function Stat({
  label,
  value,
  hint,
  icon,
  tone,
  delta,
  action,
  className,
  onClick,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  delta?: ReactNode;
  action?: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const clickable = onClick
    ? {
        onClick,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};
  return (
    <div
      {...clickable}
      className={cn("frame flex min-w-0 flex-col", onClick && "focus-ring cursor-pointer transition-colors hover:border-line-strong", className)}
    >
      <div className="frame-panel flex flex-1 flex-col justify-between gap-3 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <IconBox tone={tone}>{icon}</IconBox>}
            <p className="min-w-0 text-body font-medium text-fg">{label}</p>
          </div>
          {action}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-title-1 font-semibold num whitespace-nowrap text-fg">{value}</span>
          {delta}
        </div>
      </div>
      {/* a faixa de baixo existe mesmo sem hint, para os KPIs da fileira terem a mesma altura */}
      <p className="truncate px-2.5 pt-1.5 pb-1 text-body-2 text-muted">{hint ?? "\u00a0"}</p>
    </div>
  );
}

/** Tile de métrica com quadradinho de cor ("Visitas · 96,4 mil"). */
export function MetricTile({
  color,
  label,
  value,
  className,
}: {
  color: string;
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "tile flex min-w-0 flex-1 flex-col items-start justify-end gap-px px-2.5 py-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
        <span className="text-body-2 whitespace-nowrap text-muted">{label}</span>
      </div>
      <span className="text-body font-medium num whitespace-nowrap text-fg">{value}</span>
    </div>
  );
}

/* ------------------------------ Linha do tempo ---------------------------- */

export function Timeline({
  items,
  className,
}: {
  items: Array<{ id: string; title: ReactNode; detail?: ReactNode; time?: ReactNode; tone?: Tone; icon?: ReactNode }>;
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 && <span className="absolute top-7 bottom-0 left-[13px] w-px bg-line" aria-hidden />}
          <span
            className={cn(
              "relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full [&>svg]:size-3.5",
              TONE_SOFT[it.tone ?? "neutral"],
            )}
          >
            {it.icon ?? <span className="size-1.5 rounded-full bg-current" />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body font-medium text-fg">{it.title}</p>
              {it.time && <span className="shrink-0 text-caption num text-faint">{it.time}</span>}
            </div>
            {it.detail && <p className="mt-0.5 text-body-2 text-muted">{it.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------- Accordion ------------------------------- */

const AccordionCtx = createContext<{ open: string | null; set: (v: string | null) => void } | null>(null);

export function Accordion({ children, initial = null }: { children: ReactNode; initial?: string | null }) {
  const [open, set] = useState<string | null>(initial);
  return <AccordionCtx.Provider value={{ open, set }}>{children}</AccordionCtx.Provider>;
}

export function AccordionItem({ id, head, children }: { id: string; head: ReactNode; children: ReactNode }) {
  const ctx = useContext(AccordionCtx);
  const open = ctx?.open === id;
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => ctx?.set(open ? null : id)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between gap-3 rounded-badge py-3 text-left text-body font-medium text-fg hover:underline"
      >
        {head}
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pb-3 text-body-2 text-muted animate-fade-up">{children}</div>}
    </div>
  );
}
