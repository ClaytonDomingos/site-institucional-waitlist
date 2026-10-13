import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/format";

/* Peças comuns das seções: contêiner, título de seção e o fundo "papel de mapa"
   (as mesmas da landing do app, components/publico/base.tsx). */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}

/** Título de seção (display maior que o das telas internas). `rotulo` só quando diz algo que o título não diz. */
export function TituloSecao({
  rotulo,
  titulo,
  subtitulo,
  className,
}: {
  rotulo?: ReactNode;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {rotulo && <p className="mb-2 text-body-2 font-medium text-muted">{rotulo}</p>}
      <h2 className="text-[28px] leading-[34px] font-semibold text-fg sm:text-[34px] sm:leading-[40px]">{titulo}</h2>
      {subtitulo && <p className="mt-3 text-headline font-normal text-muted">{subtitulo}</p>}
    </div>
  );
}

/** Fundo "papel de mapa" quadriculado. */
export const FUNDO_PAPEL: CSSProperties = {
  backgroundColor: "var(--map-paper)",
  backgroundImage: "linear-gradient(var(--map-grid) 1px, transparent 1px), linear-gradient(90deg, var(--map-grid) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function rolarPara(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
