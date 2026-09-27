/*
 * Build verification: heading outline, meta tags, alt text, payload size.
 * Usage: npm run build && npm run verify
 */
const fs = require('fs');
const zlib = require('zlib');

const file = 'dist/index.html';
if (!fs.existsSync(file)) {
  console.error('dist/index.html not found — run `npm run build` first.');
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');
const gzip = (s) => zlib.gzipSync(s).length;
let failures = 0;
const check = (label, pass, detail = '') => {
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
};

console.log('--- headings ---');
const headings = [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => ({
  level: Number(m[1][1]),
  text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
}));
const h1s = headings.filter((h) => h.level === 1);
check('exactly one <h1>', h1s.length === 1, h1s.map((h) => h.text).join(' | '));
let prev = 0;
let skip = null;
for (const h of headings) {
  if (prev && h.level > prev + 1) skip = `h${prev} -> h${h.level} at "${h.text}"`;
  prev = h.level;
}
check('no skipped heading levels', !skip, skip || '');
console.log(`      h2: ${headings.filter((h) => h.level === 2).length}  h3: ${headings.filter((h) => h.level === 3).length}`);

console.log('\n--- meta ---');
const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || '';
const desc = (html.match(/<meta name="description" content="(.*?)"/) || [])[1] || '';
check('title present', title.length > 0, `${title.length} chars`);
check('title 30–65 chars', title.length >= 30 && title.length <= 65, `${title.length}`);
check('description 70–165 chars', desc.length >= 70 && desc.length <= 165, `${desc.length}`);
for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'twitter:card']) {
  check(`${p} present`, html.includes(`property="${p}"`) || html.includes(`name="${p}"`) || html.includes(`"${p}"`));
}
check('canonical present', /<link rel="canonical"/.test(html));
check('robots meta present', /<meta name="robots"/.test(html));
check('html lang set', /<html lang="en-TZ"/.test(html));
check('viewport meta present', /name="viewport"/.test(html));
check('font preloads present', (html.match(/rel="preload"[^>]*as="font"/g) || []).length === 2);

console.log('\n--- structured data ---');
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
check('JSON-LD blocks present', ld.length > 0, `${ld.length} blocks`);
const types = new Set();
let parsed = 0;
for (const [, raw] of ld) {
  try {
    const j = JSON.parse(raw);
    parsed++;
    const walk = (o) => {
      if (!o || typeof o !== 'object') return;
      if (o['@type']) [].concat(o['@type']).forEach((t) => types.add(t));
      for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v);
    };
    walk(j);
  } catch (e) {
    check('JSON-LD parses', false, e.message);
  }
}
console.log('      types:', [...types].join(', '));
for (const t of ['Organization', 'WebSite', 'WebPage', 'LocalBusiness', 'Service', 'FAQPage', 'BreadcrumbList']) {
  check(`schema ${t}`, types.has(t));
}

console.log('\n--- accessibility & links ---');
const imgs = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
check('all <img> have alt', imgs.every((i) => /alt=/.test(i)), `${imgs.length} images`);
const noHref = [...html.matchAll(/<a(?=[\s>])(?![^>]*\shref=)[^>]*>/g)];
check('all <a> have href', noHref.length === 0, `${noHref.length} without`);
check('skip link present', /Skip to main content/.test(html));
check('single <main>', (html.match(/<main/g) || []).length === 1);
check('decorative svgs hidden from AT', !/<svg(?![^>]*aria-hidden)[^>]*>/.test(html.replace(/<svg[^>]*aria-hidden="true"[^>]*>/g, '')));

console.log('\n--- payloads ---');
const assetDir = 'dist/_astro';
const files = fs.readdirSync(assetDir);
const css = files.find((f) => f.endsWith('.css'));
const js = files.filter((f) => f.endsWith('.js'));
const fonts = files.filter((f) => f.endsWith('.woff2'));
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const cssBytes = fs.statSync(`${assetDir}/${css}`).size;
const jsBytes = js.reduce((a, f) => a + fs.statSync(`${assetDir}/${f}`).size, 0);
console.log(`      html          ${kb(html.length)} raw / ${kb(gzip(html))} gzip`);
console.log(`      css           ${kb(cssBytes)} raw / ${kb(gzip(fs.readFileSync(`${assetDir}/${css}`, 'utf8')))} gzip`);
console.log(`      js            ${kb(jsBytes)} (${js.length} file${js.length === 1 ? '' : 's'})`);
console.log(`      fonts         ${fonts.length} subsets (browser fetches latin only)`);
check('html under 40 KB gzip', gzip(html) < 40960, `${kb(gzip(html))}`);
check('css under 20 KB gzip', gzip(fs.readFileSync(`${assetDir}/${css}`, 'utf8')) < 20480);
check('js under 60 KB raw', jsBytes < 61440, `${kb(jsBytes)}`);

console.log('\n--- sitemap & robots ---');
for (const f of ['dist/sitemap-index.xml', 'dist/robots.txt', 'dist/404.html', 'dist/favicon.svg', 'dist/og-image.png']) {
  check(f, fs.existsSync(f));
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
