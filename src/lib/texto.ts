import type { ModoTrecho } from "@/conteudo/exemplo-paris";
import { num } from "./format";

/* Formatadores de texto do roteiro (os mesmos jeitos de escrever do app). */

/** 1,2 km · 850 m */
export function distancia(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${num(km, 1)} km`;
}

/** 12 min · 1 h 05 min */
export function duracao(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")} min` : `${h} h`;
}

export const MODO_TRECHO: Record<ModoTrecho, string> = {
  a_pe: "a pé",
  transporte_publico: "de transporte público",
  taxi_app: "de táxi ou app",
  carro: "de carro",
  trem: "de trem",
};

/** € 22 */
export function euro(v: number): string {
  return `€ ${num(v, Number.isInteger(v) ? 0 : 2)}`;
}
