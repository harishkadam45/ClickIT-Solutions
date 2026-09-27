/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_PHONE_DISPLAY?: string;
  readonly PUBLIC_PHONE_E164?: string;
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  readonly PUBLIC_WA_MESSAGE?: string;
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_GADS_ID?: string;
  readonly PUBLIC_GTM_DATA_LAYER_NAME?: string;
  readonly PUBLIC_FORM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
