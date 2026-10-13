import { ArrowRight, Building2, Luggage } from "lucide-react";
import { MARCA } from "@/conteudo/site";
import { PERFIS, type Perfil } from "@/conteudo/lista-espera";
import { irParaLista } from "@/lib/rota-lista";
import { Frame, IconBox } from "@/components/ui";
import { Container, FUNDO_PAPEL, TituloSecao } from "@/components/base";
import { ListaBeneficios } from "@/components/lista/QuizListaEspera";

/* ---------------------------------------------------------------------------
   Lista de espera (#lista). A inscrição é um quiz, uma pergunta por vez, que
   abre por cima da página em /lista-de-espera (components/lista/QuizListaEspera.tsx).
   Aqui fica a primeira pergunta: escolher o perfil já abre o quiz no ramo certo.

   Os botões das outras seções também abrem o quiz, por irParaLista()
   (lib/rota-lista.ts), às vezes já com o perfil: irParaLista({ perfil: "agencia" }).
--------------------------------------------------------------------------- */

const ICONE: Record<Perfil, typeof Luggage> = { viajante: Luggage, agencia: Building2 };

export function ListaEspera() {
  return (
    <section id="lista" className="relative overflow-hidden border-t border-line py-14 sm:py-20">
      <div aria-hidden className="absolute inset-0 opacity-70" style={FUNDO_PAPEL} />
      <Container className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <TituloSecao titulo="Entre na lista de espera" subtitulo={`O ${MARCA} está quase pronto. Responda algumas perguntas rápidas e seja avisado quando abrir.`} />
          <ListaBeneficios className="mt-6" />
        </div>

        <div className="lg:col-span-7">
          <Frame title="Lista de espera" subtitle="Uma pergunta por vez, leva menos de 1 minuto" footer="Usamos seus dados só para falar do lançamento." className="shadow-dialog">
            <p className="text-title-3 font-semibold text-fg">Para começar, você é…</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PERFIS.map((p) => {
                const Icone = ICONE[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => irParaLista({ perfil: p.id })}
                    className="group focus-ring control flex items-center gap-3 p-4 text-left transition-colors hover:bg-control-hover"
                  >
                    <IconBox size="lg">
                      <Icone />
                    </IconBox>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-fg">{p.rotulo}</span>
                      <span className="mt-0.5 block text-body-2 text-muted">{p.descricao}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-fg" />
                  </button>
                );
              })}
            </div>
          </Frame>
        </div>
      </Container>
    </section>
  );
}
