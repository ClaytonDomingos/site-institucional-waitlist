/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** endereço da API da lista de espera (/api em produção); sem ele, modo demonstração */
  readonly VITE_LISTA_ESPERA_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
