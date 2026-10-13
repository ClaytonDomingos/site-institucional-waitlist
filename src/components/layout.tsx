import { Moon, Sun } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/format";
import { MARCA } from "@/conteudo/site";
import { IconButton } from "@/components/ui";

/* ---------------------------------------------------------------------------
   Marca e ThemeToggle (o ThemeToggle é igual ao do app).
   Ainda não há logo: a marca é só o nome, em texto (pedido do cliente).
--------------------------------------------------------------------------- */

/** O nome do produto. Com `onClick`, volta ao topo. */
export function Marca({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="focus-ring rounded-tile text-headline font-semibold text-fg" aria-label={`${MARCA}, voltar ao topo`}>
      {MARCA}
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
