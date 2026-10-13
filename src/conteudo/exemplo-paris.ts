/* ---------------------------------------------------------------------------
   Roteiro de exemplo "Paris em 5 dias: cultural e gastronômico", exportado do app do
   protótipo (criarSeed() → roteiro "exemplo-paris", montado pelo próprio
   gerador do Meu Guia). Coordenadas conferidas no Nominatim e margem do Sena
   calculada com a geometria real do rio (pnpm validar:geo no app).
   `foto` é o id da foto no Unsplash (images.unsplash.com/photo-<id>).
   NÃO edite à mão: gere de novo com scripts/exportar-exemplo.ts.
--------------------------------------------------------------------------- */

export type Margem = "norte" | "sul" | null;
export type ModoTrecho = "a_pe" | "transporte_publico" | "taxi_app" | "carro" | "trem";

export interface ParadaExemplo {
  /** número da parada no dia; refeição não tem número */
  numero: number | null;
  nome: string;
  lat: number;
  lng: number;
  inicio: string;
  fim: string;
  margem: Margem;
  /** trecho recomendado até aqui (da parada anterior ou da hospedagem) */
  trecho: { modo: ModoTrecho; min: number; km: number } | null;
  foto: string | null;
}

export interface DiaExemplo {
  numero: number;
  cor: string;
  tema: string;
  distanciaKm: number;
  deslocamentoMin: number;
  /** bate-volta fora da cidade (Versalhes): não entra no enquadramento de "todos os dias" */
  foraDoCentro: boolean;
  paradas: ParadaExemplo[];
}

