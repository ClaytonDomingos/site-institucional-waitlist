import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { Check, ChevronsUpDown, Copy, Minus, Plus, Search, Star } from "lucide-react";
import { cn, norm } from "@/lib/format";
import { Tag } from "./display";
import { CheckMark } from "./forms";
import { Popover } from "./overlays";

/* ---------------------------------------------------------------------------
   Entradas avançadas — mesma anatomia dos campos (classe `field`), listas
   num painel `floating`.

   Combobox     select com busca (listas longas: pacientes, cidades)
   MultiSelect  vários valores com busca, mostrados como tags
   TagInput     digitar e apertar Enter para criar etiquetas
   NumberInput  número com botões − e +
   PinInput     código de verificação (OTP) em caixinhas
   Rating       estrelas (leitura ou edição)
   CopyInput    valor somente leitura com botão de copiar
--------------------------------------------------------------------------- */

export interface PickerOption {
  value: string;
  label: string;
  description?: string;
  /** avatar, ícone ou bolinha à esquerda */
  leading?: ReactNode;
}

/** Lista com busca e navegação por teclado, usada pelo Combobox e MultiSelect. */
function OptionList({
  options,
  isSelected,
  onPick,
  searchPlaceholder,
  multiple,
}: {
  options: PickerOption[];
  isSelected: (v: string) => boolean;
  onPick: (v: string) => void;
  searchPlaceholder: string;
  multiple?: boolean;
}) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const term = norm(q.trim());
  const hits = options.filter((o) => !term || norm(`${o.label} ${o.description ?? ""}`).includes(term));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(hits.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter" && hits[cursor]) {
      e.preventDefault();
      onPick(hits[cursor].value);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-line px-2.5">
        <Search className="size-4 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
          }}
          onKeyDown={onKey}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-9 flex-1 bg-transparent text-body text-fg outline-none"
        />
      </div>
      <div role="listbox" aria-multiselectable={multiple || undefined} className="max-h-60 overflow-y-auto scroll-thin p-1">
        {hits.length === 0 && <p className="px-2 py-4 text-center text-body-2 text-muted">Nada encontrado.</p>}
        {hits.map((o, i) => {
          const sel = isSelected(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={sel}
              onMouseEnter={() => setCursor(i)}
              onClick={() => onPick(o.value)}
              className={cn("flex w-full items-center gap-2 rounded-badge px-2 py-1.5 text-left transition-colors", i === cursor && "bg-surface-hover")}
            >
              {multiple && <CheckMark checked={sel} />}
              {o.leading && <span className="shrink-0">{o.leading}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body text-fg">{o.label}</span>
                {o.description && <span className="block truncate text-caption text-muted">{o.description}</span>}
              </span>
              {!multiple && sel && <Check className="size-4 shrink-0 text-fg" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecionar…",
  searchPlaceholder = "Buscar…",
  className,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: PickerOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className={cn("w-full", className)}>
      <Popover
        block
        trigger={(open, toggle) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="field flex h-8 w-full items-center gap-2 px-2.5 text-left"
          >
            {current?.leading && <span className="shrink-0">{current.leading}</span>}
            <span className={cn("min-w-0 flex-1 truncate", current ? "font-medium text-fg" : "text-faint")}>{current?.label ?? placeholder}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted" />
          </button>
        )}
      >
        {(close) => (
          <OptionList
            options={options}
            isSelected={(v) => v === value}
            searchPlaceholder={searchPlaceholder}
            onPick={(v) => {
              onChange(v);
              close();
            }}
          />
        )}
      </Popover>
    </div>
  );
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Selecionar…",
  searchPlaceholder = "Buscar…",
  className,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: PickerOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className={cn("w-full", className)}>
      <Popover
        block
        trigger={(open, toggleOpen) => (
          <div
            role="button"
            tabIndex={0}
            onClick={toggleOpen}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleOpen()}
            aria-expanded={open}
            className="field relative flex min-h-8 w-full cursor-pointer flex-wrap items-center gap-1 py-[3px] pr-8 pl-1"
          >
            {value.length === 0 && <span className="px-1 text-faint">{placeholder}</span>}
            {value.map((v) => (
              <span key={v} onClick={(e) => e.stopPropagation()}>
                <Tag onRemove={() => toggle(v)}>{options.find((o) => o.value === v)?.label ?? v}</Tag>
              </span>
            ))}
            <ChevronsUpDown className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted" />
          </div>
        )}
      >
        <OptionList options={options} multiple isSelected={(v) => value.includes(v)} searchPlaceholder={searchPlaceholder} onPick={toggle} />
      </Popover>
    </div>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder = "Digite e aperte Enter",
  suggestions = [],
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const tag = t.trim().replace(/,$/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };
  const open = suggestions.filter((s) => !value.includes(s) && (!draft || norm(s).includes(norm(draft))));
  return (
    <div>
      <div className="field flex min-h-8 w-full flex-wrap items-center gap-1 px-1 py-[3px]">
        {value.map((t) => (
          <Tag key={t} onRemove={() => onChange(value.filter((x) => x !== t))}>
            {t}
          </Tag>
        ))}
        <input
          value={draft}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder={value.length ? "" : placeholder}
          aria-label={placeholder}
          className="h-7 min-w-[120px] flex-1 bg-transparent px-1 outline-none"
        />
      </div>
      {open.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-caption text-faint">Sugestões:</span>
          {open.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-badge border border-dashed border-line-strong px-1.5 py-px text-caption text-muted transition-colors hover:border-ring hover:text-fg"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix,
  className,
  label = "Quantidade",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  label?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const btn =
    "flex size-7 shrink-0 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-surface-3 hover:text-fg disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className={cn("field inline-flex h-8 items-center gap-1 px-0.5", className)}>
      <button type="button" aria-label="Diminuir" className={btn} disabled={value <= min} onClick={() => onChange(clamp(value - step))}>
        <Minus className="size-4" />
      </button>
      <input
        inputMode="decimal"
        aria-label={label}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(",", "."));
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className="w-12 min-w-0 flex-1 bg-transparent text-center font-medium num text-fg outline-none"
      />
      {suffix && <span className="text-body-2 text-muted">{suffix}</span>}
      <button type="button" aria-label="Aumentar" className={btn} disabled={value >= max} onClick={() => onChange(clamp(value + step))}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  invalid?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
    // só dispara quando o código fica completo
  }, [value]);

  const set = (i: number, ch: string) => {
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join("").slice(0, length));
  };

  const onPaste = (e: ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2" onPaste={onPaste}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Dígito ${i + 1}`}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            set(i, d);
            if (d) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !c) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
          }}
          aria-invalid={invalid || undefined}
          className={cn("field size-11 text-center text-title-3 font-semibold num", c && !invalid && "border-line-strong")}
        />
      ))}
    </div>
  );
}

