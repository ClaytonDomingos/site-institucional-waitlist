import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Tone } from "@/components/ui/tone";

/* ---------------------------------------------------------------------------
   Estado transversal de interface (em memória): tema e avisos (toasts).
   Os dados do protótipo ficam nos stores Zustand (src/stores).

   const { toast, theme, toggleTheme } = useApp();
   toast({ title: "Salvo", detail: "As alterações já valem.", tone: "lime" });
   toast({ title: "Parada marcada", action: { label: "Desfazer", onClick }, duration: 5000 });
   (tom padrão: primary · sucesso: lime · dinheiro: money · atenção: amber · erro: red)
--------------------------------------------------------------------------- */

export interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone?: Tone;
  action?: { label: string; onClick: () => void };
  /** ms na tela (padrão 4200) */
  duration?: number;
  /** aparência de notificação push (ícone do app) */
  push?: boolean;
}

type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("proto-theme");
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

/** acesso ao toast fora de componentes (services, stores) */
let toastGlobal: ((t: Omit<Toast, "id">) => void) | null = null;
export function avisar(t: Omit<Toast, "id">) {
  toastGlobal?.(t);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem("proto-theme", theme);
  }, [theme]);

  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++seq.current;
      setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), t.duration ?? 4200);
    },
    [dismissToast],
  );

  useEffect(() => {
    toastGlobal = toast;
    return () => {
      toastGlobal = null;
    };
  }, [toast]);

  const value = useMemo<AppState>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      toasts,
      toast,
      dismissToast,
    }),
    [theme, toasts, toast, dismissToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
