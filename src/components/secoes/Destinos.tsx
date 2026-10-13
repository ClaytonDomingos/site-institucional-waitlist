import { MapPinPlus, ShieldCheck } from "lucide-react";
import { DESTINOS } from "@/conteudo/site";
import { Badge, Button, Card, SafeImage } from "@/components/ui";
import { Container, TituloSecao } from "@/components/base";
import { irParaLista } from "./ListaEspera";

/* Destinos do lançamento, com a capa e o nº de atrações verificadas. */

export function Destinos() {
  return (
    <section id="destinos" className="border-t border-line bg-surface py-14 sm:py-20">
      <Container>
        <TituloSecao
          titulo={`${DESTINOS.length} destinos prontos no lançamento`}
          subtitulo="Cada cidade só entra depois que as atrações são conferidas uma a uma: coordenada, horário, ingresso e a dica de quem conhece."
        />

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DESTINOS.map((d) => (
            <li key={d.id}>
              <Card padded={false} className="h-full overflow-hidden">
                <div className="relative">
                  <SafeImage src={d.capa} alt={`${d.nome}, ${d.pais}`} className="aspect-[4/3] w-full" />
                  {d.id === "paris" && (
                    <span className="absolute top-2 left-2">
                      <Badge tone="primary" variant="solid" size="sm">
                        Roteiro de exemplo
                      </Badge>
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-body font-semibold text-fg">{d.nome}</p>
                  <p className="truncate text-body-2 text-muted">{d.pais}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-caption font-medium text-blue-fg">
                    <ShieldCheck className="size-3.5 shrink-0" />
                    <span>
                      <span className="num">{d.verificadas}</span> atrações verificadas
                    </span>
                  </p>
                </div>
              </Card>
            </li>
          ))}
          <li className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
            <div className="flex flex-col items-start gap-4 rounded-card border border-dashed border-line-strong p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 text-fg shadow-xs">
                  <MapPinPlus className="size-4" />
                </span>
                <div>
                  <p className="text-body font-semibold text-fg">Seu destino não está aqui?</p>
                  <p className="mt-0.5 text-body-2 text-muted">Conte na lista de espera para onde você vai. Os destinos mais pedidos entram primeiro.</p>
                </div>
              </div>
              <Button onClick={() => irParaLista({ perfil: "viajante", focar: "destino" })} className="max-sm:h-10 max-sm:w-full">
                Sugerir um destino
              </Button>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}
