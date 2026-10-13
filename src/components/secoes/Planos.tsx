import { useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { PLANOS_AGENCIA, PLANOS_VIAJANTE, PRECO_MAPA_VIRTUAL, TEXTO_GRATIS_COMPLETO } from "@/conteudo/site";
import type { Perfil } from "@/conteudo/lista-espera";
import { cn } from "@/lib/format";
import { PricingCard, Segmented } from "@/components/ui";
import { Container, TituloSecao } from "@/components/base";
import { irParaLista } from "@/lib/rota-lista";

/* Planos previstos para o lançamento (os mesmos do admin do app), para viajantes e agências. */

export function Planos() {
  const [publico, setPublico] = useState<Perfil>("viajante");
  const planos = publico === "viajante" ? PLANOS_VIAJANTE : PLANOS_AGENCIA;

  return (
    <section id="planos" className="border-t border-line py-14 sm:py-20">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <TituloSecao
            titulo="Comece grátis. Pague só se gostar."
            subtitulo={
              publico === "viajante"
                ? `Todo cadastro ganha ${TEXTO_GRATIS_COMPLETO}, sem cartão. Depois, escolha o que combina com o tanto que você viaja.`
                : "Para agências, o plano é mensal e sem fidelidade. Cada roteiro gerado para um cliente usa 1 da cota do mês."
            }
          />
          <Segmented
            label="Planos para"
            value={publico}
            onChange={setPublico}
            options={[
              { value: "viajante", label: "Para viajantes" },
              { value: "agencia", label: "Para agências" },
            ]}
            className="shrink-0 self-start sm:self-auto"
          />
        </div>

        <div className={cn("mt-10 grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2 max-sm:[&_button]:h-11", planos.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {planos.map((p) => (
            <PricingCard
              key={p.id}
              name={p.nome}
              price={p.preco}
              period={p.periodo}
              description={p.descricao}
              features={p.recursos}
              highlighted={p.destaque}
              badge={publico === "viajante" ? "Melhor custo" : "Mais escolhido"}
              cta="Entrar na lista"
              onSelect={() => irParaLista({ perfil: publico })}
            />
          ))}
        </div>

        <p className="mt-6 flex items-start gap-2 text-body-2 text-muted">
          <MapIcon className="mt-0.5 size-4 shrink-0 text-fg" />
          {publico === "viajante"
            ? `Mapa virtual do modo viagem: ${PRECO_MAPA_VIRTUAL} por roteiro, incluso no Anual. Preços previstos para o lançamento.`
            : "Mapa virtual incluso para os clientes nos planos Pro e Rede. Preços previstos para o lançamento."}
        </p>
      </Container>
    </section>
  );
}
