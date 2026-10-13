import { MapPinned, Moon, Sun } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/format";
import { IconButton } from "@/components/ui";

/* ---------------------------------------------------------------------------
   Peças de marca, iguais às do app (components/layout.tsx): Logo, Marca e
   ThemeToggle.
--------------------------------------------------------------------------- */

/** Marca do Meu Guia: quadrado preto com o pino de mapa. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-tile bg-primary text-primary-fg" style={{ width: size, height: size }}>
      <MapPinned style={{ width: size * 0.56, height: size * 0.56 }} strokeWidth={2.2} />
    </span>
  );
}

/** Logo + nome. Com `onClick`, volta ao topo. */
export function Marca({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="focus-ring inline-flex items-center gap-2 rounded-tile" aria-label="Meu Guia, voltar ao topo">
      <Logo />
      <span className="text-headline font-semibold text-fg">Meu Guia</span>
    </button>
  );
}

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, setTheme, toggleTheme } = useApp();
  if (compact) {
    return (
      <IconButton label={theme === "light" ? "Tema escuro" : "Tema claro"} onClick={toggleTheme}>
        {theme === "light" ? <Moon /> : <Sun />}
      </IconButton>
    );
  }
  return (
    <div className="inline-flex items-center gap-0.5 rounded-tile bg-surface-3 p-[3px]" role="radiogroup" aria-label="Tema">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          onClick={() => setTheme(t)}
          aria-label={t === "light" ? "Tema claro" : "Tema escuro"}
          className={cn(
            "inline-flex size-6.5 items-center justify-center rounded-[5px] border transition-colors duration-150",
            theme === t ? "border-line bg-surface-2 text-fg shadow-xs" : "border-transparent text-muted hover:text-fg",
          )}
        >
          {t === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      ))}
    </div>
  );
}
