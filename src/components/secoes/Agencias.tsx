import { BadgeCheck, BellRing, HandCoins, MessageCircle, UsersRound } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { PLANOS_AGENCIA } from "@/conteudo/site";
import { Button } from "@/components/ui";
import { Container, TituloSecao } from "@/components/base";
import { FotoComTela } from "@/components/FotoComTela";
import { MiniEnvioWhatsApp } from "@/components/MiniTelas";
import { irParaLista } from "@/lib/rota-lista";

/* Para agências (B2B): o roteiro com mapa como um plus na venda da viagem. */

const VANTAGENS = [
  { icon: BadgeCheck, titulo: "Sua marca no roteiro", texto: "Logo, contatos e rodapé da agência no PDF e na página do cliente." },
  { icon: MessageCircle, titulo: "Envio pelo WhatsApp", texto: "O cliente recebe o roteiro com mapa num toque, com a mensagem da agência." },
  { icon: UsersRound, titulo: "Nasce da viagem vendida", texto: "Destino, datas, pessoas e hotel já vêm preenchidos a partir do cadastro do cliente." },
  { icon: BellRing, titulo: "Ninguém embarca sem roteiro", texto: "O painel avisa quais clientes viajam nos próximos 30 dias e ainda não receberam." },
  { icon: HandCoins, titulo: "Mais uma receita", texto: "Cobre o roteiro do cliente com um link de pagamento ou entregue como bônus da venda." },
];

export function Agencias() {
  const menor = PLANOS_AGENCIA[0];
  return (
    <section id="agencias" className="py-14 sm:py-20">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:order-2 lg:col-span-6">
          <TituloSecao
            rotulo="Para agências de viagens"
            titulo="Venda a viagem e entregue o roteiro com a sua marca"
            subtitulo="Um plus na venda que o cliente leva no bolso: roteiro dia a dia com mapa, pronto em minutos, sem a sua equipe montar nada à mão."
          />
          <ul className="mt-7 space-y-4">
            {VANTAGENS.map((v) => (
              <li key={v.titulo} className="flex items-start gap-3">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 text-fg shadow-xs">
                  <v.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-body font-semibold text-fg">{v.titulo}</span>
                  <span className="mt-0.5 block text-body-2 text-muted">{v.texto}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 [&_button]:h-11 [&_button]:px-5">
            <Button variant="primary" size="lg" onClick={() => irParaLista({ perfil: "agencia" })} className="max-sm:w-full">
              Quero para minha agência
            </Button>
            <p className="text-body-2 text-muted">
              Planos a partir de <b className="font-semibold text-fg num">{menor.preco}</b>
              {menor.periodo}, sem fidelidade.
            </p>
          </div>
        </div>

        <div className="lg:order-1 lg:col-span-6">
          <FotoComTela src={IMG.reuniaoAgencia} alt="Agente de viagens atendendo um cliente no escritório" lado="direita" altura="baixo" tela={<MiniEnvioWhatsApp />} />
        </div>
      </Container>
    </section>
  );
}
