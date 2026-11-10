/**
 * Snapshot de layout desktop (geometria + estilos computados de todos os elementos), com movimento reduzido
 * para ser determinístico. Uso: node scripts/qa-desktop-snapshot.mjs <url> <saida.json>
 * Compare dois snapshots com: node scripts/qa-desktop-snapshot.mjs --diff a.json b.json
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

if (process.argv[2] === '--diff') {
  const [a, b] = [process.argv[3], process.argv[4]].map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  let diffs = 0;
  // Elementos com display:none não são renderizados (ex.: indicador exclusivo do celular).
  const shown = (l) => l.filter((x) => !/ d+,-?d+,d+xd+ none|/.test(x));
  for (const key of Object.keys(a)) {
    const A = shown(a[key]), B = shown(b[key] ?? []);
    if (A.length !== B.length) console.log(key, 'contagem de elementos', A.length, '→', B.length);
    const n = Math.min(A.length, B.length);
    for (let i = 0; i < n; i++) if (A[i] !== B[i]) { if (diffs++ < 40) console.log(key, '\n  antes:', A[i], '\n  depois:', B[i]); }
  }
  console.log(diffs ? `${diffs} diferença(s)` : 'Nenhuma diferença de layout ou estilo.');
  process.exit(0);
}

const [, , base, out] = process.argv;
const browser = await chromium.launch();
const result = {};
for (const theme of ['dark', 'light']) {
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    result[`${theme}-${w}`] = await page.evaluate(() => {
      const props = ['display', 'position', 'font-size', 'line-height', 'color', 'background-color', 'padding', 'margin', 'gap', 'grid-template-columns', 'border-top', 'border-bottom', 'opacity', 'transform', 'clip-path', 'mask-image', 'flex-direction'];
      return [...document.querySelectorAll('body *')].filter((e) => !e.closest('dialog')).map((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        const id = e.tagName + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '');
        return `${id} ${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)} ` + props.map((p) => cs.getPropertyValue(p)).join('|');
      });
    });
    await ctx.close();
  }
}
fs.writeFileSync(out, JSON.stringify(result));
console.log('snapshot', Object.keys(result).map((k) => `${k}:${result[k].length}`).join(' '));
await browser.close();
