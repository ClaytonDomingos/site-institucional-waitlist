import { Mail, MapPin, Phone } from "lucide-react";
import { EMPRESA, SECOES, SLOGAN } from "@/conteudo/site";
import { Marca, ThemeToggle } from "@/components/layout";
import { Container, rolarPara } from "@/components/base";
import { irParaLista } from "./ListaEspera";

const LINK = "focus-ring rounded-badge text-muted hover:text-fg hover:underline";

export function Rodape() {
  const ano = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid grid-cols-1 gap-8 pt-10 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Marca onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <p className="mt-3 max-w-sm text-body-2 text-muted">
            {SLOGAN.titulo}. {SLOGAN.texto} Curadoria de quem vive de turismo há 25 anos.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
        <nav aria-label="Rodapé" className="lg:col-span-3">
          <p className="text-body font-semibold text-fg">Navegação</p>
          <ul className="mt-3 space-y-2 text-body-2">
            {SECOES.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => rolarPara(s.id)} className={LINK}>
                  {s.label}
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => irParaLista()} className={LINK}>
                Lista de espera
              </button>
            </li>
          </ul>
        </nav>
        <div className="lg:col-span-4">
          <p className="text-body font-semibold text-fg">Contato</p>
          <ul className="mt-3 space-y-2 text-body-2 text-muted">
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <a href={`mailto:${EMPRESA.email}`} className="hover:text-fg hover:underline">
                {EMPRESA.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" /> {EMPRESA.telefone}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {EMPRESA.endereco}
            </li>
          </ul>
        </div>
      </Container>
      <Container className="mt-8 flex flex-col gap-2 border-t border-line py-5 text-caption text-muted sm:flex-row sm:justify-between">
        <span>© {ano} {EMPRESA.nome}</span>
        <span>Fotos: Unsplash · Mapas: © Esri, © OpenStreetMap contributors</span>
      </Container>
    </footer>
  );
}
