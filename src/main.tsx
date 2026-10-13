import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "@/lib/store";
import { Inicio } from "@/pages/Inicio";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <Inicio />
    </AppProvider>
  </StrictMode>,
);
