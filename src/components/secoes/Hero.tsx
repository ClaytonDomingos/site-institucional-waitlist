import { useState } from "react";
import { BedDouble, Check, ShieldCheck } from "lucide-react";
import { EXEMPLO } from "@/conteudo/exemplo-paris";
import { fotoAtracao } from "@/conteudo/imagens";
import { DESTINOS, ROTEIROS_GRATIS, TOTAL_VERIFICADAS } from "@/conteudo/site";
import { distancia } from "@/lib/texto";
import { cn, num } from "@/lib/format";
import { Badge, Button, Frame } from "@/components/ui";
import { Container, FUNDO_PAPEL, rolarPara } from "@/components/base";
import { MapaExemplo } from "@/components/MapaExemplo";
import { irParaLista } from "./ListaEspera";

/* Hero: a promessa e, ao lado, o que o Meu Guia tem de mais seu — o mapa
   real do roteiro de exemplo de Paris, partindo do hotel, com cada atração
   do lado certo do Sena. */

const ARCO = EXEMPLO.dias[0].paradas.find((p) => p.nome === "Arco do Triunfo")!;

export function Hero() {
  const [dia, setDia] = useState<number | "todos">(1);
  const [altura] = useState(() => (window.innerWidth < 640 ? 340 : 440));
  const diaSel = dia === "todos" ? null : EXEMPLO.dias[dia - 1];

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ ...FUNDO_PAPEL, maskImage: "linear-gradient(to bottom, black 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)" }}
      />
      <Container className="relative grid grid-cols-1 items-center gap-10 pt-8 pb-14 sm:pt-14 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-badge border border-line bg-bg px-2 py-1 text-body-2 font-medium text-fg shadow-xs">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />
              <span className="relative size-2 rounded-full bg-lime" />
            </span>
            Lista de espera aberta
          </span>
          <h1 className="mt-4 text-[34px] leading-[40px] font-semibold text-fg sm:text-[46px] sm:leading-[52px] lg:text-[50px] lg:leading-[56px]">
            Seu roteiro de viagem pronto, com mapa correto, partindo do seu hotel
          </h1>
          <p className="mt-5 max-w-xl text-headline font-normal text-muted">
            Atrações conferidas por um agente de viagens com 25 anos de turismo, organizadas em dias a partir de onde você vai dormir. Com o caminho de cada trecho, PDF
            com letra grande e um modo viagem que reajusta o roteiro quando o dia não sai como planejado.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row [&_button]:h-11 [&_button]:px-5">
            <Button variant="primary" size="lg" onClick={() => irParaLista()} className="max-sm:w-full">
              Entrar na lista de espera
            </Button>
            <Button size="lg" onClick={() => rolarPara("funcionalidades")} className="max-sm:w-full">
              Conhecer as funcionalidades
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-body-2 text-muted">
            {["Aviso antes de todo mundo", `${ROTEIROS_GRATIS} roteiros grátis no cadastro`, "Sem cartão de crédito"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-fg" aria-hidden /> {t}
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid max-w-md grid-cols-3 divide-x divide-line border-y border-line py-3">
            {[
              { v: num(DESTINOS.length), l: "destinos no lançamento" },
              { v: num(TOTAL_VERIFICADAS), l: "atrações verificadas" },
              { v: "25 anos", l: "de turismo na curadoria" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col-reverse justify-end px-3 first:pl-0">
                <dt className="text-caption text-muted">{s.l}</dt>
                <dd className="text-title-2 font-semibold num text-fg">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <Frame
            title={EXEMPLO.titulo.split(":")[0]}
            subtitle="Roteiro de exemplo, montado pelo Meu Guia"
            action={
              <Badge tone="blue" size="sm">
                Mapa real
              </Badge>
            }
            padded={false}
            className="shadow-dialog"
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
