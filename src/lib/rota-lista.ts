import { useEffect, useSyncExternalStore } from "react";
import type { Perfil } from "@/conteudo/lista-espera";

/* ---------------------------------------------------------------------------
   O quiz da lista de espera tem endereço próprio, /lista-de-espera (como o
   /formulario do site da Upside). Dá para pôr o link direto num anúncio, e o
   Voltar do navegador fecha o quiz. Ele abre por cima da página e mantém a
   query (utm_source…), para a inscrição saber de onde a pessoa veio.

   irParaLista()                                        boas-vindas do quiz
   irParaLista({ perfil: "agencia" })                   já no ramo da agência
   irParaLista({ perfil: "viajante", focar: "destino" }) na pergunta do destino
--------------------------------------------------------------------------- */

export const CAMINHO_LISTA = "/lista-de-espera";

export interface AbrirLista {
  perfil?: Perfil;
  focar?: "destino";
}

const ABRIR = "lista-espera:abrir";
const MUDOU = "lista-espera:rota";

const naLista = () => window.location.pathname.replace(/\/+$/, "") === CAMINHO_LISTA;

export function irParaLista(opcoes: AbrirLista = {}) {
  /* primeiro o aviso (o quiz se prepara), depois o endereço (o quiz aparece): uma renderização só */
  window.dispatchEvent(new CustomEvent<AbrirLista>(ABRIR, { detail: opcoes }));
  if (naLista()) return;
  window.history.pushState({ lista: true }, "", CAMINHO_LISTA + window.location.search);
  window.dispatchEvent(new Event(MUDOU));
}

export function fecharLista() {
  if (!naLista()) return;
  /* abriu por um botão da página: volta no histórico, e o Voltar do navegador continua certo */
  if (window.history.state?.lista) {
    window.history.back();
    return;
  }
  /* entrou direto pelo link: a página inicial toma o lugar do quiz */
  window.history.replaceState(null, "", "/" + window.location.search);
  window.dispatchEvent(new Event(MUDOU));
}

function assinar(avisar: () => void) {
  window.addEventListener("popstate", avisar);
  window.addEventListener(MUDOU, avisar);
  return () => {
    window.removeEventListener("popstate", avisar);
    window.removeEventListener(MUDOU, avisar);
  };
}

/** true enquanto o endereço é /lista-de-espera */
export function useListaAberta(): boolean {
  return useSyncExternalStore(assinar, naLista, () => false);
}

/** chamado a cada irParaLista(), com o perfil e a pergunta pedidos */
export function useAoAbrirLista(fn: (opcoes: AbrirLista) => void) {
  useEffect(() => {
    const ouvir = (e: Event) => fn((e as CustomEvent<AbrirLista>).detail ?? {});
    window.addEventListener(ABRIR, ouvir);
    return () => window.removeEventListener(ABRIR, ouvir);
  }, [fn]);
}
