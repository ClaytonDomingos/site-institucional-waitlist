import { useEffect, useRef, useState } from "react";
import { Bell, CircleAlert, CircleCheck, MapPinned, MessageCircle, Send, Ticket } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { DESTINOS, MARCA, SLOGAN, TEXTO_GRATIS_COMPLETO } from "@/conteudo/site";
import { DESTINO, entrarNaLista, type Perfil } from "@/lib/lista-espera";
import { emailValido, fmtTelefone, semFormula, telefoneValido } from "@/lib/validar";
import { Button, Field, Frame, Input, Label, Note, SafeImage, Segmented } from "@/components/ui";
import { Container, FUNDO_PAPEL, TituloSecao, rolarPara } from "@/components/base";

/* ---------------------------------------------------------------------------
   Lista de espera (#lista). O formulário grava por lib/lista-espera.ts
   (a API Hono, que grava no Postgres, ou, sem configuração, o localStorage do navegador).

   Outras seções trazem o visitante para cá já com o perfil certo:
   irParaLista({ perfil: "agencia" }) · irParaLista({ focar: "destino" })
--------------------------------------------------------------------------- */

type Abrir = { perfil?: Perfil; focar?: "nome" | "destino" };
const EVENTO_ABRIR = "lista-espera:abrir";

export function irParaLista(opcoes: Abrir = {}) {
  window.dispatchEvent(new CustomEvent<Abrir>(EVENTO_ABRIR, { detail: opcoes }));
  rolarPara("lista");
}

interface Dados {
  nome: string;
  email: string;
  whatsapp: string;
  agencia: string;
  destino: string;
}
type Campo = keyof Dados;
type Erros = Partial<Record<Campo, string>>;

const VAZIO: Dados = { nome: "", email: "", whatsapp: "", agencia: "", destino: "" };

function validar(perfil: Perfil, d: Dados): Erros {
  const e: Erros = {};
  /* mede o texto já limpo, o mesmo que vai ser gravado */
  if ((semFormula(d.nome) ?? "").length < 3) e.nome = "Informe seu nome";
  if (!d.email.trim()) e.email = "Informe seu e-mail";
  else if (!emailValido(d.email)) e.email = "E-mail inválido. Confira se tem @ e o domínio";
  if (perfil === "agencia" && !d.whatsapp) e.whatsapp = "Informe o WhatsApp da agência";
  else if (d.whatsapp && !telefoneValido(d.whatsapp)) e.whatsapp = "WhatsApp inválido. Use (99) 99999-9999";
  if (perfil === "agencia" && (semFormula(d.agencia) ?? "").length < 2) e.agencia = "Informe o nome da agência";
  return e;
}

const BENEFICIOS = [
  { icon: Bell, texto: "Aviso antes de todo mundo, por e-mail e, se quiser, pelo WhatsApp" },
  { icon: Ticket, texto: `${TEXTO_GRATIS_COMPLETO} grátis no cadastro, sem cartão` },
  { icon: MapPinned, texto: "Seu destino entra na fila: os mais pedidos chegam primeiro" },
];

