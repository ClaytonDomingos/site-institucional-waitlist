import {
  useId,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Check, ChevronDown, Search, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/format";

/* ---------------------------------------------------------------------------
   Formulários. Todo campo usa a classe `field` (index.css): fundo, borda,
   shadow-xs, raio 8, anel de foco cinza, vermelho com aria-invalid. Altura
   32px (h-8), como os botões.

   <Field label="Nome" hint="Como aparece para o cliente" error={erro}>
     <Input value={v} onChange={(e) => setV(e.target.value)} invalid={!!erro} />
   </Field>
--------------------------------------------------------------------------- */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  action,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-center justify-between gap-3">
        <span className="text-body font-medium text-fg">
          {label}
          {required && <span className="ml-0.5 text-red">*</span>}
        </span>
        {action}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-caption text-red">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-caption text-muted">{hint}</span>
      )}
    </label>
  );
}

export function Input({
  className,
  icon,
  suffix,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  /** ícone lucide à esquerda */
  icon?: ReactNode;
  /** texto ou botão à direita ("kg", "R$", botão de mostrar senha) */
  suffix?: ReactNode;
  invalid?: boolean;
}) {
  if (!icon && !suffix) {
    return <input {...rest} aria-invalid={invalid || undefined} className={cn("field h-8 w-full px-2.5", className)} />;
  }
  return (
    <span className={cn("relative block", className)}>
      {icon && (
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted [&>svg]:size-4">{icon}</span>
      )}
      <input
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn("field h-8 w-full px-2.5", !!icon && "pl-8", !!suffix && "pr-10")}
      />
      {suffix && (
        <span className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center text-body-2 text-muted [&_svg]:size-4">
          {suffix}
        </span>
      )}
    </span>
  );
}

/** Busca com lupa e botão de limpar. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  className,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <Input
      className={className}
      icon={<Search />}
      value={value}
      autoFocus={autoFocus}
      aria-label={placeholder}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      suffix={
        value ? (
          <button type="button" aria-label="Limpar busca" onClick={() => onChange("")} className="text-faint hover:text-fg">
            <X />
          </button>
        ) : undefined
      }
    />
  );
}

export function Textarea({
  className,
  rows = 4,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn("field w-full resize-none px-2.5 py-2", className)}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
  placeholder,
  size = "md",
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  placeholder?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "field w-full cursor-pointer appearance-none py-0 pr-8 pl-2.5",
          size === "sm" ? "h-7 text-body-2" : "h-8",
          !value && "text-faint",
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted" />
    </span>
  );
}

/* ------------------------------- Liga/desliga ------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "focus-ring relative h-5 w-9 shrink-0 rounded-full border border-transparent shadow-xs transition-colors duration-150 disabled:opacity-50",
        checked ? "bg-primary" : "bg-line-strong dark:bg-surface-3",
      )}
    >
      <span
        className={cn(
          "absolute top-px size-4 rounded-full shadow-xs transition-[left] duration-150",
          checked ? "left-[17px] bg-primary-fg" : "left-px bg-bg dark:bg-fg",
        )}
      />
    </button>
  );
}

/** Linha de configuração: título + descrição à esquerda, Switch à direita. */
export function SwitchRow({
  title,
  description,
  checked,
  onChange,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("tile flex items-start justify-between gap-4 px-3 py-2.5", className)}>
      <div className="min-w-0">
        <p className="text-body font-medium text-fg">{title}</p>
        {description && <p className="mt-0.5 text-body-2 text-muted">{description}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={typeof title === "string" ? title : undefined} />
    </div>
  );
}

/** O quadradinho marcado em preto — só o visual. Use dentro de algo clicável (lista, cartão de opção). */
export function CheckMark({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  const on = checked || indeterminate;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] transition-[background-color,border-color] duration-150",
        on ? "border border-primary bg-primary text-primary-fg shadow-xs" : "border border-line-strong bg-control shadow-xs",
      )}
    >
      {indeterminate ? <span className="h-0.5 w-2 rounded-full bg-current" /> : checked && <Check className="size-3" strokeWidth={3} />}
    </span>
  );
}

/** Checkbox do shadcn: quadrado de 16px, marcado em preto. Com `children`, vira linha clicável. */
export function Checkbox({
  checked,
  onChange,
  label,
  indeterminate,
  children,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  /** texto acessível (obrigatório quando não há children) */
  label?: string;
  indeterminate?: boolean;
  children?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="focus-ring flex items-start gap-2.5 rounded-[4px] text-left disabled:opacity-50"
    >
      <span className={cn(!!children && "mt-0.5")}>
        <CheckMark checked={checked} indeterminate={indeterminate} />
      </span>
      {children && (
        <span className="min-w-0 select-none">
          <span className="block text-body text-fg">{children}</span>
          {description && <span className="block text-body-2 text-muted">{description}</span>}
        </span>
      )}
    </button>
  );
}

/**
 * Opção em forma de cartão — o que o RadioGroup `cards` e o questionário
 * usam. `indicator` é o que aparece à direita (bolinha, CheckMark).
 */
