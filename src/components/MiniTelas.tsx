import type { ReactNode } from "react";
import {
  Check,
  CircleCheck,
  GripVertical,
  Lightbulb,
  Map as MapIcon,
  MessageCircle,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Volume2,
  Wallet,
} from "lucide-react";
import { EXEMPLO } from "@/conteudo/exemplo-paris";
import { fotoAtracao, RETRATOS_GRUPO } from "@/conteudo/imagens";
import { EMPRESA, GASTO_ALMOCO_PARIS } from "@/conteudo/site";
import { euro } from "@/lib/texto";
import { cn } from "@/lib/format";
import { AvatarGroup, Badge, CheckMark } from "@/components/ui";
import { MapaExemplo } from "./MapaExemplo";

/* ---------------------------------------------------------------------------
   Miniaturas das telas do app, uma por funcionalidade, montadas com o kit
   (não são capturas): seguem o tema claro/escuro e usam o conteúdo real do
   protótipo — paradas do Dia 1 em Paris, instrução de metrô, dica do
   especialista, mediana de gastos, texto do assistente.
   São ilustrações: os "botões" são spans, sem foco nem ação. A exceção é o
   link do Google Maps, que funciona.
--------------------------------------------------------------------------- */

const BOTAO = "inline-flex h-8 items-center justify-center gap-1.5 rounded-tile px-2.5 text-body-2 font-medium [&>svg]:size-3.5";
const BOTAO_PRIMARIO = cn(BOTAO, "bg-primary text-primary-fg shadow-xs");
const BOTAO_SECUNDARIO = cn(BOTAO, "control text-fg");
const SUGESTAO = cn(BOTAO, "border border-line text-muted");

function Mini({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("floating w-[300px] max-w-[calc(100vw-3rem)] p-3.5", className)}>{children}</div>;
}

const DIA1 = EXEMPLO.dias[0];
const parada = (nome: string) => EXEMPLO.dias.flatMap((d) => d.paradas).find((p) => p.nome === nome)!;
const TROCADERO = parada("Trocadéro");
const ARCO = parada("Arco do Triunfo");
const DOMINIO = EMPRESA.email.split("@")[1];

/* ------------------------- 1. seu roteiro, suas escolhas ------------------------ */

