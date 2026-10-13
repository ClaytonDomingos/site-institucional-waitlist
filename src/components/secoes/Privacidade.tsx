import { useEffect, useState, type ReactNode } from "react";
import { EMPRESA, MARCA } from "@/conteudo/site";
import { Button, Modal } from "@/components/ui";

/* ---------------------------------------------------------------------------
   Política de privacidade da lista de espera, num Modal montado uma vez na
   página. Abra de qualquer lugar com abrirPrivacidade().
   RASCUNHO para revisão jurídica antes de publicar.
--------------------------------------------------------------------------- */

const EVENTO = "privacidade:abrir";

export function abrirPrivacidade() {
  window.dispatchEvent(new Event(EVENTO));
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-body font-semibold text-fg">{titulo}</h3>
      <div className="mt-1 text-body text-muted">{children}</div>
    </div>
  );
}

export function Privacidade() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const abrir = () => setAberto(true);
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  return (
    <Modal
      open={aberto}
      onClose={() => setAberto(false)}
      title="Política de privacidade"
      subtitle={`Lista de espera do ${MARCA} · atualizada em outubro de 2026`}
      width={620}
      footer={
        <Button variant="primary" onClick={() => setAberto(false)}>
          Entendi
        </Button>
      }
    >
      <div className="space-y-4">
        <Bloco titulo="Quem cuida dos seus dados">
          {EMPRESA.nome}, {EMPRESA.endereco}. Fale com a gente em{" "}
          <a href={`mailto:${EMPRESA.email}`} className="text-fg underline underline-offset-4">
            {EMPRESA.email}
          </a>
          .
        </Bloco>
        <Bloco titulo="O que coletamos">
          Nome, e-mail, WhatsApp (opcional para viajantes), nome da agência (para agências), o destino que você quer visitar (opcional) e de qual campanha você
          veio, quando o link tiver essa informação. Nada além do que está no formulário.
        </Bloco>
        <Bloco titulo="Para que usamos">
          Para avisar quando o {MARCA} abrir e mandar novidades do lançamento. Com agências, para o contato comercial. O destino que você indicar ajuda a escolher as
          próximas cidades.
        </Bloco>
        <Bloco titulo="Com base em quê">Seu consentimento, dado ao enviar o formulário (LGPD, art. 7º, I). Você pode retirá-lo quando quiser.</Bloco>
        <Bloco titulo="Com quem compartilhamos">
          Com ninguém para fins comerciais: não vendemos nem cedemos seus dados. Eles ficam num provedor de banco de dados contratado, com acesso restrito à equipe do{" "}
          {MARCA}.
        </Bloco>
        <Bloco titulo="Por quanto tempo">Até 12 meses depois do lançamento, ou até você pedir para sair da lista.</Bloco>
        <Bloco titulo="Seus direitos">
          Saber quais dados temos, corrigir, pedir a exclusão e sair da lista a qualquer momento. Basta escrever para {EMPRESA.email}.
        </Bloco>
      </div>
    </Modal>
  );
}
