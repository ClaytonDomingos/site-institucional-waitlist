import { IMG, RETRATO_CLAYTON } from "@/conteudo/imagens";
import { EXEMPLO } from "@/conteudo/exemplo-paris";
import { TOTAL_VERIFICADAS } from "@/conteudo/site";
import { num } from "@/lib/format";
import { Avatar, Card } from "@/components/ui";
import { Container, TituloSecao } from "@/components/base";
import { FotoComTela } from "@/components/FotoComTela";
import { MiniChecklist } from "@/components/MiniTelas";

/* ---------------------------------------------------------------------------
   Curadoria: por que o Meu Guia existe (a IA erra a geografia), quem está
   por trás e como uma atração entra na base. As margens do Sena listadas
   vêm do roteiro de exemplo (calculadas com a geometria real do rio).
--------------------------------------------------------------------------- */

/** atrações do exemplo que todo mundo reconhece, separadas pela margem do Sena */
function margem(lado: "norte" | "sul", nomes: string[]) {
  const doLado = new Set(EXEMPLO.dias.flatMap((d) => d.paradas).filter((p) => p.margem === lado).map((p) => p.nome));
  return nomes.filter((n) => doLado.has(n));
}
const NORTE = margem("norte", ["Arco do Triunfo", "Museu do Louvre", "Basílica de Sacré-Cœur"]);
const SUL = margem("sul", ["Torre Eiffel", "Museu d'Orsay", "Panthéon"]);

export function Curadoria() {
  return (
    <section id="curadoria" className="border-t border-line bg-surface py-14 sm:py-20">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <TituloSecao
            titulo="O mapa que a IA erra, a gente confere"
            subtitulo="Roteiros feitos só por inteligência artificial costumam errar a geografia. Já apareceu Arco do Triunfo do lado errado do Sena. No Meu Guia, cada atração passa por um especialista antes de entrar num roteiro."
          />

          <dl className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="tile p-3">
              <dt className="text-caption font-medium text-muted">Margem norte do Sena</dt>
              <dd className="mt-0.5 text-body-2 text-fg">{NORTE.join(", ")}</dd>
            </div>
            <div className="tile p-3">
              <dt className="text-caption font-medium text-muted">Margem sul do Sena</dt>
              <dd className="mt-0.5 text-body-2 text-fg">{SUL.join(", ")}</dd>
            </div>
          </dl>
          <p className="mt-2 text-caption text-muted">Do roteiro de exemplo de Paris, conferido com a geometria real do rio.</p>

          <Card className="mt-8">
            <div className="flex items-center gap-3">
              <Avatar name="Clayton Domingos" src={RETRATO_CLAYTON} size={48} />
              <div className="min-w-0">
                <p className="text-body font-semibold text-fg">Clayton Domingos</p>
                <p className="text-body-2 text-muted">Fundador do Meu Guia</p>
              </div>
            </div>
            <p className="mt-3 text-body text-fg">
              Agente de viagens há 25 anos. Trabalhou na matriz da CVC, na área comercial, e foi franqueado da rede. Criou o Meu Guia para quem quer viajar por
              conta própria sem abrir mão do cuidado de um agente.
            </p>
            <figure className="mt-3 border-l-2 border-line-strong pl-3">
              <blockquote className="text-body text-fg">“Quem já foi olha e fala que está tudo errado.”</blockquote>
              <figcaption className="mt-1 text-body-2 text-muted">Clayton, sobre um mapa de Paris feito por IA, com o Arco do Triunfo do lado errado do rio</figcaption>
            </figure>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <FotoComTela
            src={IMG.curadorEmCampo}
            alt="Homem grisalho fotografando a fachada de um prédio histórico"
            aspecto="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]"
            altura="baixo"
            tela={<MiniChecklist />}
          />
          <p className="mt-6 text-body text-muted">
            São <b className="font-semibold text-fg num">{num(TOTAL_VERIFICADAS)}</b> atrações conferidas uma a uma: endereço validado no Google Places, horário,
            ingresso, foto e a dica de quem já levou milhares de viajantes. Só atração verificada entra no roteiro.
          </p>
        </div>
      </Container>
    </section>
  );
}