export function MiniPersonalizado({ className }: { className?: string }) {
  const interesses = [
    { nome: "Cultural", escolhido: true },
    { nome: "Gastronômico", escolhido: true },
    { nome: "Romântico", escolhido: false },
    { nome: "Compras", escolhido: false },
  ];
  const escolhidos = ["Torre Eiffel", "Museu do Louvre", "Basílica de Sacré-Cœur"].map(parada);
  return (
    <Mini className={className}>
      <p className="text-caption font-medium text-muted">Seus interesses</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {interesses.map((i) => (
          <span
            key={i.nome}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-tile border px-2.5 text-body-2 font-medium",
              i.escolhido ? "border-primary bg-primary text-primary-fg" : "border-line bg-control text-muted",
            )}
          >
            {i.escolhido && <Check className="size-3.5" />}
            {i.nome}
          </span>
        ))}
      </div>
      <p className="mt-3 text-caption font-medium text-muted">Escolhidos para você em Paris</p>
      <ul className="mt-1.5 space-y-1.5">
        {escolhidos.map((p) => (
          <li key={p.nome} className="tile flex items-center gap-2.5 p-1.5 pr-2.5">
            {p.foto && <img src={fotoAtracao(p.foto, 120)} alt="" className="size-9 shrink-0 rounded-[6px] object-cover" />}
            <span className="min-w-0 flex-1 truncate text-body-2 font-medium text-fg">{p.nome}</span>
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
              <Check className="size-3" strokeWidth={3} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-caption text-muted">{EXEMPLO.qtdDias} dias, ritmo moderado, partindo do seu hotel</p>
    </Mini>
  );
}

/* ---------------------------- 2. se perder? nunca mais ------------------------- */

/** o mapa real do Dia 1, com o ponto azul saindo do Trocadéro rumo ao Arco do Triunfo */
export function MiniNoMapa({ className }: { className?: string }) {
  const maps = `https://www.google.com/maps/dir/?api=1&origin=${TROCADERO.lat},${TROCADERO.lng}&destination=${ARCO.lat},${ARCO.lng}&travelmode=transit`;
  const voce = { lat: TROCADERO.lat + (ARCO.lat - TROCADERO.lat) * 0.2, lng: TROCADERO.lng + (ARCO.lng - TROCADERO.lng) * 0.2 };
  return (
    <Mini className={cn("p-2", className)}>
      <MapaExemplo dia={1} altura={150} estatico voce={voce} />
      <div className="px-1.5 pt-2.5 pb-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-caption font-medium text-muted">Próxima parada</p>
          <span className="text-caption text-muted num">3 de 5</span>
        </div>
        <p className="text-body font-semibold text-fg">{ARCO.nome}</p>
        <p className="text-body-2 text-muted">Metrô linha 6 até Charles de Gaulle–Étoile, 3 paradas · {ARCO.trecho?.min} min</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <a href={maps} target="_blank" rel="noreferrer" className={cn(BOTAO_SECUNDARIO, "focus-ring hover:bg-control-hover")}>
            <MapIcon /> Google Maps
          </a>
          <span className={BOTAO_PRIMARIO}>
            <Check /> Visitei
          </span>
        </div>
        <p className="mt-2 text-caption-2 text-faint">Mapa © Esri, © OpenStreetMap</p>
      </div>
    </Mini>
  );
}

/* --------------------------- 3. mudou de ideia? tudo bem ------------------------ */

/** o Arco do Triunfo arrastado para antes do Trocadéro: horários e trajetos refeitos */
export function MiniReorganizar({ className }: { className?: string }) {
  const linhas = [
    { hora: DIA1.paradas[0].inicio, nome: DIA1.paradas[0].nome, feito: true },
    { hora: DIA1.paradas[1].inicio, nome: DIA1.paradas[1].nome },
    { hora: "13:30", nome: "Arco do Triunfo", movido: true },
    { hora: "14:42", nome: "Trocadéro" },
  ];
  return (
    <Mini className={className}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-2 font-semibold text-fg">Hoje · Dia 1</p>
        <Badge tone="lime" size="sm" icon={<RefreshCw />}>
          Horários refeitos
        </Badge>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {linhas.map((l) => (
          <li
            key={l.nome}
            className={cn("tile flex items-center gap-2 px-2 py-2", l.movido && "-rotate-1 border-primary shadow-dropdown ring-1 ring-primary")}
          >
            <GripVertical className={cn("size-4 shrink-0", l.movido ? "text-fg" : "text-faint")} />
            <span className="w-11 shrink-0 text-body-2 font-semibold text-fg num">{l.hora}</span>
            <span className="min-w-0 flex-1 truncate text-body-2 text-fg">{l.nome}</span>
            {l.feito && <CheckMark checked />}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-caption text-muted">Arco do Triunfo antes do Trocadéro: caminho e horários refeitos sozinhos.</p>
    </Mini>
  );
}

export function MiniReajuste({ className }: { className?: string }) {
  return (
    <Mini className={className}>
      <p className="text-body font-semibold text-fg">Ficaram 2 lugares sem visitar hoje</p>
      <p className="mt-0.5 text-body-2 text-muted">Avenida Champs-Élysées e Cruzeiro no Sena. Quer que eu reajuste os próximos dias?</p>
      <ul className="mt-2.5 space-y-1.5">
        <li className="tile truncate px-2.5 py-2 text-body-2 text-fg">
          <b className="font-semibold">Dia 4:</b> + Avenida Champs-Élysées
        </li>
        <li className="tile truncate px-2.5 py-2 text-body-2 text-fg">
          <b className="font-semibold">Dia 4:</b> + Cruzeiro no Sena
        </li>
      </ul>
      <span className={cn(BOTAO_PRIMARIO, "mt-3 w-full")}>Encaixar nos próximos dias</span>
    </Mini>
  );
}

/* --------------------------- 4. sua assistente de viagem ------------------------ */

/** a resposta usa a base do app: a Rue Cler, a dica do especialista e a mediana de gastos */
export function MiniConversa({ className }: { className?: string }) {
  return (
    <Mini className={cn("p-0", className)}>
      <p className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5 text-caption text-muted">
        <Sparkles className="size-3.5 text-purple" /> Assistente de viagem
      </p>
      <div className="space-y-2.5 p-3.5">
        <p className="ml-auto w-fit max-w-[85%] rounded-[14px] rounded-br-[4px] bg-primary px-3 py-2 text-body-2 text-primary-fg shadow-xs">
          Onde almoçar perto da Torre Eiffel?
        </p>
        <div className="max-w-[92%] rounded-[14px] rounded-bl-[4px] bg-surface-3 px-3 py-2 text-body-2 text-fg">
          A <b className="font-semibold">Rue Cler</b> fica a 900 m, uns 12 minutos a pé: peixarias, queijarias, padarias e cafés.
        </div>
        <div className="tile flex gap-2 p-2.5">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber" />
          <p className="text-body-2 text-fg">
            <span className="block text-caption text-muted">Dica do especialista</span>
            Monte um piquenique com baguete, queijo e frutas da feira e leve para o Champ de Mars, bem ao lado.
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-caption text-muted">
          <Wallet className="size-3.5 shrink-0" /> Almoço por ali: {euro(GASTO_ALMOCO_PARIS.mediana)} por pessoa, na mediana dos viajantes
        </p>
        <span className={SUGESTAO}>O que tem por perto?</span>
      </div>
    </Mini>
  );
}

/* ----------------------------- 5. fotografou? descubra -------------------------- */

export function MiniAssistente({ className }: { className?: string }) {
  return (
    <Mini className={cn("p-0", className)}>
      <p className="flex items-center gap-1.5 px-3.5 pt-3 text-caption text-muted">
        <Sparkles className="size-3.5 text-purple" /> Assistente de viagem
      </p>
      <div className="p-3.5 pt-2">
        <Badge tone="purple" variant="solid" size="sm" icon={<ScanSearch />}>
          Identificado · 98%
        </Badge>
        <p className="mt-2 text-body font-semibold text-fg">Arco do Triunfo</p>
        <p className="text-caption text-muted">Paris, França · 1806–1836</p>
        <p className="mt-2 text-body-2 text-fg">
          Arco de 50 metros encomendado por Napoleão em 1806 para celebrar o exército francês. Embaixo dele está o Túmulo do Soldado Desconhecido, com uma chama que
          nunca se apaga.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={BOTAO_SECUNDARIO}>
            <Volume2 /> Ouvir
          </span>
          <span className={SUGESTAO}>Quem construiu?</span>
          <span className={SUGESTAO}>O que tem por perto?</span>
        </div>
      </div>
    </Mini>
  );
}

/* ------------------------ 6. viajar junto começa no planejamento ---------------- */

export function MiniCompartilhar({ className }: { className?: string }) {
  return (
    <Mini className={className}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption font-medium text-muted">Nosso roteiro</p>
          <p className="truncate text-body font-semibold text-fg">{EXEMPLO.titulo.split(":")[0]}</p>
        </div>
        <AvatarGroup people={RETRATOS_GRUPO} max={4} size={26} />
      </div>
      <ol className="mt-3 space-y-2 border-t border-line pt-3">
        {EXEMPLO.dias.slice(0, 4).map((d) => (
          <li key={d.numero} className="flex items-center gap-2.5 text-body-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: d.cor }} />
            <span className="w-10 shrink-0 font-semibold text-fg">Dia {d.numero}</span>
            <span className="min-w-0 truncate text-muted">{d.tema}</span>
          </li>
        ))}
      </ol>
      <span className={cn(BOTAO_PRIMARIO, "mt-3 w-full")}>
        <MessageCircle /> Compartilhar pelo WhatsApp
      </span>
      <p className="mt-2 text-caption text-muted">Quem recebe abre no celular, sem cadastro.</p>
    </Mini>
  );
}

/* --------------------------------- agência -------------------------------- */

export function MiniEnvioWhatsApp({ className }: { className?: string }) {
  return (
    <Mini className={className}>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-tile bg-primary text-body-2 font-semibold text-primary-fg">RS</span>
        <span className="min-w-0">
          <span className="block truncate text-body font-semibold text-fg">Rota Sul Viagens</span>
          <span className="block text-caption text-muted">Enviar roteiro ao cliente</span>
        </span>
      </div>
      <p className="mt-3 rounded-tile bg-surface-3 px-3 py-2.5 text-body-2 text-fg">
        Olá, Carla! Seu roteiro de Gramado e Canela está pronto: {DOMINIO}/r/gramado-carla. Qualquer dúvida, estamos à disposição.
      </p>
      <span className={cn(BOTAO_PRIMARIO, "mt-3 w-full")}>
        <MessageCircle /> Enviar pelo WhatsApp
      </span>
    </Mini>
  );
}

/* -------------------------------- curadoria ------------------------------- */

export function MiniChecklist({ className }: { className?: string }) {
  const itens = ["Coordenada confere com o endereço", "Horário de funcionamento atualizado", "Preço do ingresso atualizado", "Foto adequada"];
  return (
    <Mini className={className}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-caption font-medium text-muted">Checklist do especialista</p>
          <p className="text-body font-semibold text-fg">Catedral de Pedra, Canela</p>
        </div>
        <Badge tone="blue" size="sm" icon={<ShieldCheck />}>
          Verificada
        </Badge>
      </div>
      <ul className="mt-3 space-y-2">
        {itens.map((t) => (
          <li key={t} className="flex items-center gap-2.5 text-body-2 text-fg">
            <CheckMark checked /> {t}
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5 text-caption text-muted">
        <CircleCheck className="size-3.5 shrink-0 text-lime" /> Validado no Google Places: 38 m de diferença
      </p>
    </Mini>
  );
}
