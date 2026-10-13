import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search, TriangleAlert, X } from "lucide-react";
import { cn, norm } from "@/lib/format";
import { useDismiss, useEscape, useScrollLock } from "@/lib/hooks";
import { Button, IconButton } from "./buttons";
import { Kbd } from "./display";

/* ---------------------------------------------------------------------------
   Camadas por cima da página. Todas têm o mesmo acabamento (classe `dialog`:
   fundo de popover, raio 12, borda de 1px, sombra shadow-dialog); o fundo
   escurece com --overlay. Esc fecha. Renderizam num portal no <body>.

   Modal         formulário curto, confirmação, detalhe rápido
   ConfirmDialog "Excluir 3 clientes?" — sempre antes de ação destrutiva
   SidePanel     detalhe/edição de um registro sem sair da lista
                 (side="left" abre do lado esquerdo)
   BottomSheet   gaveta que sobe de baixo — ações e formulários curtos no celular
   Dropdown      menu de ações (⋯) ou de escolha
   ContextMenu   o mesmo menu, aberto com o botão direito sobre uma área
   Popover       conteúdo livre ancorado num botão (filtros, calendário)
   HoverCard     prévia rica ao passar o mouse (cliente, link, pessoa)
   Tooltip       texto curto no hover/foco
   Command       busca com lista navegável pelo teclado; CommandDialog é o ⌘K
--------------------------------------------------------------------------- */

/** Portal + fundo escuro + Esc + trava de rolagem. `className` posiciona o conteúdo. */
function Layer({ open, onClose, className, children }: { open: boolean; onClose: () => void; className: string; children: ReactNode }) {
  useEscape(open, onClose);
  useScrollLock(open);
  if (!open) return null;
  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex", className)}>
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      {children}
    </div>,
    document.body,
  );
}

/** Cabeçalho das camadas: título, subtítulo e botão de fechar. */
function LayerHead({ title, subtitle, onClose, className }: { title: ReactNode; subtitle?: ReactNode; onClose: () => void; className?: string }) {
  return (
    <header className={cn("flex items-start justify-between gap-3 px-5 py-4", className)}>
      <div className="min-w-0">
        <h2 className="text-headline font-semibold text-fg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-body-2 text-muted">{subtitle}</p>}
      </div>
      <IconButton label="Fechar" variant="ghost" size="sm" onClick={onClose} className="-mt-0.5 -mr-1.5">
        <X />
      </IconButton>
    </header>
  );
}

const FOOTER = "flex flex-wrap justify-end gap-2 border-t border-line bg-surface px-5 py-3";

/* ---------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** botões do rodapé: Cancelar + ação principal */
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <Layer open={open} onClose={onClose} className="items-center justify-center p-4 sm:p-6">
      <div role="dialog" aria-modal="true" className="dialog relative flex max-h-[88vh] w-full flex-col overflow-hidden animate-pop" style={{ maxWidth: width }}>
        <LayerHead title={title} subtitle={subtitle} onClose={onClose} className="border-b border-line" />
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-5">{children}</div>
        {footer && <footer className={FOOTER}>{footer}</footer>}
      </div>
    </Layer>
  );
}

/** Confirmação curta. `danger` pinta o botão de vermelho e mostra o ícone de alerta. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  detail,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  detail?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}) {
  return (
    <Layer open={open} onClose={onClose} className="items-center justify-center p-4">
      <div role="alertdialog" aria-modal="true" className="dialog relative w-full max-w-[400px] p-5 animate-pop">
        {danger && (
          <span className="mb-3 inline-flex size-10 items-center justify-center rounded-tile border border-red/20 bg-red/10 text-red">
            <TriangleAlert className="size-5" />
          </span>
        )}
        <h2 className="text-headline font-semibold text-fg">{title}</h2>
        {detail && <p className="mt-1 text-body text-muted">{detail}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>{cancelLabel}</Button>
          <Button
            variant={danger ? "danger" : "primary"}
            autoFocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Layer>
  );
}

/* ------------------------------- Side panel ------------------------------- */

/** Gaveta lateral para ver/editar um registro sem sair da lista. */
export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 440,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  side?: "left" | "right";
}) {
  return (
    <Layer open={open} onClose={onClose} className={cn("p-2", side === "right" ? "justify-end" : "justify-start")}>
      <aside
        role="dialog"
        aria-modal="true"
        className={cn("dialog relative flex h-full w-full flex-col overflow-hidden", side === "right" ? "animate-slide-in" : "animate-slide-in-left")}
        style={{ maxWidth: width }}
      >
        <LayerHead title={title} subtitle={subtitle} onClose={onClose} className="border-b border-line" />
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-5">{children}</div>
        {footer && <footer className={FOOTER}>{footer}</footer>}
      </aside>
    </Layer>
  );
}

