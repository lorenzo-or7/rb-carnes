/** Capturas de QA por seção: node scripts/qa-shots.mjs <url> <pasta> <largura> <altura> <tema> */
import { chromium } from '@playwright/test';
const [, , base, out, width, height, theme] = process.argv;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: +width, height: +height }, deviceScaleFactor: 1, isMobile: +width < 768, hasTouch: +width < 768 });
await ctx.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base, { waitUntil: 'networkidle' });
const go = (sel, f) =>
  page.evaluate(([s, f]) => {
    const h = document.querySelector(s);
    const top = h.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + Math.max(0, h.offsetHeight - innerHeight) * f);
  }, [sel, f]);
const shots = [
  ['01-hero', '#inicio', 0, 3000],
  ['02-manifesto', '#manifesto', 0.45],
  ['03-arch-intro', '#historia', 0.04, 1800],
  ['04-arch-2001', '#historia', 0.26, 2200],
  ['05-arch-2019', '#historia', 0.55, 2200],
  ['06-arch-2021', '#historia', 0.85, 2200],
  ['07-press', '#imprensa', 0.35],
  ['08-catalog', '#produtos', 0.12],
  ['09-cuts-a', '#sob-medida', 0.05],
  ['10-cuts-b', '#sob-medida', 0.9],
  ['11-food', '.food__screen', 0],
  ['13-sol', '#solucoes', 0.05],
  ['14-contact', '#contato', 0.05],
  ['15-footer', '#rodape', 1],
];
for (const [name, sel, f, wait] of shots) {
  await go(sel, f);
  await page.waitForTimeout(wait ?? 1500);
  await page.screenshot({ path: `${out}/${width}-${theme}-${name}.jpg`, quality: 60, type: 'jpeg' });
}
await page.evaluate(() => document.querySelector('[data-testid=contact-cta]').click());
await page.waitForTimeout(900);
await page.getByRole('radio', { name: 'Restaurante' }).check();
await page.getByTestId('concierge-next').click();
await page.getByRole('checkbox', { name: 'Cupim' }).check();
await page.getByRole('checkbox', { name: 'Cubos' }).check();
await page.getByTestId('concierge-next').click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/${width}-${theme}-21-concierge-step3.jpg`, quality: 60, type: 'jpeg' });
await page.keyboard.press('Escape');
await page.evaluate(() => document.querySelector('#produtos').scrollIntoView());
await page.waitForTimeout(600);
await page.getByRole('button', { name: 'Explorar detalhes' }).first().click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/${width}-${theme}-22-spotlight.jpg`, quality: 60, type: 'jpeg' });
if (errors.length) console.log('ERROS', errors);
await browser.close();
