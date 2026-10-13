import { DUVIDAS, EMPRESA } from "@/conteudo/site";
import { Accordion, AccordionItem, Card } from "@/components/ui";
import { Container, TituloSecao } from "@/components/base";

/* Dúvidas frequentes (o conteúdo fica em conteudo/site.ts). */

export function Duvidas() {
  return (
    <section id="duvidas" className="border-t border-line py-14 sm:py-20">
      <Container className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <TituloSecao titulo="Dúvidas frequentes" />
          <p className="mt-4 text-body text-muted">
            Não achou a resposta? Escreva para{" "}
            <a href={`mailto:${EMPRESA.email}`} className="text-fg underline underline-offset-4">
              {EMPRESA.email}
            </a>
            .
          </p>
        </div>
        <Card padded={false} className="px-4 py-1 lg:col-span-8">
          <Accordion initial={DUVIDAS[0].id}>
            {DUVIDAS.map((p) => (
              <AccordionItem key={p.id} id={p.id} head={<span className="py-1">{p.q}</span>}>
                <p className="text-body text-muted">{p.a}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </Container>
    </section>
  );
}