/* ------------------------------ Bottom sheet ------------------------------ */

/**
 * Gaveta que sobe da borda de baixo, com alça. Arrastar a alça para baixo
 * fecha. No desktop fica centralizada, com largura máxima.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(0);
  useEffect(() => {
    if (open) setDrag(0);
  }, [open]);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    start.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) setDrag(Math.max(0, e.clientY - start.current));
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (drag > 90) onClose();
    else setDrag(0);
  };

  return (
    <Layer open={open} onClose={onClose} className="items-end justify-center">
      <div
        role="dialog"
        aria-modal="true"
        className="dialog relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-b-none border-b-0 animate-sheet-up"
        style={{ maxWidth: width, transform: drag ? `translateY(${drag}px)` : undefined, transition: dragging ? "none" : "transform 0.2s" }}
      >
        <div
          className="flex cursor-grab touch-none justify-center pt-2.5 pb-2 active:cursor-grabbing"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-hidden
        >
          <span className="h-1.5 w-10 rounded-full bg-surface-3" />
        </div>
        {title && <LayerHead title={title} subtitle={subtitle} onClose={onClose} className="pt-0" />}
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-5 pb-5">{children}</div>
        {footer && <footer className={cn(FOOTER, "pb-[max(12px,env(safe-area-inset-bottom))]")}>{footer}</footer>}
      </div>
    </Layer>
  );
}

/* --------------------------- Popover e Dropdown --------------------------- */

/**
 * Conteúdo ancorado num gatilho. Fecha no clique fora e no Esc.
 * <Popover trigger={(open, toggle) => <Button onClick={toggle}>Filtros</Button>}>…</Popover>
 */
