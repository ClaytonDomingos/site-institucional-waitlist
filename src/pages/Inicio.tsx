import { Cabecalho } from "@/components/secoes/Cabecalho";
import { Hero } from "@/components/secoes/Hero";
import { Funcionalidades, MaisFuncionalidades } from "@/components/secoes/Funcionalidades";
import { ModoViagem } from "@/components/secoes/ModoViagem";
import { Agencias } from "@/components/secoes/Agencias";
import { Destinos } from "@/components/secoes/Destinos";
import { ListaEspera } from "@/components/secoes/ListaEspera";
import { Duvidas } from "@/components/secoes/Duvidas";
import { Rodape } from "@/components/secoes/Rodape";

/* ---------------------------------------------------------------------------
   O site é uma página só. A ordem conta a história do produto: a promessa
   (mapa correto), o que ele faz, para agências,
   onde funciona e, por fim, a lista de espera.
--------------------------------------------------------------------------- */

export function Inicio() {
  return (
    <div className="min-h-full bg-bg">
      <Cabecalho />
      <main>
        <Hero />
        <Funcionalidades />
        <ModoViagem />
        <MaisFuncionalidades />
        <Agencias />
        <Destinos />
        <ListaEspera />
        <Duvidas />
      </main>
      <Rodape />
    </div>
  );
}
