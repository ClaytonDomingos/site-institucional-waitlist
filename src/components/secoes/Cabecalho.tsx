import { Menu } from "lucide-react";
import { SECOES } from "@/conteudo/site";
import { Button, Dropdown, IconButton, type MenuItem } from "@/components/ui";
import { Marca, ThemeToggle } from "@/components/layout";
import { Container, rolarPara } from "@/components/base";
import { irParaLista } from "@/lib/rota-lista";

/** Cabeçalho fixo: marca, âncoras das seções, tema e a chamada para a lista de espera. */
export function Cabecalho() {
  const itensMenu: MenuItem[] = [
    ...SECOES.map((s) => ({ label: s.label, onClick: () => rolarPara(s.id) })),
    { divider: true },
    { label: "Entrar na lista de espera", onClick: () => irParaLista() },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-3 sm:h-16">
        <Marca onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />

        <nav aria-label="Seções" className="hidden items-center gap-1 lg:flex">
          {SECOES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => rolarPara(s.id)}
              className="focus-ring h-8 rounded-tile px-3 text-body font-medium text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:contents">
            <ThemeToggle compact />
          </span>
          <Button variant="primary" onClick={() => irParaLista()} className="max-sm:h-10">
            Entrar na lista
          </Button>
          <span className="lg:hidden">
            <Dropdown
              width={230}
              items={itensMenu}
              trigger={
                <IconButton label="Menu" className="max-sm:size-10">
                  <Menu />
                </IconButton>
              }
            />
          </span>
        </div>
      </Container>
    </header>
  );
}