export const EXEMPLO = {
  titulo: "Paris em 5 dias: cultural e gastronômico",
  destino: "Paris",
  qtdDias: 5,
  hospedagem: { nome: "Hotel Rive Gauche, Rue Cler, 7º arr.", endereco: "Rue Cler, 75007 Paris", lat: 48.8566, lng: 2.3065, margem: "sul" as Margem },
  dias: [
    {
      numero: 1, cor: "#2563eb", tema: "Champs-Élysées e Rive Gauche", distanciaKm: 9.1, deslocamentoMin: 93, foraDoCentro: false,
      paradas: [
        { numero: 1, nome: "Torre Eiffel", lat: 48.8584, lng: 2.2945, inicio: "09:30", fim: "12:00", margem: "sul", trecho: { modo: "a_pe", min: 12, km: 1.2 }, foto: "1492136344046-866c85e0bf04" },
        { numero: null, nome: "Almoço: Rue Cler", lat: 48.8566, lng: 2.3063, inicio: "12:12", fim: "13:12", margem: "sul", trecho: { modo: "a_pe", min: 12, km: 1.2 }, foto: "1639873179448-2e7eb329d3aa" },
        { numero: 2, nome: "Trocadéro", lat: 48.8616, lng: 2.2893, inicio: "13:27", fim: "13:57", margem: "norte", trecho: { modo: "transporte_publico", min: 15, km: 1.8 }, foto: "1758066277646-66d7eff85a66" },
        { numero: 3, nome: "Arco do Triunfo", lat: 48.8738, lng: 2.295, inicio: "14:09", fim: "15:09", margem: "norte", trecho: { modo: "transporte_publico", min: 12, km: 1.8 }, foto: "1570168201769-8f2ca2e012de" },
        { numero: 4, nome: "Avenida Champs-Élysées", lat: 48.87039, lng: 2.3061, inicio: "15:25", fim: "16:25", margem: "norte", trecho: { modo: "a_pe", min: 16, km: 1.2 }, foto: "1652117525190-8de4b7d2fc0f" },
        { numero: 5, nome: "Cruzeiro no Sena (Bateaux-Mouches)", lat: 48.86398, lng: 2.30583, inicio: "16:37", fim: "17:47", margem: "norte", trecho: { modo: "a_pe", min: 12, km: 0.9 }, foto: "1783281069416-324a79d74ed7" },
      ],
    },
    {
      numero: 2, cor: "#e11d48", tema: "Île de la Cité e Saint-Germain", distanciaKm: 10, deslocamentoMin: 94, foraDoCentro: false,
      paradas: [
        { numero: 1, nome: "Saint-Germain-des-Prés e Café de Flore", lat: 48.8541, lng: 2.3326, inicio: "09:17", fim: "10:17", margem: "sul", trecho: { modo: "transporte_publico", min: 17, km: 2.5 }, foto: "1639873179448-2e7eb329d3aa" },
        { numero: 2, nome: "Sainte-Chapelle", lat: 48.8554, lng: 2.345, inicio: "10:33", fim: "11:18", margem: "sul", trecho: { modo: "a_pe", min: 16, km: 1.2 }, foto: "1748191638282-bf40b13f3a85" },
        { numero: 3, nome: "Shakespeare and Company", lat: 48.8526, lng: 2.3471, inicio: "11:24", fim: "11:54", margem: "sul", trecho: { modo: "a_pe", min: 6, km: 0.5 }, foto: "1731601815528-e1ac3ef1b35e" },
        { numero: 4, nome: "Catedral de Notre-Dame", lat: 48.853, lng: 2.3499, inicio: "11:57", fim: "12:57", margem: "sul", trecho: { modo: "a_pe", min: 3, km: 0.3 }, foto: "1513542272484-57862fedb178" },
        { numero: null, nome: "Almoço: Brasserie de l'Isle Saint-Louis", lat: 48.85309, lng: 2.35331, inicio: "13:01", fim: "14:16", margem: "norte", trecho: { modo: "a_pe", min: 4, km: 0.3 }, foto: "1639873179448-2e7eb329d3aa" },
        { numero: 5, nome: "Panthéon", lat: 48.8462, lng: 2.3464, inicio: "14:32", fim: "15:32", margem: "sul", trecho: { modo: "a_pe", min: 16, km: 1.2 }, foto: "1565200380227-ede88b62b5a0" },
        { numero: 6, nome: "Igreja de Saint-Sulpice", lat: 48.851, lng: 2.3348, inicio: "15:46", fim: "16:16", margem: "sul", trecho: { modo: "transporte_publico", min: 14, km: 1.3 }, foto: "1636562705007-67a52b138df8" },
      ],
    },
    {
      numero: 3, cor: "#059669", tema: "Bate-volta: Palácio de Versalhes", distanciaKm: 38.4, deslocamentoMin: 110, foraDoCentro: true,
      paradas: [
        { numero: 1, nome: "Palácio de Versalhes", lat: 48.8049, lng: 2.1204, inicio: "09:55", fim: "16:55", margem: null, trecho: { modo: "trem", min: 55, km: 19.2 }, foto: "1667752920461-a5ea0883f438" },
      ],
    },
    {
      numero: 4, cor: "#d97706", tema: "Rive Gauche e Champs-Élysées", distanciaKm: 5.6, deslocamentoMin: 67, foraDoCentro: false,
      paradas: [
        { numero: 1, nome: "Museu Rodin", lat: 48.8553, lng: 2.3159, inicio: "10:00", fim: "11:30", margem: "sul", trecho: { modo: "a_pe", min: 12, km: 0.9 }, foto: "1653987255814-3b4c05832660" },
        { numero: 2, nome: "Museu d'Orsay", lat: 48.86, lng: 2.3266, inicio: "11:43", fim: "14:13", margem: "sul", trecho: { modo: "transporte_publico", min: 13, km: 1.2 }, foto: "1632127252270-fa39432977a5" },
        { numero: null, nome: "Almoço: Angelina (Rue de Rivoli)", lat: 48.86508, lng: 2.32841, inicio: "14:23", fim: "15:23", margem: "norte", trecho: { modo: "a_pe", min: 10, km: 0.8 }, foto: "1639873179448-2e7eb329d3aa" },
        { numero: 3, nome: "Place de la Concorde", lat: 48.8656, lng: 2.3212, inicio: "15:32", fim: "15:52", margem: "norte", trecho: { modo: "a_pe", min: 9, km: 0.7 }, foto: "1663247070205-59e9ebca3666" },
        { numero: 4, nome: "Pont Alexandre III", lat: 48.8639, lng: 2.3136, inicio: "16:02", fim: "16:22", margem: "norte", trecho: { modo: "a_pe", min: 10, km: 0.8 }, foto: "1758066277905-ea3fd91a864a" },
      ],
    },
    {
      numero: 5, cor: "#7c3aed", tema: "Montmartre e Louvre", distanciaKm: 12.9, deslocamentoMin: 100, foraDoCentro: false,
      paradas: [
        { numero: 1, nome: "Museu do Louvre", lat: 48.8606, lng: 2.3376, inicio: "09:25", fim: "11:55", margem: "norte", trecho: { modo: "transporte_publico", min: 25, km: 3 }, foto: "1743880475189-e36f80868bcc" },
        { numero: 2, nome: "Basílica de Sacré-Cœur", lat: 48.8867, lng: 2.3431, inicio: "12:15", fim: "13:15", margem: "norte", trecho: { modo: "transporte_publico", min: 20, km: 3.8 }, foto: "1643374547446-86fcb60017e1" },
        { numero: null, nome: "Almoço: La Maison Rose", lat: 48.88799, lng: 2.33965, inicio: "13:20", fim: "14:35", margem: "norte", trecho: { modo: "a_pe", min: 5, km: 0.4 }, foto: "1639873179448-2e7eb329d3aa" },
        { numero: 3, nome: "Place du Tertre", lat: 48.8865, lng: 2.3408, inicio: "14:40", fim: "15:25", margem: "norte", trecho: { modo: "a_pe", min: 5, km: 0.2 }, foto: "1650774894412-f3b3d081674c" },
        { numero: 4, nome: "Galeries Lafayette", lat: 48.8738, lng: 2.332, inicio: "15:41", fim: "16:41", margem: "norte", trecho: { modo: "transporte_publico", min: 16, km: 2 }, foto: "1715634091312-6485f925790a" },
        { numero: 5, nome: "Igreja da Madeleine", lat: 48.87, lng: 2.3245, inicio: "16:53", fim: "17:23", margem: "norte", trecho: { modo: "a_pe", min: 12, km: 0.9 }, foto: "1636562705007-67a52b138df8" },
      ],
    },
  ] as DiaExemplo[],
};
