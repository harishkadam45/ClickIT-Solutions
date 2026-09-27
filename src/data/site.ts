const DEFAULT_SITE_URL = 'https://www.clickitsolution.co.tz';

/**
 * Coerce whatever is in PUBLIC_SITE_URL into a valid absolute URL.
 *
 * A bare host ("clickitsolution.co.tz"), a value with stray whitespace, or an
 * empty variable are all common mistakes in a hosting dashboard, and any of
 * them makes `new URL(path, siteUrl)` throw "Invalid URL" at build time.
 * Normalise here so a misconfigured env var can never break the build.
 */
const normaliseSiteUrl = (raw: string | undefined): string => {
  const candidate = (raw ?? '').trim();
  if (!candidate) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
  } catch {
    console.warn(
      `[site] Ignoring invalid PUBLIC_SITE_URL "${candidate}" — falling back to ${DEFAULT_SITE_URL}`
    );
    return DEFAULT_SITE_URL;
  }
};

/** Trim optional strings so an empty env var never leaks in as `""`. */
const optional = (value: string | undefined, fallback = ''): string =>
  (value ?? '').trim() || fallback;

export const site = {
  name: 'ClickIT Solutions',
  legalName: 'ClickIT Solutions Tanzania',
  url: normaliseSiteUrl(import.meta.env.PUBLIC_SITE_URL),
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
    phoneDisplay: optional(import.meta.env.PUBLIC_PHONE_DISPLAY, '+255 754 000 000'),
    phoneE164: optional(import.meta.env.PUBLIC_PHONE_E164, '+255754000000'),
    whatsapp: optional(import.meta.env.PUBLIC_WHATSAPP_NUMBER, '255754000000'),
    waMessage: optional(
      import.meta.env.PUBLIC_WA_MESSAGE,
      "Hello ClickIT Solutions, I'd like to discuss a project."
    ),
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
    endpoint: optional(import.meta.env.PUBLIC_FORM_ENDPOINT),
  },
  analytics: {
    gaId: optional(import.meta.env.PUBLIC_GA_MEASUREMENT_ID),
    gtmId: optional(import.meta.env.PUBLIC_GTM_ID),
    gadsId: optional(import.meta.env.PUBLIC_GADS_ID),
    dataLayerName: optional(import.meta.env.PUBLIC_GTM_DATA_LAYER_NAME, 'dataLayer'),
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
