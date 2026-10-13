import type { ReactNode } from "react";
import { Bell, Camera, Check, Clock3, ListChecks, Map as MapIcon, Printer, RefreshCw, SlidersHorizontal, Smartphone, Sparkles, UsersRound, Wallet, type LucideIcon } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { FUNCIONALIDADES, MARCA, type IdFuncionalidade } from "@/conteudo/site";
import { cn } from "@/lib/format";
import { Card, Frame, IconBox, type Tone } from "@/components/ui";
import { Container, TituloSecao, rolarPara } from "@/components/base";
import { FotoComTela } from "@/components/FotoComTela";
import { MiniAssistente, MiniCompartilhar, MiniConversa, MiniNoMapa, MiniPersonalizado } from "@/components/MiniTelas";

/* ---------------------------------------------------------------------------
   Funcionalidades: as 6 da campanha (conteudo/site.ts → FUNCIONALIDADES).
   Primeiro um resumo com as 6, que leva a cada uma; depois os destaques
   (foto do Unsplash + miniatura da tela do app), alternando os lados.
   "Mudou de ideia? Tudo bem" fica na faixa escura do modo viagem
   (ModoViagem.tsx), entre as duas partes. No fim, os recursos de apoio.
--------------------------------------------------------------------------- */

const ICONE: Record<IdFuncionalidade, { icon: LucideIcon; tone?: Tone }> = {
  personalizado: { icon: ListChecks },
  mapa: { icon: MapIcon },
  ajustes: { icon: RefreshCw },
  assistente: { icon: Sparkles, tone: "purple" },
  foto: { icon: Camera, tone: "purple" },
  compartilhar: { icon: UsersRound },
};

/** foto e miniatura de cada destaque (o de "ajustes" está em ModoViagem.tsx) */
const VISUAL: Record<Exclude<IdFuncionalidade, "ajustes">, { foto: string; alt: string; tela: ReactNode }> = {
  personalizado: { foto: IMG.viajantesComMapa, alt: "Duas amigas escolhendo o caminho num mapa, numa rua europeia", tela: <MiniPersonalizado /> },
  mapa: { foto: IMG.metroConcorde, alt: "Plataforma da estação Concorde do metrô de Paris", tela: <MiniNoMapa /> },
  assistente: { foto: IMG.cafeParis, alt: "Mesas de um café de esquina em Paris", tela: <MiniConversa /> },
  foto: { foto: IMG.fotoArcoDoTriunfo, alt: "Turista fotografando o Arco do Triunfo com o celular", tela: <MiniAssistente /> },
  compartilhar: { foto: IMG.amigosSelfie, alt: "Três amigos tirando uma selfie numa rua europeia", tela: <MiniCompartilhar /> },
};

const funcionalidade = (id: IdFuncionalidade) => FUNCIONALIDADES.find((f) => f.id === id)!;

function Destaque({ id, invertido }: { id: Exclude<IdFuncionalidade, "ajustes">; invertido?: boolean }) {
  const f = funcionalidade(id);
  const v = VISUAL[id];
  return (
    <div id={id} className="grid scroll-mt-20 grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cn(invertido && "lg:order-2")}>
        <h3 className="text-[26px] leading-[32px] font-semibold text-fg sm:text-[30px] sm:leading-[36px]">{f.titulo}</h3>
        <p className="mt-3 max-w-lg text-headline font-normal text-muted">{f.resumo}</p>
        <ul className="mt-5 space-y-2.5">
          {f.itens.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-body text-fg">
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <FotoComTela src={v.foto} alt={v.alt} tela={v.tela} lado={invertido ? "direita" : "esquerda"} />
    </div>
  );
}

export function Funcionalidades() {
  return (
    <section id="funcionalidades" className="py-14 sm:py-20">
      <Container>
        <TituloSecao
          titulo="Tudo para você ser o seu próprio guia"
          subtitulo={`Do primeiro clique ao último dia de viagem, o ${MARCA} monta, mostra, ajusta e explica o seu roteiro.`}
        />

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONALIDADES.map((f) => {
            const { icon: Icone, tone } = ICONE[f.id];
            return (
              <li key={f.id}>
                <Card onClick={() => rolarPara(f.id)} className="flex h-full items-start gap-3">
                  <IconBox size="lg" tone={tone}>
                    <Icone />
                  </IconBox>
                  <span className="min-w-0">
                    <span className="block text-body font-semibold text-fg">{f.titulo}</span>
                    <span className="mt-0.5 block text-body-2 text-muted">{f.resumo}</span>
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>

        <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
          <Destaque id="personalizado" />
          <Destaque id="mapa" invertido />
        </div>
      </Container>
    </section>
  );
}

const APOIO = [
  { icon: Printer, titulo: "PDF com letra grande", texto: "Para imprimir, com caixas para marcar, o mapa de cada dia e os telefones úteis." },
  { icon: Wallet, titulo: "Quanto se gasta de verdade", texto: "Mediana de café, almoço e jantar registrada por outros viajantes, por orçamento." },
  { icon: Clock3, titulo: "Horários conferidos", texto: "Nada de chegar ao Louvre numa terça: o roteiro respeita os dias de fechamento." },
  { icon: SlidersHorizontal, titulo: "No seu ritmo", texto: "Tranquilo, moderado ou intenso. Para a melhor idade, sem longas caminhadas e escadas." },
  { icon: Bell, titulo: "Avisos na hora certa", texto: "Na véspera da viagem e de manhã, com a primeira parada do dia e a dica para chegar cedo." },
  { icon: Smartphone, titulo: "Instala na tela inicial", texto: "Sem loja de aplicativos: abre como app e funciona com internet fraca." },
];

export function MaisFuncionalidades() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="space-y-20 sm:space-y-28">
          <Destaque id="assistente" />
          <Destaque id="foto" invertido />
          <Destaque id="compartilhar" />
        </div>

        <Frame className="mt-20 sm:mt-28" title="E mais" subtitle="O que faz diferença no meio da viagem" padded={false} panelClassName="overflow-hidden">
          {/* o vão de 1px sobre o fundo bg-line desenha os fios entre os itens, com qualquer nº de colunas */}
          <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {APOIO.map((m) => (
              <li key={m.titulo} className="flex items-start gap-3 bg-surface-2 p-4">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 text-fg shadow-xs">
                  <m.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-body font-semibold text-fg">{m.titulo}</span>
                  <span className="mt-0.5 block text-body-2 text-muted">{m.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </Frame>
      </Container>
    </section>
  );
}
