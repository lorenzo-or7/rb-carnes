/**
 * Auditoria mobile: node scripts/qa-mobile.mjs <url> <pasta> [shots=1]
 * Por viewport e tema: overflow horizontal, alvos de toque < 44px, inputs < 16px (zoom iOS),
 * textos < 11px e capturas por seção.
 */
import { chromium, devices } from '@playwright/test';
const [, , base, out, shots = '1'] = process.argv;
const VIEWPORTS = [[320, 568], [360, 800], [375, 812], [390, 844], [393, 852], [414, 896], [430, 932], [844, 390], [768, 1024]];
const SECTIONS = ['#inicio', '#manifesto', '#historia', '#imprensa', '#produtos', '#sob-medida', '#food-service', '#solucoes', '#contato', '#rodape'];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const theme of ['dark', 'light']) {
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: w, height: h }, screen: { width: w, height: h }, deviceScaleFactor: 1 });
    await ctx.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    // percorre a página para disparar revelações
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.6) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
    await page.waitForTimeout(600);
    const audit = await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[aria-hidden="true"]') && !e.closest('dialog:not([open])'); };
      const name = (e) => (e.getAttribute('aria-label') || e.textContent || e.className || e.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 40);
      const small = [...document.querySelectorAll('a, button, input, select, textarea, [role="tab"]')].filter(vis).filter((e) => {
        const r = e.getBoundingClientRect();
        if (e.matches('input[type=checkbox], input[type=radio]')) return false; // rótulo é o alvo
        const inline = e.matches('p a, li a:not(.btn), .footer a, .note a');
        return !inline && (r.height < 44 || r.width < 44);
      }).map((e) => `${name(e)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
      const inputs = [...document.querySelectorAll('input, select, textarea')].filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.name || e.id || e.type);
      const tiny = [...document.querySelectorAll('body *')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).filter(vis).filter((e) => parseFloat(getComputedStyle(e).fontSize) < 11).map((e) => `${name(e)} ${getComputedStyle(e).fontSize}`);
      const wide = [...document.querySelectorAll('body *')].filter(vis).filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && !e.closest('.marquee, .solutions__tabs, .cuts__tabs, .catalog__filters, .catalog__grid'); }).map((e) => `${e.className || e.tagName} ${Math.round(e.getBoundingClientRect().right)}`).slice(0, 6);
      return { overflowX: document.documentElement.scrollWidth > innerWidth, wide, small: [...new Set(small)].slice(0, 30), inputs, tiny: [...new Set(tiny)].slice(0, 20) };
    });
    console.log(`\n== ${theme} ${w}x${h}`, errors.length ? 'ERROS ' + errors.join(';') : '');
    console.log(JSON.stringify(audit, null, 0));
    if (shots === '1' && (theme === 'dark' || w === 390)) {
      for (const s of SECTIONS) {
        await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - (sel === '#inicio' ? 9999 : 0)); }, s);
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${out}/${theme}-${w}x${h}-${s.slice(1)}.jpg`, quality: 60, type: 'jpeg' });
      }
    }
    await ctx.close();
  }
}
await browser.close();
