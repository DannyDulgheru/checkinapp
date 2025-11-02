/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUD_API_URL?: string;
  readonly VITE_ENABLE_CLOUD_SYNC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

