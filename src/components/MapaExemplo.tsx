import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { EXEMPLO, type ParadaExemplo } from "@/conteudo/exemplo-paris";
import { fotoAtracao } from "@/conteudo/imagens";
import { distancia, duracao, MODO_TRECHO } from "@/lib/texto";
import { cn } from "@/lib/format";

/* ---------------------------------------------------------------------------
   O mapa do roteiro de exemplo de Paris, com o mesmo desenho do app
   (components/mapa/MapaInterativo.tsx): tiles Esri World Light Gray (sem
   chave; a CARTO passou a exigir), marcadores numerados na cor do dia,
   almoço com garfo e faca, hospedagem como partida e chegada, popup com foto.
   Em "todos os dias" o bate-volta (Versalhes) não afasta o enquadramento.
   No toque, arrastar fica desligado para o mapa não prender a rolagem da página.
--------------------------------------------------------------------------- */

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_ROTULOS_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
const ATRIBUICAO = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin &middot; &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function iconeParada(numero: number | null, cor: string) {
  const r = 15;
  const conteudo =
    numero === null
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
      : `<span style="font:700 12px Inter,sans-serif;color:#fff">${numero}</span>`;
  const fundo = numero === null ? "#ffffff" : cor;
  const borda = numero === null ? cor : "#ffffff";
  return L.divIcon({
    className: "mg-marcador",
    iconSize: [0, 0],
    popupAnchor: [0, -r],
    html: `<div style="width:${r * 2}px;height:${r * 2}px;transform:translate(-${r}px,-${r}px);border-radius:999px;background:${fundo};border:2.5px solid ${borda};box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center">${conteudo}</div>`,
  });
}

const iconeHospedagem = L.divIcon({
  className: "mg-marcador",
  iconSize: [0, 0],
  popupAnchor: [0, -16],
  html: `<div style="width:32px;height:32px;transform:translate(-16px,-16px);border-radius:9px;background:#171717;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg></div>`,
});

type Ponto = { lat: number; lng: number };

function Enquadrar({ pontos, chave }: { pontos: Ponto[]; chave: string }) {
  const map = useMap();
  useEffect(() => {
    if (!pontos.length) return;
    map.fitBounds(L.latLngBounds(pontos.map((p) => [p.lat, p.lng] as [number, number])), { padding: [36, 36], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, map]);
  return null;
}

function PopupParada({ p, dia, cor }: { p: ParadaExemplo; dia: number; cor: string }) {
  return (
    <Popup>
      <div className="w-[220px]">
        {p.foto && <img src={fotoAtracao(p.foto)} alt={p.nome} className="mb-2 h-24 w-full rounded-tile object-cover" />}
        <p className="text-caption font-medium" style={{ color: cor }}>
          Dia {dia}
          {p.numero ? ` · Parada ${p.numero}` : " · Refeição"}
        </p>
        <p className="text-body font-semibold text-fg">{p.nome}</p>
        <p className="text-body-2 text-muted">
          {p.inicio} às {p.fim}
          {p.margem ? ` · margem ${p.margem} do Sena` : ""}
        </p>
        {p.trecho && (
          <p className="mt-1 text-body-2 text-fg">
            Chegada: {duracao(p.trecho.min)} {MODO_TRECHO[p.trecho.modo]}, {distancia(p.trecho.km)}
          </p>
        )}
      </div>
    </Popup>
  );
}

export function MapaExemplo({ dia, altura, className }: { dia: number | "todos"; altura: number; className?: string }) {
  const hosp = EXEMPLO.hospedagem;
  const dias = useMemo(() => (dia === "todos" ? EXEMPLO.dias : EXEMPLO.dias.filter((d) => d.numero === dia)), [dia]);
  const enquadrar = useMemo(() => {
    const visiveis = dia === "todos" ? dias.filter((d) => !d.foraDoCentro) : dias;
    return [hosp, ...visiveis.flatMap((d) => d.paradas)];
  }, [dias, dia, hosp]);
  const toque = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <div role="region" aria-label={`Mapa do roteiro de exemplo: ${EXEMPLO.titulo}`} className={cn("relative isolate overflow-hidden rounded-tile border border-line", className)} style={{ height: altura }}>
      <MapContainer center={[hosp.lat, hosp.lng]} zoom={13} zoomSnap={0.25} scrollWheelZoom={false} dragging={!toque} className="h-full w-full" style={{ zIndex: 0 }}>
        <TileLayer url={TILE_URL} attribution={ATRIBUICAO} maxNativeZoom={16} maxZoom={19} />
        <TileLayer url={TILE_ROTULOS_URL} maxNativeZoom={16} maxZoom={19} />
        <Enquadrar pontos={enquadrar} chave={String(dia)} />
        {dias.map((d) => (
          <Polyline
            key={d.numero}
            positions={[hosp, ...d.paradas, hosp].map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: d.cor, weight: dia === "todos" ? 3.5 : 4.5, opacity: 0.85, lineCap: "round", lineJoin: "round" }}
          />
        ))}
        <Marker position={[hosp.lat, hosp.lng]} icon={iconeHospedagem} zIndexOffset={500}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-caption text-muted">Hospedagem · partida e chegada</p>
              <p className="text-body font-semibold text-fg">{hosp.nome}</p>
              <p className="text-body-2 text-muted">{hosp.endereco}</p>
            </div>
          </Popup>
        </Marker>
        {dias.flatMap((d) =>
          d.paradas.map((p) => (
            <Marker key={`${d.numero}-${p.nome}`} position={[p.lat, p.lng]} icon={iconeParada(p.numero, d.cor)} title={p.nome}>
              <PopupParada p={p} dia={d.numero} cor={d.cor} />
            </Marker>
          )),
        )}
      </MapContainer>
    </div>
  );
}
