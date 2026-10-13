import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/format";
import { TONE_VAR, type Tone } from "./tone";

/** o Alert do ReUI: borda da cor a 30% e fundo a 4%; o texto segue o da página */
const NOTE: Record<Tone, string> = {
  neutral: "border-line bg-card",
  primary: "border-primary/25 bg-primary/[0.03]",
  blue: "border-blue/30 bg-blue/[0.04]",
  money: "border-money/30 bg-money/[0.04]",
  lime: "border-lime/30 bg-lime/[0.04]",
  amber: "border-amber/30 bg-amber/[0.05]",
  red: "border-red/30 bg-red/[0.04]",
  purple: "border-purple/30 bg-purple/[0.04]",
  cyan: "border-cyan/30 bg-cyan/[0.04]",
  yellow: "border-yellow/30 bg-yellow/[0.05]",
};

/* ---------------------------------------------------------------------------
   Feedback: alerta em bloco, estado vazio, progresso, carregamento.
   (Os avisos flutuantes — toasts — vêm de useApp().toast e são desenhados
   pelo <Toaster /> em components/layout.tsx.)
--------------------------------------------------------------------------- */

/** Aviso em bloco (o Alert do ReUI). O tom pinta a borda, o fundo bem leve e o ícone. */
export function Note({
  tone = "neutral",
  icon,
  title,
  children,
  action,
  onClose,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      role={tone === "red" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-tile border px-3 py-2.5 text-body text-fg",
        NOTE[tone],
        className,
      )}
    >
      {icon && (
        <span className="mt-0.5 shrink-0 [&>svg]:size-4" style={{ color: tone === "neutral" ? "var(--fg)" : TONE_VAR[tone] }}>
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-fg">{title}</p>}
        {children && <div className={cn(title ? "mt-0.5 text-muted" : "text-fg")}>{children}</div>}
        {action && <div className="mt-2 flex flex-wrap gap-1.5">{action}</div>}
      </div>
      {onClose && (
        <button type="button" aria-label="Fechar aviso" onClick={onClose} className="shrink-0 text-muted hover:text-fg">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Estado vazio: tracejado, ícone num IconTile, uma frase e uma ação. */
export function Empty({
  title,
  detail,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-card px-6 py-10 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-tile border border-line bg-surface-2 text-fg shadow-xs [&>svg]:size-5">
          {icon}
        </span>
      )}
      <p className="text-body font-medium text-fg">{title}</p>
      {detail && <p className="mt-1 max-w-sm text-body-2 text-muted">{detail}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Progress({
  value,
  tone = "primary",
  className,
  height = 6,
  label,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: number;
  /** texto acessível, ex.: "Perfil 60% completo" */
  label?: string;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("w-full overflow-hidden rounded-full", className)}
      style={{ height, background: "var(--surface-3)" }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${v}%`, background: TONE_VAR[tone] }}
      />
    </div>
  );
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Carregando"
      className={cn("shrink-0 animate-spin-slow", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Bloco de carregamento. Monte a silhueta do conteúdo com vários deles. */
export function Skeleton({ className, rounded = "tile" }: { className?: string; rounded?: "tile" | "full" | "badge" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer",
        rounded === "tile" && "rounded-tile",
        rounded === "full" && "rounded-full",
        rounded === "badge" && "rounded-badge",
        className,
      )}
    />
  );
}
