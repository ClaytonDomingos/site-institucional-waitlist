import { Check } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { FUNCIONALIDADES } from "@/conteudo/site";
import { Container } from "@/components/base";
import { FotoComTela } from "@/components/FotoComTela";
import { MiniReajuste, MiniReorganizar } from "@/components/MiniTelas";

/* ---------------------------------------------------------------------------
   "Mudou de ideia? Tudo bem" numa faixa com o visual que o app assume nos
   dias da viagem: .dark (tokens escuros só aqui dentro) + data-modo="viagem"
   (o acento de pôr do sol no lugar do primário). Mesma regra do index.css do
   app. O texto vem de FUNCIONALIDADES (conteudo/site.ts).
--------------------------------------------------------------------------- */

const AJUSTES = FUNCIONALIDADES.find((f) => f.id === "ajustes")!;

export function ModoViagem() {
  return (
    <section id="ajustes" className="dark border-y border-line bg-bg py-16 text-fg sm:py-24" data-modo="viagem">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-[28px] leading-[34px] font-semibold text-fg sm:text-[34px] sm:leading-[40px]">{AJUSTES.titulo}</h2>
          <p className="mt-3 max-w-lg text-headline font-normal text-muted">{AJUSTES.resumo}</p>
          <p className="mt-2 max-w-lg text-body text-muted">A fila foi longa, a chuva apertou, o almoço demorou: viagem real não sai igual ao planejado, e o roteiro acompanha.</p>
          <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {AJUSTES.itens.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-body text-fg">
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <FotoComTela
          src={IMG.celularMapaNoite}
          alt="Celular com o mapa aberto numa rua à noite"
          aspecto="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[3/4]"
          lado="direita"
          altura="baixo"
          className="lg:pl-10"
          tela={<MiniReorganizar />}
          extra={
            <div className="absolute top-6 left-3 hidden sm:block lg:-top-6 lg:left-0">
              <MiniReajuste />
            </div>
          }
        />
      </Container>
    </section>
  );
}
