import { CalendarSync, LocateFixed, Receipt, SquareCheckBig } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { Container } from "@/components/base";
import { FotoComTela } from "@/components/FotoComTela";
import { MiniProximaParada, MiniReajuste } from "@/components/MiniTelas";

/* ---------------------------------------------------------------------------
   Modo viagem numa faixa com o visual que o app assume nos dias da viagem:
   .dark (tokens escuros só aqui dentro) + data-modo="viagem" (o acento de
   pôr do sol no lugar do primário). Mesma regra do index.css do app.
--------------------------------------------------------------------------- */

const ITENS = [
  { icon: LocateFixed, titulo: "Liga sozinho nos dias da viagem", texto: "Abre no dia de hoje, com o mapa e o ponto azul de onde você está." },
  { icon: SquareCheckBig, titulo: "Visitei ou pular, com um toque", texto: "Acompanhe o dia parada por parada, sem planilha nem papel." },
  { icon: CalendarSync, titulo: "Reajuste automático", texto: "O que ficou para trás entra nos próximos dias, perto de onde você já vai estar. Você vê a prévia antes de aplicar." },
  { icon: Receipt, titulo: "Gastos na hora", texto: "Registre o almoço e compare com o que outros viajantes pagaram ali." },
];

export function ModoViagem() {
  return (
    <section id="modo-viagem" className="dark border-y border-line bg-bg py-16 text-fg sm:py-24" data-modo="viagem">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-2 text-body-2 font-medium text-primary">Modo viagem</p>
          <h2 className="text-[28px] leading-[34px] font-semibold text-fg sm:text-[34px] sm:leading-[40px]">Na rua, o roteiro se ajusta a você</h2>
          <p className="mt-3 max-w-lg text-headline font-normal text-muted">
            Viagem real não sai igual ao planejado. A fila foi longa, a chuva apertou, o almoço demorou. O Meu Guia acompanha o seu dia e reorganiza o resto da viagem.
          </p>
          <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {ITENS.map((it) => (
              <li key={it.titulo} className="flex items-start gap-3">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 text-primary shadow-xs">
                  <it.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-body font-semibold text-fg">{it.titulo}</span>
                  <span className="mt-0.5 block text-body-2 text-muted">{it.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <FotoComTela
          src={IMG.celularMapaNoite}
          alt="Celular com o mapa aberto numa rua à noite"
          aspecto="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]"
          lado="direita"
          altura="baixo"
          className="lg:pl-10"
          tela={<MiniReajuste />}
          extra={
            <div className="absolute top-6 left-3 hidden sm:block lg:left-0">
              <MiniProximaParada />
            </div>
          }
        />
      </Container>
    </section>
  );
}
