import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/format";
import { Count } from "./display";

/* ---------------------------------------------------------------------------
   Tabela do ReUI (DataGrid): contêiner com borda e raio 12, cabeçalho em
   fundo muted com texto forte, linhas separadas por borda de 1px e hover cinza.

   <TableShell>
     <TableToolbar title="Clientes" count={48} actions={…} filters={…} />
     <Table plain>
       <thead><tr><Th>Nome</Th>…</tr></thead>
       <tbody><Tr onClick={…}><Td>…</Td></Tr></tbody>
     </Table>
     <TableFooter><Pagination … /></TableFooter>
   </TableShell>
--------------------------------------------------------------------------- */

/** `plain` quando a tabela já está dentro de um TableShell. */
export function Table({ children, className, plain }: { children: ReactNode; className?: string; plain?: boolean }) {
  return (
    <div className={cn("w-full overflow-x-auto scroll-thin", !plain && "rounded-card border border-line bg-card shadow-card", className)}>
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

/** Contêiner com borda para cabeçalho + tabela + rodapé. */
export function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex w-full flex-col overflow-hidden rounded-card border border-line bg-card shadow-card", className)}>{children}</div>;
}

/** Cabeçalho do TableShell: título + contagem, ações à direita, linha de filtros abaixo. */
export function TableToolbar({
  title,
  count,
  actions,
  filters,
}: {
  title?: ReactNode;
  count?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-body font-semibold text-fg">{title}</h3>}
            {count !== undefined && <Count>{count}</Count>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
    </div>
  );
}

export function TableFooter({ children }: { children: ReactNode }) {
  return <div className="px-4 py-3">{children}</div>;
}

export type SortDir = "asc" | "desc";

/**
 * Célula de cabeçalho. Para ordenar, passe `sort` (a direção atual desta
 * coluna, ou null se outra coluna está ordenando) e `onSort`.
 */
export function Th({
  children,
  className,
  sort,
  onSort,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  sort?: SortDir | null;
  onSort?: () => void;
  align?: "left" | "right" | "center";
}) {
  const content = onSort ? (
    <button
      type="button"
      onClick={onSort}
      className={cn("-mx-1.5 inline-flex h-7 items-center gap-1 rounded-[6px] px-1.5 transition-colors hover:bg-surface-hover", sort && "text-fg")}
    >
      {children}
      {sort === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : sort === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted" />
      )}
    </button>
  ) : (
    children
  );
  return (
    <th
      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
      className={cn(
        "h-10 border-y border-line bg-surface px-3 text-body font-medium whitespace-nowrap text-fg",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {content}
    </th>
  );
}

export function Tr({
  children,
  onClick,
  selected,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      aria-selected={selected || undefined}
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-surface",
        selected && "bg-surface-3/60 hover:bg-surface-3",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  className,
  align = "left",
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /** use para impedir que o clique da célula (checkbox, menu) abra a linha */
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td
      onClick={onClick}
      className={cn(
        "h-11 border-b border-line px-3 py-2 align-middle text-body text-fg",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Ordena uma lista por uma chave. Uso: sortBy(rows, "name", "asc") */
export function sortBy<T>(rows: T[], key: keyof T, dir: SortDir): T[] {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    if (typeof x === "number" && typeof y === "number") return (x - y) * m;
    return String(x).localeCompare(String(y), "pt-BR") * m;
  });
}
