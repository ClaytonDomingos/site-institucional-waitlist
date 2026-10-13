import { useCallback, useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Bell, Check, ChevronLeft, CircleAlert, CircleCheck, MapPinned, MessageCircle, Send, Ticket, X } from "lucide-react";
import { IMG } from "@/conteudo/imagens";
import { MARCA, SLOGAN, TEXTO_GRATIS_COMPLETO } from "@/conteudo/site";
import { opcional, perguntasDe, texto, type IdPergunta, type Pergunta, type Respostas } from "@/conteudo/lista-espera";
import { DESTINO, entrarNaLista } from "@/lib/lista-espera";
import { fecharLista, useAoAbrirLista, type AbrirLista } from "@/lib/rota-lista";
import { emailValido, fmtTelefone, semFormula, telefoneValido } from "@/lib/validar";
import { useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/format";
import { Badge, Button, CheckMark, ChoiceCard, Chip, IconBox, IconButton, Kbd, Note, Progress, SafeImage } from "@/components/ui";

/* ---------------------------------------------------------------------------
   Quiz da lista de espera: uma pergunta por tela, como o /formulario do site
   da Upside. Abre por cima da página em /lista-de-espera (lib/rota-lista.ts):
   boas-vindas → perguntas (conteudo/lista-espera.ts) → confirmação.

   Escolha única avança sozinha; texto avança com Enter (ou com o "Seguinte"
   do teclado do celular). No computador, as letras A, B, C… escolhem a opção.
   Fechar não perde as respostas: abrir de novo continua de onde parou.
   O envio é o de lib/lista-espera.ts (API Hono → Postgres; sem API, o
   localStorage do modo demonstração).
--------------------------------------------------------------------------- */

const BENEFICIOS = [
  { icon: Bell, texto: "Aviso antes de todo mundo, por e-mail e, se quiser, pelo WhatsApp" },
  { icon: Ticket, texto: `${TEXTO_GRATIS_COMPLETO} grátis no cadastro, sem cartão` },
  { icon: MapPinned, texto: "Seu destino entra na fila: os mais pedidos chegam primeiro" },
];

/** o que quem entra na lista ganha (na seção #lista e nas boas-vindas do quiz) */
export function ListaBeneficios({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {BENEFICIOS.map((b) => (
        <li key={b.texto} className="flex items-start gap-3 text-body text-fg">
          <IconBox>
            <b.icon />
          </IconBox>
          <span className="pt-1.5">{b.texto}</span>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- estado --------------------------------- */

interface Estado {
  fase: "boas-vindas" | "pergunta" | "fim";
  /** a pergunta na tela */
  id: IdPergunta;
  respostas: Respostas;
  /** 1 avançou, -1 voltou: a pergunta nova entra por baixo ou por cima */
  direcao: 1 | -1;
  /** o que falta na pergunta atual (aparece ao tentar avançar) */
  erro: string | null;
  enviando: boolean;
  /** o envio falhou: o aviso fica na última pergunta, que tenta de novo */
  falha: string | null;
}

const NOVO: Estado = { fase: "boas-vindas", id: "perfil", respostas: {}, direcao: 1, erro: null, enviando: false, falha: null };

type Acao =
  | { tipo: "comecar" }
  | { tipo: "abrir"; opcoes: AbrirLista }
  | { tipo: "responder"; id: IdPergunta; valor: string | string[] }
  | { tipo: "avancar"; de: IdPergunta }
  | { tipo: "voltar" }
  | { tipo: "enviado" }
  | { tipo: "falhou"; mensagem: string }
  | { tipo: "recomecar" };

function validar(p: Pergunta, r: Respostas): string | null {
  const v = r[p.id];
  const vazio = v === undefined || (Array.isArray(v) ? v.length === 0 : !v.trim());
  switch (p.tipo) {
    case "escolha":
      return vazio ? p.erro : null;
    case "varias":
      return null;
    case "texto":
      if (vazio) return opcional(p, r) ? null : (p.erro ?? null);
      /* mede o texto já limpo, o mesmo que vai ser gravado */
      return (semFormula(v as string) ?? "").length < p.minimo ? (p.erro ?? null) : null;
    case "email":
      if (vazio) return "Informe seu e-mail";
      return emailValido(v as string) ? null : "E-mail inválido. Confira se tem @ e o domínio";
    case "whatsapp":
      if (vazio) return opcional(p, r) ? null : p.erro;
      return telefoneValido(v as string) ? null : "WhatsApp inválido. Use (99) 99999-9999";
  }
}

function reduzir(e: Estado, a: Acao): Estado {
  switch (a.tipo) {
    case "comecar":
      return { ...e, fase: "pergunta", id: "perfil", direcao: 1, erro: null };

    case "abrir": {
      const { perfil, focar } = a.opcoes;
      if (e.enviando || (!perfil && !focar)) return e;
      /* já inscrito: botão com perfil começa outra inscrição */
      const base = e.fase === "fim" ? NOVO : e;
      const ramo = focar === "destino" ? "viajante" : (perfil ?? base.respostas.perfil ?? "viajante");
      const continua = base.fase === "pergunta" && base.respostas.perfil === ramo && !focar;
      return {
        ...base,
        fase: "pergunta",
        respostas: { ...base.respostas, perfil: ramo },
        /* o perfil já veio do botão: começa na 2ª pergunta do ramo */
        id: focar ?? (continua ? base.id : perguntasDe(ramo)[1].id),
        direcao: 1,
        erro: null,
        falha: null,
      };
    }

    case "responder":
      return { ...e, respostas: { ...e.respostas, [a.id]: a.valor } as Respostas, erro: null, falha: null };

    case "avancar": {
      /* `de`: a escolha única avança depois de um instante; se a pessoa já saiu dali, não faz nada */
      if (e.fase !== "pergunta" || e.id !== a.de || e.enviando) return e;
      const lista = perguntasDe(e.respostas.perfil);
      const i = lista.findIndex((p) => p.id === e.id);
      const erro = validar(lista[i], e.respostas);
      if (erro) return { ...e, erro };
      const prox = lista[i + 1];
      return prox ? { ...e, id: prox.id, direcao: 1, erro: null, falha: null } : { ...e, erro: null, falha: null, enviando: true };
    }

    case "voltar": {
      if (e.enviando) return e;
      const lista = perguntasDe(e.respostas.perfil);
      const i = lista.findIndex((p) => p.id === e.id);
      if (i <= 0) return { ...e, fase: "boas-vindas", erro: null, falha: null };
      return { ...e, id: lista[i - 1].id, direcao: -1, erro: null, falha: null };
    }

    case "enviado":
      return { ...e, fase: "fim", enviando: false };

    case "falhou":
      return { ...e, enviando: false, falha: a.mensagem };

    case "recomecar":
      return { ...NOVO, fase: "pergunta" };
  }
}

/* ---------------------------------- quiz ---------------------------------- */

const TOQUE = "(hover: none) and (pointer: coarse)";

/** celular e tablet: sem atalhos de teclado e sem pôr o cursor no campo sozinho */
function useToque() {
  const [toque, setToque] = useState(() => window.matchMedia(TOQUE).matches);
  useEffect(() => {
    const mq = window.matchMedia(TOQUE);
    const mudar = (ev: MediaQueryListEvent) => setToque(ev.matches);
    mq.addEventListener("change", mudar);
    return () => mq.removeEventListener("change", mudar);
  }, []);
  return toque;
}

const letra = (i: number) => String.fromCharCode(65 + i);

/** Fica montado o tempo todo (guarda as respostas); só aparece com `aberto`. */
export function QuizListaEspera({ aberto }: { aberto: boolean }) {
  const [e, despachar] = useReducer(reduzir, NOVO);
  const [armadilha, setArmadilha] = useState("");
  const toque = useToque();
  const raiz = useRef<HTMLDivElement>(null);
  /* quem abriu o quiz recebe o foco de volta ao fechar */
  const gatilho = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);

  useAoAbrirLista(
    useCallback((opcoes: AbrirLista) => {
      const ativo = document.activeElement;
      if (ativo instanceof HTMLElement && ativo !== document.body) gatilho.current = ativo;
      despachar({ tipo: "abrir", opcoes });
    }, []),
  );

  useScrollLock(aberto);

  useEffect(() => {
    if (!aberto) return;
    const titulo = document.title;
    document.title = `Lista de espera · ${MARCA}`;
    return () => {
      document.title = titulo;
      gatilho.current?.focus({ preventScroll: true });
      gatilho.current = null;
    };
  }, [aberto]);

  /* foco a cada tela: no botão de começar, no campo (computador) ou no título da pergunta */
  useEffect(() => {
    if (aberto) raiz.current?.querySelector<HTMLElement>("[data-foco]")?.focus({ preventScroll: true });
  }, [aberto, e.fase, e.id]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  /* envia uma vez por tentativa, com as respostas do momento em que a última pergunta foi confirmada */
  useEffect(() => {
    if (!e.enviando) return;
    let ativo = true;
    const r = e.respostas;
    (async () => {
      try {
        /* robô preencheu o campo escondido: finge que deu certo e não grava nada */
        if (armadilha) await new Promise((ok) => window.setTimeout(ok, 600));
        else await entrarNaLista({ ...r, perfil: r.perfil ?? "viajante", nome: r.nome ?? "", email: r.email ?? "" });
        if (ativo) despachar({ tipo: "enviado" });
      } catch (err) {
        if (ativo) despachar({ tipo: "falhou", mensagem: err instanceof Error ? err.message : "Não foi possível entrar na lista agora. Tente de novo." });
      }
    })();
    return () => {
      ativo = false;
    };
  }, [e.enviando]);

  const lista = perguntasDe(e.respostas.perfil);
  const indice = lista.findIndex((p) => p.id === e.id);
  const atual = lista[indice];

  const avancar = () => despachar({ tipo: "avancar", de: e.id });
  const responder = (id: IdPergunta, valor: string | string[]) => despachar({ tipo: "responder", id, valor });
  const escolher = (id: IdPergunta, valor: string) => {
    responder(id, valor);
    /* escolha única avança sozinha, depois de mostrar a marcação */
    timers.current.push(window.setTimeout(() => despachar({ tipo: "avancar", de: id }), 280));
  };
  const alternar = (id: IdPergunta, valor: string) => {
    const marcadas = new Set((e.respostas[id] as string[] | undefined) ?? []);
    if (marcadas.has(valor)) marcadas.delete(valor);
    else marcadas.add(valor);
    /* na ordem das opções, como a API grava */
    const ordem = atual?.tipo === "varias" ? atual.opcoes.map((o) => o.id) : [...marcadas];
    responder(id, ordem.filter((x) => marcadas.has(x)));
  };

  const teclado = (ev: KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      fecharLista();
      return;
    }
    if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.nativeEvent.isComposing) return;
    const alvo = ev.target as HTMLElement;
    /* Enter: botões e campos cuidam do próprio (o campo de texto confirma pelo form) */
    if (ev.key === "Enter") {
      if (alvo.closest("button, a, input, textarea, select")) return;
      ev.preventDefault();
      if (e.fase === "boas-vindas") despachar({ tipo: "comecar" });
      else if (e.fase === "pergunta") avancar();
      return;
    }
    /* A, B, C… escolhem a opção (fora dos campos de texto) */
    if (e.fase !== "pergunta" || !atual || (atual.tipo !== "escolha" && atual.tipo !== "varias")) return;
    if (!/^[a-z]$/i.test(ev.key) || alvo.closest("input, textarea, select")) return;
    const opcao = atual.opcoes[ev.key.toUpperCase().charCodeAt(0) - 65];
    if (!opcao) return;
    ev.preventDefault();
    if (atual.tipo === "escolha") escolher(atual.id, opcao.id);
    else alternar(atual.id, opcao.id);
  };

  if (!aberto) return null;

  const n = indice + 1;
  return (
    /* tabIndex -1: clicar num espaço vazio deixa o foco no quiz, e o teclado continua valendo */
    <div ref={raiz} role="dialog" aria-modal="true" aria-label="Lista de espera" tabIndex={-1} onKeyDown={teclado} className="fixed inset-0 z-50 flex h-dvh flex-col bg-bg outline-none">
      {/* barra do alto (div, não header: o cabeçalho da página continua sendo o único banner) */}
      <div className="relative flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:h-16 sm:px-6">
        <p className="min-w-0 truncate text-headline font-semibold text-fg">
          {MARCA}
          <span className="font-normal text-muted max-sm:hidden"> · Lista de espera</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {import.meta.env.DEV && DESTINO === "demonstracao" && (
            <Badge tone="amber" size="sm">
              Modo demonstração
            </Badge>
          )}
          <IconButton label="Fechar" variant="ghost" onClick={fecharLista} className="max-sm:size-10">
            <X />
          </IconButton>
        </div>
        {e.fase === "pergunta" && (
          <Progress value={(n / lista.length) * 100} height={3} label={`Pergunta ${n} de ${lista.length}`} className="absolute inset-x-0 -bottom-px" />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {e.fase === "boas-vindas" && <BoasVindas toque={toque} onComecar={() => despachar({ tipo: "comecar" })} />}
        {e.fase === "pergunta" && atual && (
          <Passo
            key={atual.id}
            p={atual}
            r={e.respostas}
            n={n}
            total={lista.length}
            direcao={e.direcao}
            erro={e.erro}
            falha={e.falha}
            enviando={e.enviando}
            toque={toque}
            onResponder={responder}
            onEscolher={escolher}
            onAlternar={alternar}
            onAvancar={avancar}
            onVoltar={() => despachar({ tipo: "voltar" })}
          />
        )}
        {e.fase === "fim" && <Fim r={e.respostas} onRecomecar={() => despachar({ tipo: "recomecar" })} />}
      </div>

      {/* armadilha para robôs: invisível, fora da ordem do Tab e do leitor de tela */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Site da empresa
          <input type="text" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(ev) => setArmadilha(ev.target.value)} />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------ boas-vindas ------------------------------- */

function BoasVindas({ toque, onComecar }: { toque: boolean; onComecar: () => void }) {
  return (
    <div className="mx-auto grid min-h-full w-full max-w-[1080px] grid-cols-1 content-center items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div className="animate-fade-up">
        <p className="text-body-2 font-medium text-muted">Lista de espera</p>
        <h2 className="mt-2 text-[30px] leading-[36px] font-semibold text-balance text-fg sm:text-[40px] sm:leading-[46px]">{SLOGAN.titulo}, antes de todo mundo</h2>
        <p className="mt-3 text-headline font-normal text-muted">Responda algumas perguntas rápidas, uma de cada vez, e garanta o aviso do lançamento do {MARCA}.</p>
        <ListaBeneficios className="mt-6" />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center [&_button]:h-11">
          <Button data-foco="" variant="primary" size="lg" onClick={onComecar} iconRight={<ArrowRight className="size-4" />} className="max-sm:w-full">
            Começar
          </Button>
          <p className="text-body-2 text-muted max-sm:text-center">
            Leva menos de 1 minuto
            {!toque && (
              <>
                {" "}
                · ou aperte <Kbd>Enter ↵</Kbd>
              </>
            )}
          </p>
        </div>
      </div>
      <SafeImage src={IMG.janelaAviao} alt="Vista da janela do avião, com a asa e o céu ao entardecer" rounded="card" eager className="hidden aspect-[4/3] w-full border border-line lg:block" />
    </div>
  );
}

/* -------------------------------- pergunta -------------------------------- */

/** teclado certo no celular e preenchimento automático do navegador */
const CAMPO = {
  email: { type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "off", maxLength: 254 },
  whatsapp: { type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 20 },
} as const;

function Passo({
  p,
  r,
  n,
  total,
  direcao,
  erro,
  falha,
  enviando,
  toque,
  onResponder,
  onEscolher,
  onAlternar,
  onAvancar,
  onVoltar,
}: {
  p: Pergunta;
  r: Respostas;
  n: number;
  total: number;
  direcao: 1 | -1;
  erro: string | null;
  falha: string | null;
  enviando: boolean;
  toque: boolean;
  onResponder: (id: IdPergunta, valor: string | string[]) => void;
  onEscolher: (id: IdPergunta, valor: string) => void;
  onAlternar: (id: IdPergunta, valor: string) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const valor = r[p.id];
  const vazio = valor === undefined || (Array.isArray(valor) ? valor.length === 0 : !valor.trim());
  const ultima = n === total;
  const campo = p.tipo === "texto" || p.tipo === "email" || p.tipo === "whatsapp";
  /* no computador o cursor já vai para o campo; no celular, não (o teclado subiria no meio da troca de tela) */
  const focoNoCampo = campo && !toque;
  const idErro = `quiz-${p.id}-erro`;

  return (
    <div
      className={cn(
        "mx-auto flex min-h-full w-full max-w-[640px] flex-col px-4 pt-8 pb-12 sm:justify-center sm:px-6 sm:py-12",
        direcao === 1 ? "animate-quiz-frente" : "animate-quiz-volta",
      )}
    >
      <p className="text-body-2 text-muted">
        <span className="num">
          Pergunta {n} de {total}
        </span>
        {opcional(p, r) && " · Opcional"}
      </p>
      <h2
        id="quiz-titulo"
        tabIndex={-1}
        data-foco={focoNoCampo ? undefined : ""}
        className="mt-2 text-[24px] leading-[30px] font-semibold text-balance text-fg outline-none sm:text-[30px] sm:leading-[38px]"
      >
        {texto(p.titulo, r)}
      </h2>
      {p.descricao && <p className="mt-2 text-headline font-normal text-muted">{texto(p.descricao, r)}</p>}

      <div className="mt-6">
        {p.tipo === "escolha" && (
          <div role="radiogroup" aria-labelledby="quiz-titulo" aria-describedby={erro ? idErro : undefined} className={cn("grid grid-cols-1 gap-2.5", p.opcoes.length === 2 && "sm:grid-cols-2")}>
            {p.opcoes.map((o, i) => (
              <ChoiceCard
                key={o.id}
                selected={valor === o.id}
                onClick={() => onEscolher(p.id, o.id)}
                label={o.rotulo}
                description={o.descricao}
                icon={toque ? undefined : <Kbd>{letra(i)}</Kbd>}
                indicator={
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full transition-opacity",
                      valor === o.id ? "bg-primary text-primary-fg opacity-100" : "opacity-0",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                }
              />
            ))}
          </div>
        )}

        {p.tipo === "varias" && (
          <div role="group" aria-labelledby="quiz-titulo" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {p.opcoes.map((o, i) => {
              const marcada = Array.isArray(valor) && (valor as string[]).includes(o.id);
              return (
                <ChoiceCard
                  key={o.id}
                  role="checkbox"
                  selected={marcada}
                  onClick={() => onAlternar(p.id, o.id)}
                  label={o.rotulo}
                  description={o.descricao}
                  icon={toque ? undefined : <Kbd>{letra(i)}</Kbd>}
                  indicator={<CheckMark checked={marcada} />}
                />
              );
            })}
          </div>
        )}

        {campo && (
          <form
            noValidate
            onSubmit={(ev) => {
              ev.preventDefault();
              onAvancar();
            }}
          >
            <input
              ref={entrada}
              id={`quiz-${p.id}`}
              data-foco={focoNoCampo ? "" : undefined}
              aria-labelledby="quiz-titulo"
              aria-describedby={erro ? idErro : undefined}
              aria-invalid={!!erro || undefined}
              className="field h-12 w-full px-3.5 text-title-3"
              value={typeof valor === "string" ? valor : ""}
              onChange={(ev) => onResponder(p.id, p.tipo === "whatsapp" ? fmtTelefone(ev.target.value) : ev.target.value)}
              placeholder={p.placeholder}
              disabled={enviando}
              enterKeyHint={ultima ? "send" : "next"}
              spellCheck={false}
              {...(p.tipo === "texto" ? { type: "text", autoComplete: p.autoComplete, maxLength: 120 } : CAMPO[p.tipo])}
            />
            {p.tipo === "texto" && p.sugestoes && (
              <div className="mt-3 flex flex-wrap gap-2 max-sm:[&_button]:h-9">
                {p.sugestoes.map((s) => (
                  <Chip
                    key={s}
                    active={valor === s}
                    onClick={() => {
                      onResponder(p.id, valor === s ? "" : s);
                      /* o cursor volta ao campo: o Enter segue para a próxima pergunta */
                      if (!toque) entrada.current?.focus();
                    }}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            )}
          </form>
        )}
      </div>

      {erro && (
        <p id={idErro} role="alert" className="mt-3 flex items-center gap-1.5 text-body-2 font-medium text-red">
          <CircleAlert className="size-4 shrink-0" />
          {erro}
        </p>
      )}
      {falha && (
        <Note tone="red" icon={<CircleAlert />} className="mt-4">
          {falha}
        </Note>
      )}

      <div className="mt-8 flex items-center gap-3 [&_button]:h-11">
        <Button variant="ghost" icon={<ChevronLeft className="size-4" />} onClick={onVoltar} disabled={enviando}>
          Voltar
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onAvancar}
          loading={enviando}
          icon={ultima ? <Send className="size-4" /> : undefined}
          iconRight={ultima ? undefined : <ArrowRight className="size-4" />}
          className="max-sm:flex-1"
        >
          {ultima ? "Entrar na lista" : opcional(p, r) && vazio ? "Pular" : "Continuar"}
        </Button>
        {!toque && (
          <p className="text-caption text-muted max-sm:hidden">
            ou aperte <Kbd>Enter ↵</Kbd>
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- fim ----------------------------------- */

function Fim({ r, onRecomecar }: { r: Respostas; onRecomecar: () => void }) {
  const agencia = r.perfil === "agencia";
  /* mostra o que foi gravado: texto limpo e e-mail em minúsculas */
  const primeiro = (semFormula(r.nome) ?? "").split(/\s+/)[0];
  const email = (r.email ?? "").trim().toLowerCase();
  const site = `${window.location.origin}/?utm_source=convite&utm_medium=whatsapp`;
  const convite = encodeURIComponent(`Entrei na lista de espera do ${MARCA}: ${SLOGAN.titulo.toLowerCase()}, com roteiro personalizado, mapa e assistente de viagem. Entre também: ${site}`);

  /* e-mail repetido recebe a mesma confirmação: o quiz não revela quem já está na lista */
  const titulo = agencia ? `Recebemos o contato da ${semFormula(r.agencia)}` : `Você está na lista, ${primeiro}`;
  const zap = <span className="whitespace-nowrap">{r.whatsapp}</span>;
  const detalhe = agencia ? (
    <>
      Vamos chamar no WhatsApp {zap} quando abrirmos para agências, e o aviso também vai para {email}.
    </>
  ) : (
    <>
      Vamos avisar em {email}
      {r.whatsapp && <> e no WhatsApp {zap}</>} quando o {MARCA} abrir.
    </>
  );

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-col items-center justify-center px-4 py-12 text-center animate-pop">
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-lime/20 bg-lime/10 text-lime">
        <CircleCheck className="size-6" />
      </span>
      <h2 tabIndex={-1} data-foco="" className="mt-4 text-[24px] leading-[30px] font-semibold text-balance text-fg outline-none sm:text-[30px] sm:leading-[38px]">
        {titulo}
      </h2>
      <p className="mt-2 text-headline font-normal text-muted">{detalhe}</p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row [&_a]:h-11 [&_button]:h-11">
        {!agencia && (
          <a
            href={`https://wa.me/?text=${convite}`}
            target="_blank"
            rel="noreferrer"
            className="focus-ring control inline-flex items-center justify-center gap-1.5 px-4 text-body font-medium text-fg hover:bg-control-hover"
          >
            <MessageCircle className="size-4" /> Convidar quem viaja com você
          </a>
        )}
        <Button variant="primary" size="lg" onClick={fecharLista}>
          Voltar ao site
        </Button>
      </div>
      <Button variant="ghost" onClick={onRecomecar} className="mt-3 max-sm:h-11">
        Inscrever outra pessoa
      </Button>
    </div>
  );
}
