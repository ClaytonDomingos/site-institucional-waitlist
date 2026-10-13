import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { SafeImage } from "@/components/ui";

/* ---------------------------------------------------------------------------
   Foto do Unsplash com a miniatura de uma tela do app (MiniTelas) por cima.
   No celular, a miniatura vem logo abaixo da foto e sobe 64px sobre ela, para
   a foto continuar visível. No desktop (lg) ela flutua sobre a borda da foto,
   do `lado` escolhido, no meio ou mais embaixo. `extra` recebe outra camada
   posicionada à mão (ex.: a segunda miniatura do modo viagem).
--------------------------------------------------------------------------- */

export function FotoComTela({
  src,
  alt,
  tela,
  lado = "esquerda",
  altura = "meio",
  aspecto = "aspect-[4/3]",
  extra,
  className,
}: {
  src: string;
  alt: string;
  tela: ReactNode;
  /** de que lado da foto a miniatura fica no desktop */
  lado?: "esquerda" | "direita";
  altura?: "meio" | "baixo";
  /** classes aspect-* da foto (podem variar por breakpoint) */
  aspecto?: string;
  extra?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", lado === "esquerda" ? "lg:pl-12" : "lg:pr-12", className)}>
      <SafeImage src={src} alt={alt} rounded="card" className={cn("w-full border border-line", aspecto)} />
      <div
        className={cn(
          "relative z-10 -mt-16 flex px-3 lg:absolute lg:mt-0 lg:px-0",
          lado === "esquerda" ? "justify-start lg:left-0" : "justify-end lg:right-0",
          altura === "meio" ? "lg:top-1/2 lg:-translate-y-1/2" : "lg:bottom-10",
        )}
      >
        {tela}
      </div>
      {extra}
    </div>
  );
}
