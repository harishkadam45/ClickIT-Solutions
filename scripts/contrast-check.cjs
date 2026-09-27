/*
 * Contrast audit: walks the rendered page, finds every visible text node, and
 * computes WCAG contrast against the effective background behind it.
 * Colors are resolved through a canvas so oklch()/color() values work.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL_ = process.argv[2] || 'http://localhost:4342/';
const WIDTH = Number(process.argv[3] || 1440);
const PORT = 9471;
const profile = path.join(os.tmpdir(), 'opencode', 'contrast-profile');
fs.mkdirSync(profile, { recursive: true });
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, `--window-size=${WIDTH},900`, 'about:blank'],
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
  const pending = new Map();
  const errs = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') errs.push(m.params);
  });
  return { errs, send: (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); }) };
}

const AUDIT = String.raw`
(() => {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  // Resolve any CSS color string to [r,g,b,a] in sRGB 0-255 via canvas.
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
  const srgb = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
  const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };

  // Composite every background from <html> down to the element.
  // If a fully-covering absolutely-positioned overlay is painted under the text,
  // it wins outright and nothing behind it is relevant.
  const effBg = (el) => {
    const chain = [];
    let node = el;
    while (node) { chain.push(node); node = node.parentElement; }
    let acc = [255, 255, 255];
    const er = el.getBoundingClientRect();
    for (let i = chain.length - 1; i >= 0; i--) {
      const c = toRGBA(getComputedStyle(chain[i]).backgroundColor);
      if (c[3] > 0) acc = c[3] >= 1 ? [c[0], c[1], c[2]] : over(c, acc);
      for (const k of chain[i].children) {
        if (k === chain[i - 1] || k.contains(el) || el.contains(k)) continue;
        const ks = getComputedStyle(k);
        if (ks.position !== 'absolute' && ks.position !== 'fixed') continue;
        const kr = k.getBoundingClientRect();
        const covers =
          kr.left <= er.left + 1 && kr.right >= er.right - 1 &&
          kr.top <= er.top + 1 && kr.bottom >= er.bottom - 1;
        if (!covers) continue;
        // blend any image/gradient the overlay carries, else its background colour
        let layer = toRGBA(ks.backgroundColor);
        if (ks.backgroundImage !== 'none') {
          const g = toRGBA(ks.backgroundImage.includes('gradient') ? '#000' : ks.backgroundImage);
          layer = g[3] > 0 ? g : layer;
        }
        if (layer[3] > 0) acc = layer[3] >= 1 ? [layer[0], layer[1], layer[2]] : over(layer, acc);
        if (layer[3] >= 0.9) return acc; // fully opaque cover — stop here
      }
    }
    return acc;
  };

  const results = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const txt = n.textContent.trim();
    if (!txt) continue;
    const el = n.parentElement;
    if (!el || el.closest('svg, script, style, option')) continue;
    if (el.closest('#mobile-menu, .invisible, .hidden')) continue;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) continue;
    // gradient-clipped text renders as the gradient, not the transparent color
    if (st.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || st.webkitBackgroundClip === 'text') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const bg = effBg(el);
    const fgRaw = toRGBA(st.color);
    const fg = fgRaw[3] >= 1 ? [fgRaw[0], fgRaw[1], fgRaw[2]] : over(fgRaw, bg);
    const size = parseFloat(st.fontSize);
    const weight = +st.fontWeight || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const cr = ratio(fg, bg);
    const need = large ? 3 : 4.5;
    const key = st.color + '|' + bg.join(',') + '|' + Math.round(size) + '|' + weight;
    if (seen.has(key)) continue;
    seen.add(key);
    if (cr < need) {
      results.push({ text: txt.slice(0, 40), cls: el.className.toString().slice(0, 46), size: Math.round(size), weight, ratio: +cr.toFixed(2), need });
    }
  }
  return results.sort((a, b) => a.ratio - b.ratio);
})()
`;

(async () => {
  const ws = new WebSocket(await getWs());
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const c = cdp(ws);
  await c.send('Runtime.enable');
  await c.send('Page.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: WIDTH < 700 });
  await c.send('Page.navigate', { url: URL_ });
  await sleep(4000);

  const r = await c.send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
  const bad = r.result.value;
  console.log(`@${WIDTH}px — contrast failures: ${bad.length}`);
  bad.forEach((b) =>
    console.log(
      `  ${String(b.ratio).padStart(5)} (need ${b.need})  ${String(b.size).padStart(2)}px/${String(b.weight).padEnd(4)} "${b.text}"\n            .${b.cls}`
    )
  );
  console.log('Runtime exceptions: ' + c.errs.length);
  ws.close();
  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error('FAILED', e); chrome.kill(); process.exit(1); });
