/*
 * Background audit: reports every full-bleed section/header/footer/body surface
 * and every large card surface, so the white-page / gray-card rule can be checked.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9473;
const profile = path.join(os.tmpdir(), 'opencode', 'bg-profile');
fs.mkdirSync(profile, { recursive: true });
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, '--window-size=1440,900', 'about:blank'],
  { stdio: 'ignore' }
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const u = l.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
      if (u) return u;
    } catch {}
    await sleep(250);
  }
  throw new Error('no chrome');
}
function cdp(ws) {
  let id = 0;
  const p = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && p.has(m.id)) { const { resolve, reject } = p.get(m.id); p.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
  });
  return { send: (me, pa = {}) => new Promise((res, rej) => { const i = ++id; p.set(i, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: i, method: me, params: pa })); }) };
}

const AUDIT = String.raw`
(() => {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const toRGBA = (css) => {
    if (cache.has(css)) return cache.get(css);
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = '#000';
    cx.fillStyle = css;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    cache.set(css, out);
    return out;
  };
  const vw = innerWidth;
  const rows = [];
  const label = (el) =>
    (el.id ? '#' + el.id : el.tagName.toLowerCase()) +
    (el.getAttribute('aria-label') ? ' [' + el.getAttribute('aria-label') + ']' : '') +
    (el.className && typeof el.className === 'string' ? ' .' + el.className.trim().split(/\s+/).slice(0, 4).join(' .') : '');

  // full-bleed regions: direct children of body / main / header / footer
  const regions = [
    ...document.querySelectorAll('body > *, main > *, header, footer, main > section > div[aria-hidden]'),
  ];
  const seenRegion = new Set();
  for (const el of regions) {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < vw * 0.9) continue;              // must be full-bleed
    if (r.height < 24) continue;
    const bg = toRGBA(st.backgroundColor);
    if (bg[3] === 0) continue;                    // transparent
    const key = st.backgroundColor;
    if (seenRegion.has(key)) continue;
    seenRegion.add(key);
    rows.push({ kind: 'region', label: label(el), bg: st.backgroundColor, w: Math.round(r.width), h: Math.round(r.height) });
  }

  // card-sized surfaces
  const cards = [...document.querySelectorAll('article, li > div.rounded-2xl, li > div.rounded-3xl, form, .rounded-2xl.border, .rounded-3xl.border')];
  const seenCard = new Set();
  for (const el of cards) {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60) continue;
    const bg = toRGBA(st.backgroundColor);
    if (bg[3] === 0) continue;
    const key = st.backgroundColor;
    if (seenCard.has(key)) continue;
    seenCard.add(key);
    rows.push({ kind: 'card', label: label(el), bg: st.backgroundColor, w: Math.round(r.width), h: Math.round(r.height) });
  }
  return rows;
})()
`;

(async () => {
  const ws = new WebSocket(await getWs());
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const c = cdp(ws);
  await c.send('Runtime.enable'); await c.send('Page.enable');
  await c.send('Page.navigate', { url: process.argv[2] || 'http://localhost:4342/' });
  await sleep(3500);
  const r = await c.send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
  const rows = r.result.value;
  for (const kind of ['region', 'card']) {
    const list = rows.filter((x) => x.kind === kind);
    console.log('\n=== ' + kind.toUpperCase() + ' surfaces (' + list.length + ') ===');
    list.forEach((x) => console.log(`  ${x.bg.padEnd(46)} ${String(x.w).padStart(5)}x${String(x.h).padStart(5)}  ${x.label}`));
  }
  ws.close(); chrome.kill(); process.exit(0);
})().catch((e) => { console.error('FAILED', e); chrome.kill(); process.exit(1); });