export function ListaEspera() {
  const [perfil, setPerfil] = useState<Perfil>("viajante");
  const [d, setD] = useState<Dados>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  /* os erros só aparecem depois da primeira tentativa de envio e então acompanham a digitação.
     Validar no blur fazia a mensagem empurrar o botão para baixo no meio do clique, e o clique se perdia. */
  const [tentou, setTentou] = useState(false);
  const [armadilha, setArmadilha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [feito, setFeito] = useState<{ perfil: Perfil; dados: Dados } | null>(null);

  /* chamado por irParaLista(): troca o perfil e põe o cursor no campo certo depois da rolagem */
  useEffect(() => {
    const abrir = (ev: Event) => {
      const { perfil: p, focar } = (ev as CustomEvent<Abrir>).detail ?? {};
      if (p) setPerfil(p);
      window.setTimeout(() => document.getElementById(focar === "destino" ? "lista-destino" : "lista-nome")?.focus({ preventScroll: true }), 550);
    };
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  const set = (k: Campo, v: string) => {
    const novo = { ...d, [k]: v };
    setD(novo);
    if (tentou) setErros(validar(perfil, novo));
  };
  const trocarPerfil = (p: Perfil) => {
    setPerfil(p);
    /* WhatsApp e agência mudam de obrigatoriedade com o perfil */
    if (tentou) setErros(validar(p, d));
  };

  const enviar = async () => {
    const e = validar(perfil, d);
    setErros(e);
    setTentou(true);
    setFalha(null);
    if (Object.keys(e).length) {
      document.getElementById(`lista-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    /* robô preencheu o campo escondido: finge que deu certo e não grava nada */
    if (armadilha) {
      setFeito({ perfil, dados: d });
      return;
    }
    setEnviando(true);
    try {
      await entrarNaLista({ perfil, nome: d.nome, email: d.email, whatsapp: d.whatsapp, agencia: d.agencia, destino: d.destino });
      setFeito({ perfil, dados: d });
    } catch (err) {
      setFalha(err instanceof Error ? err.message : "Não foi possível entrar na lista agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  };

  /* depois de "Inscrever outra pessoa", o cursor volta ao nome assim que o formulário reaparece */
  const focarNome = useRef(false);
  useEffect(() => {
    if (feito || !focarNome.current) return;
    focarNome.current = false;
    document.getElementById("lista-nome")?.focus();
  }, [feito]);

  const recomecar = () => {
    focarNome.current = true;
    setFeito(null);
    setD(VAZIO);
    setErros({});
    setTentou(false);
  };

  return (
    <section id="lista" className="relative overflow-hidden border-t border-line py-14 sm:py-20">
      <div aria-hidden className="absolute inset-0 opacity-70" style={FUNDO_PAPEL} />
      <Container className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <TituloSecao titulo="Entre na lista de espera" subtitulo={`O ${MARCA} está quase pronto. Deixe seu contato e seja avisado quando abrir.`} />
          <ul className="mt-6 space-y-3">
            {BENEFICIOS.map((b) => (
              <li key={b.texto} className="flex items-start gap-3 text-body text-fg">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-tile border border-line bg-surface-2 shadow-xs">
                  <b.icon className="size-4" />
                </span>
                <span className="pt-1.5">{b.texto}</span>
              </li>
            ))}
          </ul>
          <SafeImage src={IMG.janelaAviao} alt="Vista da janela do avião, com a asa e o céu ao entardecer" rounded="card" className="mt-8 hidden aspect-[4/3] w-full border border-line lg:block" />
        </div>

        <div className="lg:col-span-7">
          <Frame title="Lista de espera" subtitle="Leva menos de 1 minuto" className="shadow-dialog">
            <div aria-live="polite">
              {feito ? (
                <Confirmacao feito={feito} onRecomecar={recomecar} />
              ) : (
                <form
                  noValidate
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void enviar();
                  }}
                >
                  <div className="space-y-2">
                    <Label>Você é</Label>
                    <Segmented
                      label="Você é"
                      value={perfil}
                      onChange={trocarPerfil}
                      options={[
                        { value: "viajante", label: "Viajante" },
                        { value: "agencia", label: "Agência de viagens" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&_input]:max-sm:h-11 [&_input]:max-sm:text-[16px]">
                    <Field label="Nome" required error={erros.nome}>
                      <Input id="lista-nome" autoComplete="name" placeholder="Nome e sobrenome" value={d.nome} invalid={!!erros.nome} onChange={(e) => set("nome", e.target.value)} />
                    </Field>
                    <Field label="E-mail" required error={erros.email}>
                      <Input
                        id="lista-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="voce@email.com"
                        value={d.email}
                        invalid={!!erros.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </Field>
                    <Field label="WhatsApp" required={perfil === "agencia"} hint={perfil === "viajante" ? "Opcional, para avisarmos por lá também" : undefined} error={erros.whatsapp}>
                      <Input
                        id="lista-whatsapp"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(99) 99999-9999"
                        value={d.whatsapp}
                        invalid={!!erros.whatsapp}
                        onChange={(e) => set("whatsapp", fmtTelefone(e.target.value))}
                      />
                    </Field>
                    {perfil === "agencia" ? (
                      <Field label="Agência" required error={erros.agencia}>
                        <Input id="lista-agencia" autoComplete="organization" placeholder="Nome fantasia" value={d.agencia} invalid={!!erros.agencia} onChange={(e) => set("agencia", e.target.value)} />
                      </Field>
                    ) : (
                      <Field label="Para onde você quer ir?" hint="Opcional. Vale destino que ainda não está na lista">
                        <Input id="lista-destino" list="lista-destinos" autoComplete="off" placeholder="Ex.: Paris, Gramado, Santiago" value={d.destino} onChange={(e) => set("destino", e.target.value)} />
                      </Field>
                    )}
                  </div>
                  <datalist id="lista-destinos">
                    {DESTINOS.map((x) => (
                      <option key={x.id} value={x.nome} />
                    ))}
                  </datalist>

                  {/* armadilha para robôs: invisível, fora da ordem do Tab e do leitor de tela */}
                  <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                    <label>
                      Site da empresa
                      <input type="text" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} />
                    </label>
                  </div>

                  {falha && (
                    <Note tone="red" icon={<CircleAlert />}>
                      {falha}
                    </Note>
                  )}
                  {import.meta.env.DEV && DESTINO === "demonstracao" && (
                    <Note tone="amber" title="Modo demonstração">
                      As inscrições ficam só no localStorage deste navegador. Para gravar no Postgres, rode a API (pnpm dev:api) com o .env.local de docs/LISTA-DE-ESPERA.md.
                    </Note>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-caption text-muted">Usamos seus dados só para falar do lançamento.</p>
                    <Button type="submit" variant="primary" size="lg" loading={enviando} icon={<Send className="size-4" />} className="max-sm:h-11 max-sm:w-full">
                      Entrar na lista
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Frame>
        </div>
      </Container>
    </section>
  );
}

function Confirmacao({ feito, onRecomecar }: { feito: { perfil: Perfil; dados: Dados }; onRecomecar: () => void }) {
  const { perfil, dados } = feito;
  /* mostra o que foi gravado: texto limpo e e-mail em minúsculas */
  const primeiro = (semFormula(dados.nome) ?? "").split(/\s+/)[0];
  const email = dados.email.trim().toLowerCase();
  const convite = encodeURIComponent(`Entrei na lista de espera do ${MARCA}: ${SLOGAN.titulo.toLowerCase()}, com roteiro personalizado, mapa e assistente de viagem. Entre também: ${window.location.origin}`);

  /* e-mail repetido recebe a mesma confirmação: o formulário não revela quem já está na lista */
  const titulo = perfil === "agencia" ? `Recebemos o contato da ${semFormula(dados.agencia)}` : `Você está na lista, ${primeiro}`;
  const texto =
    perfil === "agencia"
      ? `Vamos chamar no WhatsApp ${dados.whatsapp} quando abrirmos para agências, e o aviso também vai para ${email}.`
      : `Vamos avisar em ${email}${dados.whatsapp ? ` e no WhatsApp ${dados.whatsapp}` : ""} quando o ${MARCA} abrir.`;

  return (
    <div className="flex flex-col items-center py-6 text-center animate-pop">
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-lime/20 bg-lime/10 text-lime">
        <CircleCheck className="size-6" />
      </span>
      <p className="mt-3 text-headline font-semibold text-fg">{titulo}</p>
      <p className="mt-1 max-w-sm text-body text-muted">{texto}</p>
      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {perfil === "viajante" && (
          <a
            href={`https://wa.me/?text=${convite}`}
            target="_blank"
            rel="noreferrer"
            className="focus-ring control inline-flex h-9 items-center justify-center gap-1.5 px-4 text-body font-medium text-fg hover:bg-control-hover max-sm:h-11"
          >
            <MessageCircle className="size-4" /> Convidar quem viaja com você
          </a>
        )}
        <Button variant="ghost" size="lg" onClick={onRecomecar} className="max-sm:h-11">
          Inscrever outra pessoa
        </Button>
      </div>
    </div>
  );
}
