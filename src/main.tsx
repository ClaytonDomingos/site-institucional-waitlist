import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "@/lib/store";
import { useListaAberta } from "@/lib/rota-lista";
import { Inicio } from "@/pages/Inicio";
import { QuizListaEspera } from "@/components/lista/QuizListaEspera";
import "./index.css";

/* A página e, por cima dela, o quiz da lista de espera (/lista-de-espera). */
function App() {
  const listaAberta = useListaAberta();
  /* quem chega direto pelo link do quiz só carrega a página (mapa, fotos) se fechar o quiz */
  const [comPagina, setComPagina] = useState(!listaAberta);
  useEffect(() => {
    if (!listaAberta) setComPagina(true);
  }, [listaAberta]);

  return (
    <>
      {comPagina && (
        <div inert={listaAberta}>
          <Inicio />
        </div>
      )}
      <QuizListaEspera aberto={listaAberta} />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
