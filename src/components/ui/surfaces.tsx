import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/format";
import { Breadcrumbs } from "./navigation";

/* ---------------------------------------------------------------------------
   Superfícies. A hierarquia visual do sistema inteiro é esta (ReUI/shadcn):

   página branca (bg-bg)
     └ PageHead — título da página
     └ Card — branco, borda de 1px, raio 12, sombra quase invisível, padding 16
         └ Tile / ListRow / classe `tile` — branco com borda, raio 8
             └ conteúdo
     └ Frame — moldura cinza (muted) com borda; dentro, o painel branco
         (frame-panel). Cabeçalho e rodapé ficam na faixa cinza. É a peça-
         assinatura do ReUI: use em KPIs e em blocos que merecem destaque.

   Não coloque Card dentro de Card nem Frame dentro de Frame.
--------------------------------------------------------------------------- */

/** Cabeçalho de toda página: título 20px, subtítulo, ações à direita, breadcrumbs opcionais. */
export function PageHead({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: ReactNode; onClick?: () => void }>;
  className?: string;
}) {
  return (
    <div className={className}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title-2 font-semibold text-fg">{title}</h1>
          {subtitle && <p className="mt-0.5 text-body text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Cartão do ReUI: branco, borda de 1px, raio 12. Com `onClick`, vira clicável (teclado incluso). */
export function Card({
  children,
  className,
  padded = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  /** false tira o padding de 16px (conteúdo que vai até a borda) */
  padded?: boolean;
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
      className={cn(
        "rounded-card border border-line bg-card shadow-card",
        padded && "p-4",
        onClick && "focus-ring cursor-pointer transition-colors duration-150 hover:border-line-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Moldura do ReUI: faixa cinza com borda e, dentro, o painel branco. `title`,
 * `subtitle` e `action` vão na faixa de cima; `footer` na de baixo (texto
 * cinza, link, botões). `padded={false}` tira o padding do painel.
 */
export function Frame({
  children,
  title,
  subtitle,
  action,
  footer,
  padded = true,
  className,
  panelClassName,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
  className?: string;
  panelClassName?: string;
}) {
  return (
    <div className={cn("frame flex flex-col", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-3 pt-2 pb-2.5">
          <div className="min-w-0">
            {title && <h3 className="text-body font-semibold text-fg">{title}</h3>}
            {subtitle && <p className="text-body-2 text-muted">{subtitle}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn("frame-panel flex-1", padded && "p-4", panelClassName)}>{children}</div>
      {footer && <footer className="flex flex-wrap items-center gap-2 px-3 pt-2 pb-1.5 text-body-2 text-muted">{footer}</footer>}
    </div>
  );
}

/** Tile: bloco com borda dentro do cartão, raio 8. É a classe `tile` com padding. */
export function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("tile p-3", className)}>{children}</div>;
}

/**
 * Cabeçalho de cartão: título 14px forte, descrição cinza embaixo, número
 * grande opcional com badge de variação e o controle à direita.
 */
export function CardHead({
  title,
  subtitle,
  action,
  value,
  delta,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  value?: ReactNode;
  delta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col">
        <h3 className="text-body font-semibold text-fg">{title}</h3>
        {subtitle && <p className="text-body-2 text-muted">{subtitle}</p>}
        {value !== undefined && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-title-1 font-semibold num text-fg">{value}</span>
            {delta}
          </div>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

/** Linha divisória. Com `label`, o texto fica no meio ("ou"). */
export function Divider({ label, vertical, className }: { label?: ReactNode; vertical?: boolean; className?: string }) {
  if (vertical) return <div className={cn("w-px self-stretch bg-line", className)} role="separator" aria-orientation="vertical" />;
  if (!label) return <div className={cn("h-px w-full bg-line", className)} role="separator" />;
  return (
    <div className={cn("flex items-center gap-3", className)} role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="text-caption text-faint">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/**
 * Seção de formulário/configuração: título e descrição à esquerda, conteúdo
 * à direita (empilha no mobile). O padrão das páginas de Configurações.
 */
export function Section({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid grid-cols-1 gap-4 py-6 first:pt-0 last:pb-0 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8", className)}>
      <div>
        <h3 className="text-body font-semibold text-fg">{title}</h3>
        {description && <p className="mt-1 text-body-2 text-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Lista de pares rótulo → valor ("Telefone · (11) 9…"). */
export function DescriptionList({
  items,
  columns = 1,
  className,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-3",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-body-2 text-muted">{it.label}</dt>
          <dd className="mt-0.5 truncate text-body font-medium text-fg">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Linha branca de lista dentro de um Card — avatar/ícone, texto, algo à direita. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const body = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-body font-medium text-fg">{title}</span>
        {subtitle && <span className="block truncate text-body-2 text-muted">{subtitle}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-2">{trailing}</span>}
    </>
  );
  const base = "tile flex w-full items-center gap-3 px-3 py-2.5";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "focus-ring transition-colors hover:bg-surface", className)}>
        {body}
      </button>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}

/* ------------------------------ Aspect ratio ------------------------------ */

/** Caixa com proporção fixa (16/9, 4/3, 1). O filho — foto, vídeo, mapa — preenche tudo. */
export function AspectRatio({ ratio = 16 / 9, children, className }: { ratio?: number; children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-tile [&>img]:size-full [&>img]:object-cover", className)} style={{ aspectRatio: ratio }}>
      {children}
    </div>
  );
}

/* ------------------------------- Scroll area ------------------------------ */

/**
 * Área com rolagem própria e barra discreta. As bordas esmaecem quando há
 * mais conteúdo daquele lado (funciona sobre qualquer fundo).
 */
export function ScrollArea({
  children,
  maxHeight,
  height,
  horizontal,
  fade = true,
  label,
  className,
}: {
  children: ReactNode;
  maxHeight?: number | string;
  height?: number | string;
  /** rola na horizontal (linha de cartões, abas longas) */
  horizontal?: boolean;
  fade?: boolean;
  /** nome da região para leitores de tela */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const pos = horizontal ? el.scrollLeft : el.scrollTop;
    const max = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const next = { start: pos <= 1, end: pos >= max - 1 };
    setEdges((e) => (e.start === next.start && e.end === next.end ? e : next));
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [horizontal]);

  const dir = horizontal ? "to right" : "to bottom";
  const mask = fade
    ? `linear-gradient(${dir}, ${edges.start ? "#000" : "transparent"}, #000 24px, #000 calc(100% - 24px), ${edges.end ? "#000" : "transparent"})`
    : undefined;

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      onScroll={measure}
      className={cn(
        "scroll-thin outline-none focus-visible:ring-3 focus-visible:ring-ring/45",
        horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto",
        className,
      )}
      style={{ maxHeight, height, maskImage: mask, WebkitMaskImage: mask }}
    >
      <div className={cn(horizontal && "w-max")}>{children}</div>
    </div>
  );
}

/* -------------------------------- Resizable ------------------------------- */

export interface ResizablePanel {
  key?: string;
  content: ReactNode;
  /** tamanho inicial em % (a soma de todos deve dar 100) */
  defaultSize: number;
  /** tamanho mínimo em % (padrão 10) */
  minSize?: number;
  className?: string;
}

/**
 * Painéis lado a lado (ou empilhados) com divisórias arrastáveis: lista +
 * detalhe, editor + prévia. A divisória também anda com as setas do teclado
 * e volta ao tamanho inicial com duplo clique. Na vertical, dê altura ao
 * contêiner (className="h-80").
 */
export function ResizablePanels({
  panels,
  direction = "horizontal",
  withHandle = true,
  onResize,
  className,
}: {
  panels: ResizablePanel[];
  direction?: "horizontal" | "vertical";
  /** mostra a alça no meio da divisória */
  withHandle?: boolean;
  onResize?: (sizes: number[]) => void;
  className?: string;
}) {
  const horizontal = direction === "horizontal";
  const box = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState(() => panels.map((p) => p.defaultSize));
  const drag = useRef<{ i: number; from: number; start: number[] } | null>(null);
  const [active, setActive] = useState<number | null>(null);

  /* move a divisória i (entre o painel i e o i+1) em `delta` pontos percentuais */
  const shift = (i: number, delta: number, base = sizes) => {
    const pair = base[i] + base[i + 1];
    const minA = panels[i].minSize ?? 10;
    const minB = panels[i + 1].minSize ?? 10;
    const a = Math.min(pair - minB, Math.max(minA, base[i] + delta));
    const next = base.map((s, k) => (k === i ? a : k === i + 1 ? pair - a : s));
    setSizes(next);
    onResize?.(next);
  };

  const onDown = (i: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, from: horizontal ? e.clientX : e.clientY, start: sizes };
    setActive(i);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = box.current;
    if (!d || !el) return;
    const total = horizontal ? el.clientWidth : el.clientHeight;
    const delta = (((horizontal ? e.clientX : e.clientY) - d.from) / total) * 100;
    shift(d.i, delta, d.start);
  };
  const onUp = () => {
    drag.current = null;
    setActive(null);
  };

  return (
    <div ref={box} className={cn("flex overflow-hidden", horizontal ? "flex-row" : "flex-col", className)}>
      {panels.map((p, i) => (
        <Fragment key={p.key ?? i}>
          {i > 0 && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation={horizontal ? "vertical" : "horizontal"}
              aria-valuenow={Math.round(sizes[i - 1])}
              aria-valuemin={panels[i - 1].minSize ?? 10}
              aria-valuemax={100}
              aria-label="Redimensionar painéis"
              onPointerDown={onDown(i - 1)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onDoubleClick={() => shift(i - 1, panels[i - 1].defaultSize - sizes[i - 1])}
              onKeyDown={(e) => {
                const back = horizontal ? "ArrowLeft" : "ArrowUp";
                const fwd = horizontal ? "ArrowRight" : "ArrowDown";
                if (e.key === back || e.key === fwd) {
                  e.preventDefault();
                  shift(i - 1, e.key === fwd ? 5 : -5);
                }
              }}
              className={cn(
                "relative z-10 flex shrink-0 touch-none items-center justify-center outline-none transition-colors",
                horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
                active === i - 1 ? "bg-ring" : "bg-line hover:bg-line-strong focus-visible:bg-ring",
              )}
            >
              {/* área de toque maior que a linha de 1px */}
              <span className={cn("absolute", horizontal ? "-inset-x-2 inset-y-0" : "inset-x-0 -inset-y-2")} />
              {withHandle && (
                <span
                  className={cn(
                    "control relative flex items-center justify-center gap-0.5 rounded-full",
                    horizontal ? "h-6 w-3 flex-col" : "h-3 w-6 flex-row",
                  )}
                  aria-hidden
                >
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-0.5 rounded-full bg-faint" />
                  ))}
                </span>
              )}
            </div>
          )}
          <div className={cn("min-h-0 min-w-0 overflow-auto scroll-thin", p.className)} style={{ flex: `${sizes[i]} 1 0px` }}>
            {p.content}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
