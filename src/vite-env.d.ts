/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EXCHANGERATE_HOST_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
