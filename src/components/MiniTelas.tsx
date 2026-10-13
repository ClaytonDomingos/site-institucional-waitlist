import type { ReactNode } from "react";
import {
  CarTaxiFront,
  Check,
  CircleCheck,
  Footprints,
  Map as MapIcon,
  MessageCircle,
  QrCode,
  ScanSearch,
  ShieldCheck,
  SkipForward,
  Sparkles,
  TramFront,
  Users,
  Volume2,
} from "lucide-react";
import { EXEMPLO } from "@/conteudo/exemplo-paris";
import { GASTO_ALMOCO_PARIS } from "@/conteudo/site";
import { euro, reais } from "@/lib/texto";
import { cn, num } from "@/lib/format";
import { Badge, CheckMark, Progress } from "@/components/ui";

/* ---------------------------------------------------------------------------
   Miniaturas das telas do app, montadas com o kit (não são capturas): seguem
   o tema claro/escuro e usam o conteúdo real do protótipo — instrução de
   metrô, paradas do Dia 1, mediana da comunidade, texto do assistente.
   São ilustrações: os "botões" são spans, sem foco nem ação. A exceção é o
   link do Google Maps, que funciona.
--------------------------------------------------------------------------- */

const BOTAO = "inline-flex h-8 items-center justify-center gap-1.5 rounded-tile px-2.5 text-body-2 font-medium [&>svg]:size-3.5";
const BOTAO_PRIMARIO = cn(BOTAO, "bg-primary text-primary-fg shadow-xs");
const BOTAO_SECUNDARIO = cn(BOTAO, "control text-fg");

function Mini({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("floating w-[300px] max-w-[calc(100vw-3rem)] p-3.5", className)}>{children}</div>;
}

const DIA1 = EXEMPLO.dias[0];
const EIFFEL = DIA1.paradas[0];
const ARCO = DIA1.paradas.find((p) => p.nome === "Arco do Triunfo")!;

/* --------------------------------- trechos -------------------------------- */

/** Torre Eiffel → Arco do Triunfo, com as regras de cálculo do app (distância × 1,3; tarifas de Paris) */
export function MiniComoChegar({ className }: { className?: string }) {
  const maps = `https://www.google.com/maps/dir/?api=1&origin=${EIFFEL.lat},${EIFFEL.lng}&destination=${ARCO.lat},${ARCO.lng}&travelmode=transit`;
  const opcoes = [
    { icon: Footprints, modo: "A pé", detalhe: "30 min · 2,2 km" },
    { icon: TramFront, modo: "Metrô linha 6", detalhe: "22 min · € 2,50", recomendado: true },
    { icon: CarTaxiFront, modo: "Táxi ou app", detalhe: "8 min · ≈ € 7,32" },
  ];
  return (
    <Mini className={className}>
      <p className="text-caption font-medium text-muted">Como chegar</p>
      <p className="text-body font-semibold text-fg">Torre Eiffel → Arco do Triunfo</p>
      <ul className="mt-2.5 space-y-1.5">
        {opcoes.map((o) => (
          <li key={o.modo} className={cn("tile flex items-center gap-2 px-2.5 py-2", o.recomendado && "border-primary shadow-[0_0_0_1px_var(--primary)]")}>
            <o.icon className="size-4 shrink-0 text-fg" />
            <span className="text-body-2 font-medium text-fg">{o.modo}</span>
            <span className="ml-auto text-caption text-muted num">{o.detalhe}</span>
          </li>
        ))}
      </ul>
      <ol className="mt-2.5 space-y-1">
        <li className="border-l-2 border-line pl-2 text-body-2 text-muted">Caminhe 8 min pelo Quai Branly até a estação Bir-Hakeim</li>
        <li className="border-l-2 border-line pl-2 text-body-2 text-muted">Metrô linha 6 até Charles de Gaulle–Étoile, 5 paradas. Sente à direita para ver a torre</li>
      </ol>
      <a href={maps} target="_blank" rel="noreferrer" className={cn(BOTAO_SECUNDARIO, "focus-ring mt-3 w-full hover:bg-control-hover")}>
        <MapIcon /> Abrir no Google Maps
      </a>
    </Mini>
  );
}

/* ----------------------------------- PDF ---------------------------------- */

