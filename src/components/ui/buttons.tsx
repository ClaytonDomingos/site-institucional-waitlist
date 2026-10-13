import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";
import { Spinner } from "./feedback";

/* ---------------------------------------------------------------------------
   Botões.

   primary    a ação principal da tela (1 por área). Preto (claro no escuro).
   secondary  o padrão — o "outline" do shadcn: fundo, borda, shadow-xs.
   outline    só a borda, sem fundo nem sombra — sobre faixas cinza.
   ghost      ações discretas em barras e listas.
   money      confirmar algo que gera dinheiro (pagar, faturar).
   danger     destrutivo (excluir, cancelar). Sempre com confirmação.

   Alturas do ReUI: sm 28px, md 32px, lg 36px. Ícones lucide em size-4.
--------------------------------------------------------------------------- */

const VARIANT = {
  primary: "bg-primary text-primary-fg shadow-xs hover:bg-primary-hover",
  money: "bg-money text-solid-fg shadow-xs hover:bg-money/90",
  danger: "bg-red text-solid-fg shadow-xs hover:bg-red/90",
  secondary: "control text-fg hover:bg-control-hover",
  outline: "border border-line text-fg hover:bg-control-hover",
  ghost: "text-fg hover:bg-surface-hover",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  block,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-1.5 rounded-tile font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-150 select-none [&_svg]:shrink-0",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        size === "sm" && "h-7 px-2.5 text-body-2 [&_svg]:size-3.5",
        size === "md" && "h-8 px-3 text-body [&_svg]:size-4",
        size === "lg" && "h-9 px-4 text-body [&_svg]:size-4",
        VARIANT[variant],
        block && "w-full",
        className,
      )}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
}

/** Botão só de ícone. `label` vira aria-label e title — obrigatório. */
export function IconButton({
  children,
  label,
  className,
  variant = "secondary",
  size = "md",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center justify-center rounded-tile text-muted transition-colors duration-150 hover:text-fg disabled:opacity-50",
        size === "sm" && "size-7 [&_svg]:size-3.5",
        size === "md" && "size-8 [&_svg]:size-4",
        size === "lg" && "size-9 [&_svg]:size-4",
        variant === "secondary" ? "control hover:bg-control-hover" : "hover:bg-surface-hover",
        className,
      )}
    >
      {children}
    </button>
  );
}

export interface ButtonGroupItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** texto acessível — obrigatório quando o item é só ícone */
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/** Botões colados lado a lado (barra de ferramentas). O item `active` fica cinza. */
export function ButtonGroup({
  items,
  size = "sm",
  label,
  className,
}: {
  items: ButtonGroupItem[];
  size?: "sm" | "md";
  /** nome do grupo para leitores de tela */
  label?: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("control inline-flex items-stretch", className)}>
      {items.map((it, i) => (
        <button
          key={it.key}
          type="button"
          title={it.title}
          aria-label={it.title}
          aria-pressed={it.active}
          disabled={it.disabled}
          onClick={it.onClick}
          className={cn(
            "focus-ring inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:relative disabled:opacity-50 [&_svg]:size-4",
            size === "sm" ? "h-6.5 text-body-2" : "h-7.5 text-body",
            it.label ? "px-2.5" : size === "sm" ? "w-6.5" : "w-7.5",
            i > 0 && "border-l border-line",
            i === 0 && "rounded-l-[7px]",
            i === items.length - 1 && "rounded-r-[7px]",
            it.active ? "bg-surface-3 text-fg" : "text-muted hover:bg-control-hover hover:text-fg",
          )}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** O "‹ Julho ›": um controle com borda e setas nas pontas. */
export function Stepper({
  label,
  onPrev,
  onNext,
  className,
  prevLabel = "Anterior",
  nextLabel = "Próximo",
}: {
  label: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const arrow = "flex size-6 shrink-0 items-center justify-center rounded-[5px] text-muted transition-colors hover:bg-surface-3 hover:text-fg";
  return (
    <div className={cn("control flex h-8 shrink-0 items-center justify-between gap-1 p-1", className)}>
      <button type="button" aria-label={prevLabel} onClick={onPrev} className={arrow}>
        <ChevronLeft className="size-4" />
      </button>
      <span className="flex-1 px-1 text-center text-body font-medium whitespace-nowrap text-fg">{label}</span>
      <button type="button" aria-label={nextLabel} onClick={onNext} className={arrow}>
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/* --------------------------------- Toggle --------------------------------- */

/**
 * Botão que fica ligado ou desligado (negrito, "Só favoritos", fixar).
 * Só ícone? Passe `label` — vira aria-label e title.
 */
export function Toggle({
  pressed,
  onChange,
  children,
  icon,
  label,
  size = "md",
  variant = "outline",
  disabled,
  className,
}: {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  size?: "sm" | "md";
  variant?: "outline" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(!pressed)}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center justify-center gap-1.5 rounded-tile font-medium whitespace-nowrap transition-colors duration-150 disabled:opacity-50 [&_svg]:size-4",
        size === "sm" ? "h-7 text-body-2" : "h-8 text-body",
        children ? (size === "sm" ? "px-2.5" : "px-3") : size === "sm" ? "w-7" : "w-8",
        variant === "outline" && "control",
        pressed ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
        pressed && variant === "outline" && "border-line-strong",
        !pressed && (variant === "outline" ? "hover:bg-control-hover" : "hover:bg-surface-hover"),
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

type ToggleGroupOption<T extends string> = { value: T; label?: ReactNode; icon?: ReactNode; title?: string; disabled?: boolean };

/**
 * ButtonGroup em que cada botão liga e desliga. `type="multiple"` deixa
 * vários ligados (negrito + itálico); `single` é no máximo um e permite
 * desligar tudo — diferente do Segmented, que sempre tem um escolhido.
 */
export function ToggleGroup<T extends string>(
  props: {
    options: ToggleGroupOption<T>[];
    size?: "sm" | "md";
    label?: string;
    className?: string;
  } & ({ type: "single"; value: T | null; onChange: (v: T | null) => void } | { type: "multiple"; value: T[]; onChange: (v: T[]) => void }),
) {
  const isOn = (v: T) => (props.type === "single" ? props.value === v : props.value.includes(v));
  const flip = (v: T) => {
    if (props.type === "single") props.onChange(props.value === v ? null : v);
    else props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
  };
  return (
    <ButtonGroup
      size={props.size ?? "md"}
      label={props.label}
      className={props.className}
      items={props.options.map((o) => ({ ...o, key: o.value, active: isOn(o.value), onClick: () => flip(o.value) }))}
    />
  );
}