export function Rating({
  value,
  onChange,
  max = 5,
  size = 20,
  showValue,
}: {
  value: number;
  /** sem onChange é somente leitura (aceita meia estrela) */
  onChange?: (v: number) => void;
  max?: number;
  size?: number;
  showValue?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="inline-flex" onMouseLeave={() => setHover(null)} role={onChange ? "radiogroup" : "img"} aria-label={`${value} de ${max}`}>
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.max(0, Math.min(1, shown - i));
          const star = (
            <span className="relative inline-flex" style={{ width: size, height: size }}>
              <Star className="absolute inset-0 text-line-strong" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star style={{ width: size, height: size, color: "var(--chart-yellow)" }} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
          return onChange ? (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={Math.round(value) === i + 1}
              aria-label={`${i + 1} estrela${i ? "s" : ""}`}
              onMouseEnter={() => setHover(i + 1)}
              onClick={() => onChange(i + 1)}
              className="px-px transition-transform hover:scale-110"
            >
              {star}
            </button>
          ) : (
            <span key={i} className="px-px">
              {star}
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-body-2 font-medium num text-fg">{value.toFixed(1).replace(".", ",")}</span>}
    </div>
  );
}

export function CopyInput({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* protótipo: sem permissão de área de transferência, só mostra o feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="field flex h-8 w-full items-center gap-2 pr-0.5 pl-2.5">
      <input readOnly value={value} aria-label={label} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 bg-transparent text-body-2 text-muted outline-none" />
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex h-6.5 shrink-0 items-center gap-1 rounded-[6px] px-2 text-body-2 font-medium transition-colors",
          copied ? "bg-lime/10 text-lime-fg" : "bg-surface-3 text-fg hover:bg-line",
        )}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copiado" : label}
      </button>
    </div>
  );
}
