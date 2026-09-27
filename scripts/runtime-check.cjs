/*
 * Runtime smoke test: console errors, unhandled rejections, horizontal overflow,
 * key element visibility, mobile menu, and lead-form submit path.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9474;
const profile = path.join(os.tmpdir(), 'opencode', 'rt-profile');
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
  const errors = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && p.has(m.id)) { const { resolve, reject } = p.get(m.id); p.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text));
    else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type))
      errors.push(m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '));
  });
  return { errors, send: (me, pa = {}) => new Promise((res, rej) => { const i = ++id; p.set(i, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: i, method: me, params: pa })); }) };
}
const ev = async (c, expr) => (await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const URL_ = process.argv[2] || 'http://localhost:4342/';

(async () => {
  const ws = new WebSocket(await getWs());
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const c = cdp(ws);
  await c.send('Runtime.enable'); await c.send('Page.enable');
  let fail = 0;
  const check = (name, ok, extra = '') => { console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  — ' + extra : '')); if (!ok) fail++; };

  for (const W of [1440, 390]) {
    console.log('\n--- ' + W + 'px ---');
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 700 });
    c.errors.length = 0;
    await c.send('Page.navigate', { url: URL_ });
    await sleep(3500);

    const o = await ev(c, `(() => {
      const de = document.documentElement;
      const over = [...document.querySelectorAll('body *')]
        .filter(el => { const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1); })
        .slice(0, 6)
        .map(el => el.tagName.toLowerCase() + '.' + (el.className||'').toString().trim().split(/\\s+/).slice(0,3).join('.'));
      const secs = [...document.querySelectorAll('section[id]')].map(s => {
        const st = getComputedStyle(s); const r = s.getBoundingClientRect();
        return { id: s.id, bg: st.backgroundColor, h: Math.round(r.height) };
      });
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, over, secs,
        h1: document.querySelectorAll('h1').length,
        faq: document.querySelectorAll('details').length,
        forms: document.querySelectorAll('form').length };
    })()`);
    check('no horizontal overflow', o.scrollW <= o.clientW + 1, `scrollW ${o.scrollW} vs ${o.clientW}` + (o.over.length ? ' | ' + o.over.join(', ') : ''));
    check('single h1', o.h1 === 1, String(o.h1));
    check('sections rendered', o.secs.length >= 8, o.secs.length + ' sections');
    check('faq items', o.faq >= 5, String(o.faq));
    check('contact form', o.forms === 1, String(o.forms));
    const nonWhite = o.secs.filter((s) => s.bg !== 'rgb(255, 255, 255)');
    check('all sections white', nonWhite.length === 0, nonWhite.map((s) => s.id + '=' + s.bg).join(', '));

    if (W === 390) {
      const m = await ev(c, `(async () => {
        const btn = document.querySelector('button[aria-controls="mobile-menu"]');
        if (!btn) return { err: 'no toggle' };
        const menu = document.getElementById('mobile-menu');
        btn.click();
        await new Promise(r => setTimeout(r, 700));
        const open = btn.getAttribute('aria-expanded') === 'true';
        const st = getComputedStyle(menu);
        const r = menu.getBoundingClientRect();
        return { open, vis: st.visibility !== 'hidden' && st.opacity !== '0' && r.height > 50, h: Math.round(r.height) };
      })()`);
      check('mobile menu opens', m.open === true && m.vis === true, JSON.stringify(m));

      const c2 = await ev(c, `(async () => {
        const btn = document.querySelector('button[aria-controls="mobile-menu"]');
        btn.click();
        await new Promise(r => setTimeout(r, 700));
        const st = getComputedStyle(document.getElementById('mobile-menu'));
        return { exp: btn.getAttribute('aria-expanded'), vis: st.visibility !== 'hidden' };
      })()`);
      check('mobile menu closes again', c2.exp === 'false' && c2.vis === false, JSON.stringify(c2));
    }

    const f = await ev(c, `(async () => {
      const form = document.querySelector('form');
      if (!form) return { err: 'no form' };
      const req = [...form.querySelectorAll('[required]')];
      const missing = req.filter(el => !el.name).length;
      // satisfy every required control so native validation lets submit through
      let filled = 0;
      for (const el of req) {
        if (el.type === 'checkbox') { if (!el.checked) { el.checked = true; filled++; } continue; }
        if (el.tagName === 'SELECT') {
          const opt = [...el.options].find(o => !o.disabled && o.value !== '');
          if (opt) { el.value = opt.value; filled++; }
          continue;
        }
        if (el.type === 'radio') { if (!el.checked) { el.checked = true; filled++; } continue; }
        if (!el.value) {
          el.value = el.type === 'email' ? 'test@example.com'
            : el.type === 'tel' ? '+255 700 000 000'
            : el.tagName === 'TEXTAREA' ? 'Automated demo-mode verification message.'
            : 'Test User';
          filled++;
        }
      }
      form.requestSubmit();
      await new Promise(r => setTimeout(r, 2000));
      const success = document.getElementById('lead-success');
      const err = document.getElementById('lead-form-error');
      const shown = (el) => el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none';
      return { missing, required: req.length, filled,
        success: shown(success) ? success.textContent.trim().replace(/\\s+/g,' ').slice(0, 60) : null,
        error: shown(err) ? err.textContent.trim().slice(0, 60) : null };
    })()`);
    check('required fields have names', f.missing === 0, f.missing + ' missing of ' + f.required);
    check('all required controls satisfied', f.filled === f.required, f.filled + '/' + f.required);
    check('demo-mode submit shows success state', !!f.success && !f.error, (f.success || f.error || f.err || 'no state'));

    check('no console errors/exceptions', c.errors.length === 0, c.errors.join(' | '));
  }

  console.log(fail === 0 ? '\nALL RUNTIME CHECKS PASSED' : `\n${fail} CHECK(S) FAILED`);
  ws.close(); chrome.kill(); process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error('FAILED', e); chrome.kill(); process.exit(1); });
