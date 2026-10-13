import { useState } from "react";
import { BedDouble, Check, ShieldCheck } from "lucide-react";
import { EXEMPLO } from "@/conteudo/exemplo-paris";
import { IMG, fotoAtracao } from "@/conteudo/imagens";
import { DESTINOS, MARCA, SLOGAN, TEXTO_GRATIS, TOTAL_VERIFICADAS } from "@/conteudo/site";
import { distancia } from "@/lib/texto";
import { cn, num } from "@/lib/format";
import { Badge, Button, Frame, SafeImage } from "@/components/ui";
import { Container, rolarPara } from "@/components/base";
import { MapaExemplo } from "@/components/MapaExemplo";
import { irParaLista } from "./ListaEspera";

/* Hero: o fecho da campanha ("O mundo do seu jeito") centralizado e, embaixo,
   o palco: a foto das viajantes com os números da curadoria e o mapa real do
   roteiro de exemplo de Paris, partindo do hotel, com cada atração do lado
   certo do Sena. */

const ARCO = EXEMPLO.dias[0].paradas.find((p) => p.nome === "Arco do Triunfo")!;
/** "O mundo" + "do seu jeito": a segunda parte sai em cinza */
const [TITULO_A, TITULO_B] = SLOGAN.titulo.split(/ (?=do )/);

export function Hero() {
  const [dia, setDia] = useState<number | "todos">(1);
  const [altura] = useState(() => (window.innerWidth < 640 ? 320 : 420));
  const diaSel = dia === "todos" ? null : EXEMPLO.dias[dia - 1];

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* luz suave no alto, sem padrão nenhum */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--surface-3), transparent 75%)" }}
      />

      <Container className="relative pt-12 pb-14 sm:pt-20 sm:pb-20">
        <div className="mx-auto flex max-w-3xl animate-fade-up flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1 text-body-2 font-medium text-fg shadow-xs">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />
              <span className="relative size-2 rounded-full bg-lime" />
            </span>
            Lista de espera aberta
          </span>

          <h1 className="mt-5 text-[44px] leading-[48px] font-semibold text-balance text-fg sm:text-[64px] sm:leading-[68px] lg:text-[76px] lg:leading-[80px]">
            {TITULO_A} {TITULO_B && <span className="text-muted">{TITULO_B}</span>}
          </h1>
          <p className="mt-5 max-w-2xl text-headline font-normal text-pretty text-muted">
            {SLOGAN.texto} Monte um roteiro com os seus interesses, acompanhe tudo no mapa, mude de ideia sem refazer nada e conte com uma assistente de viagem com IA.
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-2.5 sm:w-auto sm:flex-row [&_button]:h-11 [&_button]:px-5">
            <Button variant="primary" size="lg" onClick={() => irParaLista()} className="max-sm:w-full">
              Entrar na lista de espera
            </Button>
            <Button size="lg" onClick={() => rolarPara("funcionalidades")} className="max-sm:w-full">
              Conhecer as funcionalidades
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-body-2 text-muted">
            {["Aviso antes de todo mundo", `${TEXTO_GRATIS} no cadastro`, "Sem cartão de crédito"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-fg" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* palco: foto + mapa (no celular, o mapa vem primeiro) */}
        <div className="mt-12 grid animate-fade-up grid-cols-1 gap-3 sm:mt-16 lg:grid-cols-12 lg:gap-4" style={{ animationDelay: "120ms" }}>
          <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-card border border-line lg:order-1 lg:col-span-5 lg:aspect-auto">
            <SafeImage src={IMG.viajantesHero} alt="Duas viajantes escolhendo o caminho no mapa, numa rua europeia" eager className="absolute inset-0 h-full w-full" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgb(0 0 0 / 0.72) 0%, rgb(0 0 0 / 0.25) 38%, transparent 60%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 text-solid-fg">
              <p className="inline-flex items-center gap-1.5 text-body-2 font-medium">
                <ShieldCheck className="size-4 shrink-0" aria-hidden /> Curadoria de quem vive de turismo
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-solid-fg/25 pt-4">
                {[
                  { v: num(DESTINOS.length), l: "destinos no lançamento" },
                  { v: num(TOTAL_VERIFICADAS), l: "atrações verificadas" },
                  { v: "25 anos", l: "de turismo" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col-reverse justify-end">
                    <dt className="text-caption opacity-80">{s.l}</dt>
                    <dd className="text-title-2 font-semibold num">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <Frame
            title={EXEMPLO.titulo.split(":")[0]}
            subtitle={`Roteiro de exemplo, montado pelo ${MARCA}`}
            action={
              <Badge tone="blue" size="sm">
                Mapa real
              </Badge>
            }
            padded={false}
            className="order-1 min-w-0 shadow-dialog lg:order-2 lg:col-span-7"
            footer={
              <span className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <BedDouble className="size-4 shrink-0" /> Partida e volta: {EXEMPLO.hospedagem.nome}
                </span>
                {diaSel && (
                  <span className="num">
                    Dia {diaSel.numero}: {diaSel.tema}, {distancia(diaSel.distanciaKm)}
                  </span>
                )}
              </span>
            }
          >
            <div className="flex gap-1.5 overflow-x-auto scroll-none border-b border-line p-2" role="tablist" aria-label="Dia do roteiro">
              {(["todos", ...EXEMPLO.dias.map((d) => d.numero)] as Array<number | "todos">).map((d) => {
                const ativo = dia === d;
                return (
                  <button
                    key={String(d)}
                    type="button"
                    role="tab"
                    aria-selected={ativo}
                    onClick={() => setDia(d)}
                    className={cn(
                      "focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 rounded-tile border px-2.5 text-body-2 font-medium whitespace-nowrap transition-colors",
                      ativo ? "border-primary bg-primary text-primary-fg" : "border-line bg-control text-muted hover:text-fg",
                    )}
                  >
                    {d !== "todos" && <span className="size-2 rounded-full" style={{ background: EXEMPLO.dias[d - 1].cor }} />}
                    {d === "todos" ? "Todos os dias" : `Dia ${d}`}
                  </button>
                );
              })}
            </div>
            <div className="relative p-1.5">
              <MapaExemplo dia={dia} altura={altura} />
              {/* a prova que importa: o Arco do Triunfo do lado certo do rio (acima dos tiles, abaixo dos popups) */}
              <div className="floating pointer-events-none absolute top-4 right-4 z-[500] hidden w-[236px] items-center gap-2.5 p-2 sm:flex">
                <img src={fotoAtracao(ARCO.foto!, 120)} alt="" className="size-10 shrink-0 rounded-[6px] object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-2 font-semibold text-fg">Arco do Triunfo</span>
                  <span className="block text-caption text-muted">Margem norte do Sena, conferido</span>
                </span>
                <ShieldCheck className="size-4 shrink-0 text-blue" aria-hidden />
              </div>
            </div>
          </Frame>
        </div>
      </Container>
    </section>
  );
}
