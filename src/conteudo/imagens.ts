/* ---------------------------------------------------------------------------
   TODAS as URLs de imagem do site. Fotos do Unsplash (images.unsplash.com,
   Licença Unsplash: uso comercial livre, sem atribuição obrigatória),
   validadas com curl (200) e conferidas visualmente. As capas dos destinos,
   as fotos das atrações e os retratos são os mesmos do app
   (clayton-ari-meu-guia/src/mocks/images.ts).
   Nunca use source.unsplash.com (descontinuado).
--------------------------------------------------------------------------- */

const U = "https://images.unsplash.com/photo-";

/** foto recortada; `h` fixa a proporção (senão, mantém a original) */
export const foto = (id: string, w = 1200, h?: number) => `${U}${id}?w=${w}${h ? `&h=${h}` : ""}&q=80&auto=format&fit=crop`;
export const retrato = (id: string) => `${U}${id}?w=200&h=200&q=80&auto=format&fit=crop&crop=faces`;

/** fotos das seções (id do Unsplash · autor), já recortadas na proporção do lugar onde aparecem */
export const IMG = {
  /** duas viajantes escolhendo o caminho no mapa, numa rua europeia (o hero do app) · Vitaly Gariev */
  viajantesComMapa: foto("1752650143291-a049c42b15f2", 1200, 900),
  /** as mesmas viajantes, em retrato, ao lado do mapa no hero */
  viajantesHero: foto("1752650143291-a049c42b15f2", 1000, 1200),
  /** a mesma turma tirando uma selfie na viagem · Vitaly Gariev */
  amigosSelfie: foto("1752650143717-d83e7decb6d7", 1200, 900),
  /** plataforma da estação Concorde do metrô de Paris · Miraxh Tereziu */
  metroConcorde: foto("1760281853870-7a0bbf208d11", 1200, 900),
  /** celular com mapa na rua, à noite · Enrique Alarcon */
  celularMapaNoite: foto("1529775768124-fb874e73ac7e", 1000, 1250),
  /** café de esquina em Paris · Evan Buchholz */
  cafeParis: foto("1635782166219-168a2fe1bd19", 1200, 900),
  /** turista fotografando o Arco do Triunfo com o celular · Harrison Mitchell */
  fotoArcoDoTriunfo: foto("1787575634458-5f1c17a17e05", 1200, 900),
  /** atendimento numa mesa de escritório · Amy Hirschi */
  reuniaoAgencia: foto("1551836022-aadb801c60ae", 1200, 900),
  /** janela do avião com a asa ao entardecer · Lawrence Chismorie */
  janelaAviao: foto("1742238861697-b54509120e13", 1200, 900),
};

/** quem viaja junto, na miniatura de roteiro compartilhado (retratos do app: p05, p21, p08, p02) */
export const RETRATOS_GRUPO = [
  { name: "Bia", src: retrato("1494790108377-be9c29b29330") },
  { name: "Caio", src: retrato("1500648767791-00dcc994a43e") },
  { name: "Lu", src: retrato("1530983822321-fcac2d3c0f06") },
  { name: "Rafa", src: retrato("1656074520589-bd325dc7aa4f") },
  { name: "Duda" },
];

/** foto pequena de uma atração do roteiro de exemplo (id vindo de exemplo-paris.ts) */
export const fotoAtracao = (id: string, w = 440) => foto(id, w);
