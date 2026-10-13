import { useState } from "react";
import { ImageOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

/* ---------------------------------------------------------------------------
   SafeImage — foto com skeleton enquanto carrega e, se falhar em runtime,
   um fallback visual (ícone lucide + nome) no lugar da imagem quebrada.

   <SafeImage src={a.fotoUrl} alt={a.nome} className="h-40 w-full rounded-tile" />
--------------------------------------------------------------------------- */

export function SafeImage({
  src,
  alt,
  className,
  icon: Icon = ImageOff,
  rounded,
  fallbackLabel,
  imgClassName,
  eager,
}: {
  src?: string;
  alt: string;
  className?: string;
  icon?: LucideIcon;
  rounded?: "full" | "tile" | "card";
  /** texto do fallback (padrão: o alt) */
  fallbackLabel?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">(src ? "carregando" : "erro");
  const raio = rounded === "full" ? "rounded-full" : rounded === "card" ? "rounded-card" : rounded === "tile" ? "rounded-tile" : "";
  return (
    <span className={cn("relative block overflow-hidden bg-surface-3", raio, className)}>
      {estado === "carregando" && <span aria-hidden className="absolute inset-0 animate-shimmer" />}
      {estado === "erro" ? (
        <span role="img" aria-label={alt} className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-muted">
          <Icon className="size-5 shrink-0" />
          {rounded !== "full" && <span className="line-clamp-2 text-caption">{fallbackLabel ?? alt}</span>}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setEstado("ok")}
          onError={() => setEstado("erro")}
          className={cn("h-full w-full object-cover transition-opacity duration-300", estado === "ok" ? "opacity-100" : "opacity-0", imgClassName)}
        />
      )}
    </span>
  );
}
