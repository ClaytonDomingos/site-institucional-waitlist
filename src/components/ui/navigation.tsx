import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, num } from "@/lib/format";
import { useDismiss } from "@/lib/hooks";
import { Count } from "./display";
import { MenuList, type MenuItem } from "./overlays";

/* ---------------------------------------------------------------------------
   Navegação: segmented, abas, breadcrumbs, paginação, etapas de um fluxo
   (wizard), barra de menus (Menubar), menu do topo com painéis
   (NavigationMenu) e menu lateral secundário (SideNav).
--------------------------------------------------------------------------- */

/** "Semana · Mês · Ano": o TabsList do shadcn — trilho cinza, item ativo em fundo claro com borda fina. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  label,
}: {
  options: Array<{ value: T; label: ReactNode; icon?: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex items-center gap-0.5 rounded-tile bg-surface-3 p-[3px]", className)}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "focus-ring inline-flex items-center gap-1.5 rounded-[5px] border font-medium whitespace-nowrap transition-colors duration-150 [&>svg]:size-4",
              size === "sm" ? "h-6 px-2 text-body-2" : "h-[26px] px-2.5 text-body",
              active ? "border-line bg-surface-2 text-fg shadow-xs" : "border-transparent text-muted hover:text-fg",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Abas sublinhadas, com contagem opcional. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Array<{ value: T; label: ReactNode; count?: number; icon?: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex items-center gap-3 overflow-x-auto border-b border-line scroll-none", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-ring relative -mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2 py-2.5 text-body font-medium transition-colors duration-150 [&>svg]:size-4",
            value === o.value ? "border-primary text-fg" : "border-transparent text-muted hover:text-fg",
          )}
        >
          {o.icon}
          {o.label}
          {o.count !== undefined && <Count>{o.count}</Count>}
        </button>
      ))}
    </div>
  );
}

/** Clientes › Helena Duarte. O último item é a página atual (sem link). */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: ReactNode; onClick?: () => void }>;
  className?: string;
}) {
  return (
    <nav aria-label="Você está em" className={cn("flex flex-wrap items-center gap-1.5 text-body", className)}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={i}>
            {i > 0 && <ChevronRight className="size-3.5 text-faint" aria-hidden />}
            {last || !it.onClick ? (
              <span className={cn(last ? "font-medium text-fg" : "text-muted")} aria-current={last ? "page" : undefined}>
                {it.label}
              </span>
            ) : (
              <button type="button" onClick={it.onClick} className="focus-ring rounded-[4px] text-muted transition-colors hover:text-fg">
                {it.label}
              </button>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Rodapé de tabela: "11–20 de 48" + páginas. */
export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  /* 1 … 4 5 6 … 12 */
  const list: Array<number | "gap"> = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) list.push(p);
    else if (list[list.length - 1] !== "gap") list.push("gap");
  }

  const btn =
    "focus-ring inline-flex h-7 min-w-7 items-center justify-center rounded-tile px-1.5 text-body-2 font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-body-2 text-muted num">
        {num(from)}–{num(to)} de {num(total)}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Página anterior" className={cn(btn, "text-muted hover:bg-surface-hover")} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="size-4" />
        </button>
        {list.map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
              className={cn(btn, "num", p === page ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-hover hover:text-fg")}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" aria-label="Próxima página" className={cn(btn, "text-muted hover:bg-surface-hover")} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Etapas de um fluxo. `current` é o índice da etapa atual (0-based). */
export function Steps({
  steps,
  current,
  onStep,
  orientation = "horizontal",
  className,
}: {
  steps: Array<{ label: ReactNode; description?: ReactNode }>;
  current: number;
  onStep?: (i: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const vertical = orientation === "vertical";
  return (
    <ol className={cn(vertical ? "flex flex-col gap-1" : "flex items-center gap-2", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = !!onStep && i <= current;
        return (
          <Fragment key={i}>
            {!vertical && i > 0 && <span className={cn("h-0.5 min-w-4 flex-1 rounded-full", done || active ? "bg-primary" : "bg-surface-3")} />}
            <li>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStep?.(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "focus-ring flex items-center gap-2 rounded-tile text-left disabled:cursor-default",
                  vertical && "w-full p-2",
                  vertical && active && "tile",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold num",
                    done && "bg-primary text-primary-fg",
                    active && "border-2 border-primary bg-bg text-fg",
                    !done && !active && "border border-line bg-surface-3 text-muted",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-body font-medium whitespace-nowrap", active || done ? "text-fg" : "text-muted")}>{s.label}</span>
                  {vertical && s.description && <span className="block text-body-2 text-muted">{s.description}</span>}
                </span>
              </button>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

/* --------------------------------- Menubar -------------------------------- */

/**
 * Barra de menus de aplicativo ("Arquivo · Editar · Exibir"). Com um menu
 * aberto, passar o mouse nos outros troca de menu; ← → também.
 */
export function Menubar({ menus, className }: { menus: Array<{ label: string; items: MenuItem[] }>; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);
  useDismiss(open !== null, ref, close);

  return (
    <div
      ref={ref}
      role="menubar"
      className={cn("control inline-flex h-9 max-w-full items-center gap-0.5 p-1", className)}
      onKeyDown={(e) => {
        if (open === null) return;
        if (e.key === "ArrowRight") setOpen((open + 1) % menus.length);
        if (e.key === "ArrowLeft") setOpen((open - 1 + menus.length) % menus.length);
      }}
    >
      {menus.map((m, i) => (
        <div key={m.label} className="relative">
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => open !== null && setOpen(i)}
            className={cn(
              "focus-ring h-7 rounded-[5px] px-2.5 text-body font-medium transition-colors",
              open === i ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-hover hover:text-fg",
            )}
          >
            {m.label}
          </button>
          {open === i && (
            <div className="floating absolute top-full left-0 z-40 mt-1.5 w-56 overflow-hidden animate-fade-up">
              <MenuList items={m.items} onPick={close} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Navigation menu ----------------------------- */

export interface NavMenuLink {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
}

export interface NavMenuEntry {
  key: string;
  label: ReactNode;
  /** item simples: navega direto */
  onClick?: () => void;
  /** item com painel: grade de links com ícone e descrição */
  links?: NavMenuLink[];
  /** bloco de destaque à esquerda do painel (novidade, chamada) */
  featured?: ReactNode;
  columns?: 1 | 2;
}

/**
 * Menu do topo de site/portal com painéis grandes. Abre ao passar o mouse
 * (e no clique, para toque); o painel fica sob o menu inteiro.
 */
export function NavigationMenu({ items, active, className }: { items: NavMenuEntry[]; active?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const close = useCallback(() => setOpen(null), []);
  useDismiss(open !== null, ref, close);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hover = (key: string | null, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(key), delay);
  };
  const current = items.find((i) => i.key === open);

  return (
    <nav ref={ref} className={cn("relative", className)} onMouseLeave={() => hover(null, 180)}>
      <ul className="flex flex-wrap items-center gap-0.5">
        {items.map((it) => {
          const on = open === it.key;
          const cls = cn(
            "focus-ring inline-flex h-8 items-center gap-1 rounded-tile px-3 text-body font-medium transition-colors",
            on || active === it.key ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-hover hover:text-fg",
          );
          return (
            <li key={it.key}>
              {it.links ? (
                <button
                  type="button"
                  aria-expanded={on}
                  onClick={() => setOpen(on ? null : it.key)}
                  onMouseEnter={() => hover(it.key, open ? 0 : 120)}
                  className={cls}
                >
                  {it.label}
                  <ChevronDown className={cn("size-4 transition-transform duration-150", on && "rotate-180")} />
                </button>
              ) : (
                <button
                  type="button"
                  aria-current={active === it.key ? "page" : undefined}
                  onClick={() => {
                    setOpen(null);
                    it.onClick?.();
                  }}
                  onMouseEnter={() => hover(null, 120)}
                  className={cls}
                >
                  {it.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {current?.links && (
        <div
          className="absolute top-full left-0 z-40 pt-1.5"
          style={{ width: `min(${current.featured ? 620 : current.columns === 1 ? 320 : 520}px, calc(100vw - 24px))` }}
          onMouseEnter={() => hover(current.key, 0)}
        >
          <div className="floating flex flex-col gap-2 rounded-card p-2 animate-fade-up sm:flex-row">
            {current.featured && <div className="rounded-tile border border-line bg-surface p-3 sm:w-[190px] sm:shrink-0">{current.featured}</div>}
            <ul className={cn("grid flex-1 gap-0.5", current.columns !== 1 && "sm:grid-cols-2")}>
              {current.links.map((l, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(null);
                      l.onClick();
                    }}
                    className="focus-ring flex w-full items-start gap-2.5 rounded-tile p-2.5 text-left transition-colors hover:bg-surface-hover"
                  >
                    {l.icon && <span className="mt-px shrink-0 text-muted [&>svg]:size-4">{l.icon}</span>}
                    <span className="min-w-0">
                      <span className="block text-body font-medium text-fg">{l.label}</span>
                      {l.description && <span className="mt-0.5 block text-body-2 text-muted">{l.description}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

/* --------------------------------- SideNav -------------------------------- */

export interface SideNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  /** abre um grupo com título antes deste item */
  section?: string;
  /** subitens: o item vira um grupo que abre e fecha */
  children?: Array<{ key: string; label: string; count?: number }>;
}

/**
 * Menu vertical com o visual da sidebar do Shell — para navegação secundária
 * dentro de uma tela (configurações, documentação, central de ajuda).
 * Grupos com subitens abrem e fecham; o grupo do item ativo começa aberto.
 */
export function SideNav({
  items,
  value,
  onChange,
  className,
}: {
  items: SideNavItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState<string[]>(() =>
    items.filter((i) => i.children?.some((c) => c.key === value)).map((i) => i.key),
  );
  const toggle = (k: string) => setExpanded((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((it) => {
        const isOpen = expanded.includes(it.key);
        const childActive = it.children?.some((c) => c.key === value);
        const active = value === it.key;
        return (
          <Fragment key={it.key}>
            {it.section && <p className="mt-3 px-2 pb-1 text-caption font-medium text-muted first:mt-0">{it.section}</p>}
            <button
              type="button"
              aria-current={active ? "page" : undefined}
              aria-expanded={it.children ? isOpen : undefined}
              onClick={() => (it.children ? toggle(it.key) : onChange(it.key))}
              className={cn(
                "focus-ring flex h-8 w-full items-center gap-2 rounded-tile px-2 text-left text-body transition-colors duration-150 [&_svg]:size-4",
                active ? "bg-surface-3 font-medium text-fg" : "text-fg hover:bg-surface-hover",
              )}
            >
              {it.icon && <span className={cn("shrink-0", active || childActive ? "text-fg" : "text-muted")}>{it.icon}</span>}
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.count !== undefined && <Count>{it.count}</Count>}
              {it.children && <ChevronRight className={cn("!size-4 shrink-0 text-faint transition-transform duration-150", isOpen && "rotate-90")} />}
            </button>
            {it.children && isOpen && (
              <div className="ml-4 flex flex-col gap-0.5 border-l border-line py-0.5 pl-2">
                {it.children.map((c) => {
                  const on = value === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-current={on ? "page" : undefined}
                      onClick={() => onChange(c.key)}
                      className={cn(
                        "focus-ring flex h-7 w-full items-center justify-between gap-2 rounded-tile px-2 text-left text-body transition-colors",
                        on ? "bg-surface-3 font-medium text-fg" : "text-muted hover:bg-surface-hover hover:text-fg",
                      )}
                    >
                      <span className="truncate">{c.label}</span>
                      {c.count !== undefined && <Count>{c.count}</Count>}
                    </button>
                  );
                })}
              </div>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