export function Popover({
  trigger,
  children,
  align = "start",
  side = "bottom",
  width,
  block,
  className,
}: {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end";
  side?: "bottom" | "top";
  width?: number;
  className?: string;
  /** ocupa a largura do contêiner e o painel acompanha a largura do gatilho */
  block?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useDismiss(open, ref, close);

  // empurra o painel para dentro da tela quando ele passaria da borda (celular, coluna da direita)
  useLayoutEffect(() => {
    if (!open || !panel.current) return setShift(0);
    const r = panel.current.getBoundingClientRect();
    const max = document.documentElement.clientWidth - 8;
    setShift(r.right > max ? Math.max(max - r.right, 8 - r.left) : r.left < 8 ? 8 - r.left : 0);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", block ? "flex w-full" : "inline-flex")}>
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div
          ref={panel}
          className={cn(
            "floating absolute z-40 overflow-hidden animate-fade-up",
            side === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
            align === "start" ? "left-0" : "right-0",
            className,
          )}
          style={{ width: width ?? (block ? "100%" : undefined), translate: shift ? `${shift}px 0` : undefined }}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}

export type MenuItem =
  | {
      label: ReactNode;
      icon?: ReactNode;
      onClick: () => void;
      danger?: boolean;
      disabled?: boolean;
      shortcut?: string;
      checked?: boolean;
    }
  | { divider: true }
  | { heading: ReactNode };

/** Menu de ações. Passe o gatilho pronto (geralmente um IconButton com ⋯). */
export function Dropdown({
  trigger,
  items,
  align = "end",
  width = 220,
  side = "bottom",
  block,
}: {
  trigger: ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  width?: number;
  side?: "bottom" | "top";
  /** o gatilho ocupa a largura toda (conta do usuário na sidebar) */
  block?: boolean;
}) {
  return (
    <Popover
      align={align}
      width={width}
      side={side}
      block={block}
      trigger={(open, toggle) => (
        <span onClick={toggle} aria-expanded={open} aria-haspopup="menu" className={block ? "flex w-full" : "inline-flex"}>
          {trigger}
        </span>
      )}
    >
      {(close) => <MenuList items={items} onPick={close} />}
    </Popover>
  );
}

/** A lista de itens de menu — usada pelo Dropdown, ContextMenu e Menubar. */
export function MenuList({ items, onPick }: { items: MenuItem[]; onPick?: () => void }) {
  return (
    <div role="menu" className="p-1">
      {items.map((it, i) => {
        if ("divider" in it) return <div key={i} className="my-1 h-px bg-line" />;
        if ("heading" in it)
          return (
            <p key={i} className="px-2 py-1.5 text-caption font-medium text-muted">
              {it.heading}
            </p>
          );
        return (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            onClick={() => {
              onPick?.();
              it.onClick();
            }}
            className={cn(
              "focus-ring flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-body transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
              it.danger ? "text-red hover:bg-red/10" : "text-fg hover:bg-surface-hover",
            )}
          >
            {it.icon && <span className={cn("shrink-0", it.danger ? "text-red" : "text-muted")}>{it.icon}</span>}
            <span className="min-w-0 flex-1 truncate">{it.label}</span>
            {it.checked && <span className="size-1.5 rounded-full bg-primary" />}
            {it.shortcut && <span className="text-caption text-faint">{it.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Context menu ------------------------------ */

/**
 * Menu do botão direito. Envolve uma área; o menu abre onde o mouse está e
 * nunca sai da tela. No celular, o toque longo dispara o mesmo evento.
 */
export function ContextMenu({
  items,
  children,
  className,
  width = 220,
}: {
  items: MenuItem[];
  children: ReactNode;
  className?: string;
  width?: number;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const menu = useRef<HTMLDivElement>(null);
  const close = () => setPos(null);
  useDismiss(!!pos, menu, close);

  // rolar ou redimensionar a tela fecha o menu
  useEffect(() => {
    if (!pos) return;
    const onAway = () => setPos(null);
    window.addEventListener("resize", onAway);
    window.addEventListener("scroll", onAway, true);
    return () => {
      window.removeEventListener("resize", onAway);
      window.removeEventListener("scroll", onAway, true);
    };
  }, [pos]);

  // encosta na borda da tela em vez de vazar
  useLayoutEffect(() => {
    if (!pos || !menu.current) return;
    const r = menu.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(pos.x, window.innerWidth - r.width - 8));
    const y = Math.max(8, Math.min(pos.y, window.innerHeight - r.height - 8));
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos]);

  return (
    <>
      <div
        className={className}
        onContextMenu={(e) => {
          e.preventDefault();
          // pelo teclado (Shift+F10) não há posição de mouse: abre no canto da área
          if (e.clientX === 0 && e.clientY === 0) {
            const r = e.currentTarget.getBoundingClientRect();
            setPos({ x: r.left + 8, y: r.top + 8 });
          } else setPos({ x: e.clientX, y: e.clientY });
        }}
      >
        {children}
      </div>
      {pos &&
        createPortal(
          <div ref={menu} className="floating fixed z-60 overflow-hidden animate-fade-up" style={{ left: pos.x, top: pos.y, width }}>
            <MenuList items={items} onPick={close} />
          </div>,
          document.body,
        )}
    </>
  );
}

/* ------------------------------- Hover card ------------------------------- */

/**
 * Prévia que abre ao parar o mouse (ou focar) no gatilho e continua aberta
 * enquanto o mouse estiver sobre ela. Só complementa: no celular não há
 * hover, então o gatilho precisa funcionar sozinho.
 */
export function HoverCard({
  trigger,
  children,
  width = 300,
  align = "start",
  side = "bottom",
  openDelay = 350,
  closeDelay = 150,
}: {
  trigger: ReactNode;
  children: ReactNode;
  width?: number;
  align?: "start" | "center" | "end";
  side?: "bottom" | "top";
  openDelay?: number;
  closeDelay?: number;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEscape(open, () => setOpen(false));

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => schedule(true, openDelay)}
      onMouseLeave={() => schedule(false, closeDelay)}
      onFocus={() => schedule(true, 0)}
      onBlur={() => schedule(false, 0)}
    >
      {trigger}
      {open && (
        // o pt/pb faz a ponte entre gatilho e cartão, para o mouse não "cair" no vão
        <span
          className={cn(
            "absolute z-40 block",
            side === "bottom" ? "top-full pt-1.5" : "bottom-full pb-1.5",
            align === "start" && "left-0",
            align === "end" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2",
          )}
          style={{ width: `min(${width}px, calc(100vw - 24px))` }}
        >
          <span className="floating block rounded-card p-4 text-left animate-fade-up">{children}</span>
        </span>
      )}
    </span>
  );
}

/* --------------------------------- Tooltip -------------------------------- */

export function Tooltip({
  text,
  children,
  side = "top",
}: {
  text: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-60 -translate-x-1/2 rounded-[6px] bg-primary px-2 py-1 text-caption font-medium whitespace-nowrap text-primary-fg shadow-dropdown",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          )}
        >
          {text}
        </span>
      )}
    </span>
  );
}

/* --------------------------------- Command -------------------------------- */

export interface CommandItem {
  id: string;
  label: string;
  /** título do grupo em que o item aparece */
  group?: string;
  /** texto cinza ao lado do rótulo; também entra na busca */
  hint?: string;
  /** termos que acham o item sem aparecer na tela */
  keywords?: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * Campo de busca + lista filtrada, navegável com ↑ ↓ e Enter. Solto numa
 * tela (busca de ações, seletor) ou dentro do CommandDialog (o ⌘K).
 */
export function Command({
  items,
  placeholder = "Buscar…",
  emptyText,
  autoFocus,
  onDone,
  maxHeight = 320,
  bare,
  className,
}: {
  items: CommandItem[];
  placeholder?: string;
  emptyText?: (q: string) => ReactNode;
  autoFocus?: boolean;
  /** chamado depois que um item é escolhido (o CommandDialog fecha aqui) */
  onDone?: () => void;
  maxHeight?: number;
  /** sem borda e sombra — quando já está dentro de uma camada */
  bare?: boolean;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  const term = norm(q.trim());
  const hits = items.filter((e) => !term || norm(`${e.label} ${e.hint ?? ""} ${e.keywords ?? ""}`).includes(term));
  const enabled = hits.filter((h) => !h.disabled);
  const groups = [...new Set(hits.map((h) => h.group ?? ""))];
  const active = enabled[Math.min(cursor, enabled.length - 1)];

  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor, q]);

  const pick = (e: CommandItem) => {
    e.onSelect();
    onDone?.();
  };

  return (
    <div className={cn("flex flex-col overflow-hidden", !bare && "rounded-card border border-line bg-surface-2 shadow-card", className)}>
      <div className="flex items-center gap-2.5 border-b border-line px-3">
        <Search className="size-4 shrink-0 text-muted" />
        <input
          autoFocus={autoFocus}
          value={q}
          aria-label={placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => Math.min(enabled.length - 1, c + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => Math.max(0, c - 1));
            } else if (e.key === "Enter" && active) {
              e.preventDefault();
              pick(active);
            }
          }}
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 bg-transparent text-body text-fg outline-none"
        />
        {bare && <Kbd>esc</Kbd>}
      </div>
      <div ref={list} role="listbox" className="overflow-y-auto scroll-thin p-1.5" style={{ maxHeight }}>
        {groups.map((g) => (
          <div key={g || "_"} role="group" aria-label={g || undefined}>
            {g && <p className="px-2 py-1.5 text-caption font-medium text-muted">{g}</p>}
            {hits
              .filter((h) => (h.group ?? "") === g)
              .map((h) => {
                const on = h === active;
                return (
                  <button
                    key={h.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    data-active={on}
                    disabled={h.disabled}
                    onMouseMove={() => !on && !h.disabled && setCursor(enabled.indexOf(h))}
                    onClick={() => pick(h)}
                    className={cn(
                      "flex h-9 w-full items-center gap-2.5 rounded-[6px] px-2 text-left text-body text-fg transition-colors disabled:opacity-50",
                      on && "bg-surface-hover",
                    )}
                  >
                    {h.icon && <span className="shrink-0 text-muted [&>svg]:size-4">{h.icon}</span>}
                    <span className="min-w-0 flex-1 truncate">
                      {h.label}
                      {h.hint && <span className="ml-1.5 text-body-2 text-muted">{h.hint}</span>}
                    </span>
                    {h.shortcut && <Kbd>{h.shortcut}</Kbd>}
                  </button>
                );
              })}
          </div>
        ))}
        {hits.length === 0 && (
          <p className="px-3 py-6 text-center text-body text-muted">{emptyText ? emptyText(q) : `Nada encontrado para “${q}”.`}</p>
        )}
      </div>
    </div>
  );
}

/** O Command numa camada no alto da tela — é o ⌘K do Shell. */
export function CommandDialog({
  open,
  onClose,
  items,
  placeholder = "Buscar tela, cliente, ação…",
}: {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}) {
  return (
    <Layer open={open} onClose={onClose} className="items-start justify-center px-4 pt-[12vh]">
      <div role="dialog" aria-modal="true" className="dialog relative w-full max-w-[560px] overflow-hidden animate-pop">
        <Command bare autoFocus items={items} placeholder={placeholder} onDone={onClose} maxHeight={340} />
      </div>
    </Layer>
  );
}