export function ChoiceCard({
  selected,
  onClick,
  role = "radio",
  label,
  description,
  icon,
  indicator,
}: {
  selected: boolean;
  onClick: () => void;
  role?: "radio" | "checkbox";
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  indicator?: ReactNode;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "focus-ring relative flex items-start gap-2.5 rounded-tile border p-3 text-left transition-[border-color,background-color,box-shadow] duration-150",
        selected ? "border-primary bg-surface shadow-[0_0_0_1px_var(--primary)]" : "control hover:bg-control-hover",
      )}
    >
      {icon && <span className={cn("mt-px shrink-0 [&>svg]:size-4", selected ? "text-fg" : "text-muted")}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-body font-medium text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-body-2 text-muted">{description}</span>}
      </span>
      {indicator}
    </button>
  );
}

/**
 * Grupo de opções exclusivas. `variant="cards"` desenha cada opção como um
 * tile clicável (o crachá do login, escolha de plano); `list` é o rádio clássico.
 */
export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
  variant = "list",
  columns = 1,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: ReactNode; description?: ReactNode; icon?: ReactNode }>;
  variant?: "list" | "cards";
  columns?: 1 | 2 | 3;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid gap-2",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        if (variant === "cards") {
          return (
            <ChoiceCard
              key={o.value}
              selected={active}
              onClick={() => onChange(o.value)}
              label={o.label}
              description={o.description}
              icon={o.icon}
              indicator={
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full transition-opacity",
                    active ? "bg-primary text-primary-fg opacity-100" : "opacity-0",
                  )}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              }
            />
          );
        }
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="focus-ring flex items-start gap-2.5 rounded-badge text-left"
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
                active ? "border border-primary bg-control shadow-xs" : "border border-line-strong bg-control shadow-xs",
              )}
            >
              {active && <span className="size-2 rounded-full bg-primary" />}
            </span>
            <span className="min-w-0">
              <span className="block text-body text-fg">{o.label}</span>
              {o.description && <span className="block text-body-2 text-muted">{o.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  display,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  display?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-body font-medium text-fg">
          {label}
        </label>
        <span className="text-body font-semibold num text-fg">{display ?? value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--primary)] [&::-moz-range-thumb]:bg-[var(--bg)] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--primary)] [&::-webkit-slider-thumb]:bg-[var(--bg)] [&::-webkit-slider-thumb]:shadow-xs"
        style={{
          background: `linear-gradient(to right, var(--primary) ${pct}%, var(--surface-3) ${pct}%)`,
        }}
      />
    </div>
  );
}

/** Área de arrastar-e-soltar arquivo. Lê o arquivo real (nome/tamanho) — nada sobe para lugar nenhum. */
export function FileDrop({
  onFiles,
  accept,
  multiple = true,
  hint = "PDF, JPG ou PNG até 10 MB",
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={cn(
        "focus-ring flex cursor-pointer flex-col items-center justify-center rounded-tile border border-dashed px-6 py-8 text-center transition-colors",
        over ? "border-primary bg-surface" : "border-line-strong bg-card hover:bg-surface",
      )}
    >
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-tile border border-line bg-surface-2 text-fg shadow-xs">
        <UploadCloud className="size-5" />
      </span>
      <p className="text-body font-medium text-fg">
        Arraste aqui ou <span className="underline underline-offset-4">escolha um arquivo</span>
      </p>
      <p className="mt-0.5 text-caption text-muted">{hint}</p>
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------- Input group ------------------------------ */

/**
 * Campo com pedaços colados: texto fixo antes/depois ("https://", ".com.br",
 * "R$", "kg") em faixa cinza, e um botão dentro, à direita.
 * <InputGroup before="https://" after=".com.br" action={<Button size="sm">Verificar</Button>} />
 */
export function InputGroup({
  before,
  after,
  action,
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  before?: ReactNode;
  after?: ReactNode;
  /** botão (Button size="sm" ou IconButton size="sm") dentro do campo, à direita */
  action?: ReactNode;
  invalid?: boolean;
}) {
  const addon = "flex shrink-0 items-center bg-surface px-2.5 text-body-2 whitespace-nowrap text-muted [&_svg]:size-4";
  return (
    <div className={cn("field flex h-8 w-full items-stretch overflow-hidden", className)}>
      {before && <span className={cn(addon, "border-r border-line")}>{before}</span>}
      <input
        {...rest}
        aria-invalid={invalid || undefined}
        className="min-w-0 flex-1 bg-transparent px-2.5 outline-none"
      />
      {after && <span className={cn(addon, "border-l border-line")}>{after}</span>}
      {action && <span className="flex shrink-0 items-center pr-0.5 pl-1 [&_button]:h-6">{action}</span>}
    </div>
  );
}

/** Rótulo solto, para quando o controle não está dentro de um Field (ao lado de um Switch, em tabelas). */
export function Label({
  children,
  htmlFor,
  required,
  hint,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-body font-medium text-fg", className)}>
      {children}
      {required && <span className="ml-0.5 text-red">*</span>}
      {hint && <span className="block text-body-2 font-normal text-muted">{hint}</span>}
    </label>
  );
}
