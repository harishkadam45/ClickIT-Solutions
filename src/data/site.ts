export const site = {
  name: 'ClickIT Solutions',
  legalName: 'ClickIT Solutions Tanzania',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://www.clickitsolution.co.tz',
  tagline: 'We build technology around the way your business works.',
  description:
    'ClickIT Solutions is a Tanzanian software development company building custom software, mobile apps, web platforms and business automation systems for SMEs, corporates and institutions.',
  locale: 'en_TZ',
  address: {
    locality: 'Dar es Salaam',
    region: 'Dar es Salaam',
    country: 'Tanzania',
    countryCode: 'TZ',
  },
  contact: {
    phoneDisplay: import.meta.env.PUBLIC_PHONE_DISPLAY ?? '+255 754 000 000',
    phoneE164: import.meta.env.PUBLIC_PHONE_E164 ?? '+255754000000',
    whatsapp: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '255754000000',
    waMessage:
      import.meta.env.PUBLIC_WA_MESSAGE ??
      "Hello ClickIT Solutions, I'd like to discuss a project.",
    email: 'info@clickitsolution.co.tz',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/clickit-solutions',
    x: 'https://x.com/clickitsolutions',
    facebook: 'https://www.facebook.com/clickitsolutions',
  },
  form: {
    // Point this at your CRM / form endpoint (Formspree, Basin, a Next.js API route, etc).
    // Leave empty in demo mode — submissions are validated and logged client-side only.
    endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
  },
  analytics: {
    gaId: import.meta.env.PUBLIC_GA_MEASUREMENT_ID ?? '',
    gtmId: import.meta.env.PUBLIC_GTM_ID ?? '',
    gadsId: import.meta.env.PUBLIC_GADS_ID ?? '',
    dataLayerName: import.meta.env.PUBLIC_GTM_DATA_LAYER_NAME ?? 'dataLayer',
  },
} as const;

export const waLink = (message: string) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;

export const telLink = `tel:${site.contact.phoneE164}`;

/** Event names pushed to the data layer for GTM / GA4 / Google Ads conversions. */
export const TRACK = {
  whatsapp: 'cta_whatsapp_click',
  phone: 'cta_phone_click',
  formStart: 'lead_form_start',
  formSubmit: 'lead_form_submit',
  formSuccess: 'lead_form_success',
  formError: 'lead_form_error',
  consultation: 'cta_consultation_click',
  nav: 'nav_click',
  caseStudy: 'case_study_click',
} as const;