export function MiniPdf({ className }: { className?: string }) {
  return (
    <Mini className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-caption text-muted">{EXEMPLO.titulo.split(":")[0]}</p>
          <p className="text-[22px] leading-[28px] font-semibold text-fg">Dia 1</p>
          <p className="text-body-2 text-muted">{DIA1.tema}</p>
        </div>
        <QrCode className="size-9 shrink-0 text-fg" strokeWidth={1.5} aria-label="QR Code que abre o roteiro no celular" />
      </div>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {DIA1.paradas.slice(0, 4).map((p, i) => (
          <li key={p.nome} className="flex items-center gap-2.5 py-2">
            <CheckMark checked={i === 0} />
            <span className="w-12 shrink-0 text-[15px] leading-5 font-semibold text-fg num">{p.inicio}</span>
            <span className="min-w-0 truncate text-[15px] leading-5 text-fg">{p.nome}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge size="sm">Letra grande</Badge>
        <Badge size="sm">Caixas para marcar</Badge>
        <Badge size="sm">Mapa do dia</Badge>
      </div>
    </Mini>
  );
}

/* ------------------------------- modo viagem ------------------------------ */

export function MiniProximaParada({ className }: { className?: string }) {
  return (
    <Mini className={className}>
      <div className="flex items-center justify-between gap-2 text-caption">
        <span className="font-medium text-fg">Hoje · Dia 1 de 5</span>
        <span className="text-muted num">2 de 5 visitadas</span>
      </div>
      <Progress value={40} className="mt-2" height={5} label="2 de 5 paradas visitadas" />
      <p className="mt-3 text-caption text-muted">Próxima parada</p>
      <p className="text-body font-semibold text-fg">{ARCO.nome}</p>
      <p className="text-body-2 text-muted">1,8 km · 12 min de metrô</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className={BOTAO_PRIMARIO}>
          <Check /> Visitei
        </span>
        <span className={BOTAO_SECUNDARIO}>
          <SkipForward /> Pular
        </span>
      </div>
    </Mini>
  );
}

export function MiniReajuste({ className }: { className?: string }) {
  return (
    <Mini className={className}>
      <p className="text-body font-semibold text-fg">Ficaram 2 lugares sem visitar hoje</p>
      <p className="mt-0.5 text-body-2 text-muted">Avenida Champs-Élysées e Cruzeiro no Sena. Quer que eu reajuste os próximos dias?</p>
      <ul className="mt-2.5 space-y-1.5">
        <li className="tile px-2.5 py-2 text-body-2 text-fg">
          <b className="font-semibold">Dia 4:</b> + Avenida Champs-Élysées, depois da Place de la Concorde
        </li>
        <li className="tile px-2.5 py-2 text-body-2 text-fg">
          <b className="font-semibold">Dia 4:</b> + Cruzeiro no Sena, perto da Pont Alexandre III
        </li>
      </ul>
      <span className={cn(BOTAO_PRIMARIO, "mt-3 w-full")}>Encaixar nos próximos dias</span>
    </Mini>
  );
}

/* --------------------------------- gastos --------------------------------- */

export function MiniGastos({ className }: { className?: string }) {
  const g = GASTO_ALMOCO_PARIS;
  const voce = 28;
  const max = 40;
  const pos = (v: number) => `${(v / max) * 100}%`;
  const acima = Math.round((voce / g.mediana - 1) * 100);
  return (
    <Mini className={className}>
      <p className="text-caption font-medium text-muted">Almoço em Paris, por pessoa</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-title-1 font-semibold text-fg num">{euro(g.mediana)}</span>
        <span className="text-body-2 text-muted num">≈ {reais(g.mediana * g.cotacaoEUR)}</span>
      </p>
      <p className="text-body-2 text-muted">Mediana dos viajantes, orçamento moderado</p>

      <div className="relative mt-5 mb-1 h-2 rounded-full bg-surface-3" aria-hidden>
        <span className="absolute inset-y-0 rounded-full bg-blue/25" style={{ left: pos(g.p25), width: `calc(${pos(g.p75)} - ${pos(g.p25)})` }} />
        <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-fg" style={{ left: pos(g.mediana) }} />
        <span className="absolute -top-1.5 size-5 -translate-x-1/2 rounded-full border-2 border-card bg-amber shadow-xs" style={{ left: pos(voce) }} />
      </div>
      <div className="relative h-4 text-caption text-muted num" aria-hidden>
        <span className="absolute -translate-x-1/2" style={{ left: pos(g.p25) }}>
          {euro(g.p25)}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: pos(g.p75) }}>
          {euro(g.p75)}
        </span>
      </div>

      <p className="mt-3 rounded-tile border border-amber/20 bg-amber/10 px-2.5 py-2 text-body-2 text-amber-fg">
        Você gastou {euro(voce)}: {acima}% acima da mediana. Faixa comum: {euro(g.p25)} a {euro(g.p75)}.
      </p>
      <p className="mt-2.5 flex items-center gap-1.5 text-caption text-muted">
        <Users className="size-3.5 shrink-0" /> {num(g.amostras)} registros de viajantes nos últimos 12 meses
      </p>
    </Mini>
  );
}

/* ------------------------------- assistente ------------------------------- */

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
          <span className={cn(BOTAO, "border border-line text-muted")}>Quem construiu?</span>
          <span className={cn(BOTAO, "border border-line text-muted")}>O que tem por perto?</span>
        </div>
      </div>
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
        Olá, Carla! Seu roteiro de Gramado e Canela está pronto: meuguia.app/r/gramado-carla. Qualquer dúvida, estamos à disposição.
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
