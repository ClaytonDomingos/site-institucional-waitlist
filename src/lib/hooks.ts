import { useEffect, type RefObject } from "react";

/* ---------------------------------------------------------------------------
   Hooks das camadas (modal, popover, menus). O kit já usa todos; use também
   quando montar um componente flutuante novo.
--------------------------------------------------------------------------- */

/** Chama `onClose` quando aperta Esc — enquanto `open`. */
export function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

/** Fecha no clique fora de `ref` e no Esc. */
export function useDismiss(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEscape(open, onClose);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, ref, onClose]);
}

/** Trava a rolagem da página enquanto uma camada está aberta. */
export function useScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}
