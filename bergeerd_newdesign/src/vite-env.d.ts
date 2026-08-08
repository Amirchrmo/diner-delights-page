/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the bergeerd_api public API, e.g. "http://localhost:8080/api". */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
