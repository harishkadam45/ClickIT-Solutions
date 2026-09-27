import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const DEFAULT_SITE_URL = 'https://www.clickitsolution.co.tz';

/**
 * Keep this in sync with `normaliseSiteUrl` in `src/data/site.ts`.
 *
 * Astro validates `site` at startup, so a bare host ("clickitsolution.co.tz")
 * or a stray value in the hosting dashboard would otherwise fail the build
 * before a single page is rendered.
 */
const normaliseSiteUrl = (raw) => {
  const candidate = (raw ?? '').trim();
  if (!candidate) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
};

export default defineConfig({
  site: normaliseSiteUrl(process.env.PUBLIC_SITE_URL),
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        if (item.url === `${normaliseSiteUrl(process.env.PUBLIC_SITE_URL)}/`) {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
