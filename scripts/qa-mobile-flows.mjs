/**
 * Fluxos por toque no celular: node scripts/qa-mobile-flows.mjs <url> <pasta>
 * Menu, carrossel do catálogo, Peça/Textura, Spotlight, RB Concierge completo e troca de tema.
 */
import { chromium, devices } from '@playwright/test';
const [, , base, out] = process.argv;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const inView = (page, sel) =>
  page.locator(sel).first().evaluate((e) => {
    const r = e.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1;
  });
const CASES = [[375, 812, 'dark'], [320, 568, 'light'], [844, 390, 'dark'], [390, 844, 'light']];
for (const [w, h, theme] of CASES) {
  const ctx = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const tag = `${w}x${h}-${theme}`;
  const log = (...a) => console.log(tag, ...a);
  const shot = (n) => page.screenshot({ path: `${out}/${tag}-${n}.jpg`, quality: 60, type: 'jpeg' });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await shot('00-hero');

  // Menu
  await page.locator('.nav__burger').tap();
  await page.waitForTimeout(700);
  log('menu aberto', await page.locator('#mobile-menu').isVisible(), 'scroll travado', await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden' || document.body.classList.contains('is-locked') || document.documentElement.style.overflow === 'hidden'));
  await shot('01-menu');
  await page.locator('#mobile-menu').getByRole('link', { name: /Produtos/ }).tap();
  await page.waitForTimeout(1400);
  log('menu fechado após navegar', await page.locator('#mobile-menu').isHidden(), 'em #produtos', await page.evaluate(() => Math.abs(document.querySelector('#produtos').getBoundingClientRect().top) < 140));

  // Catálogo: carrossel
  const grid = page.locator('.catalog__grid');
  if (await grid.evaluate((g) => getComputedStyle(g).display === 'flex')) {
    await grid.evaluate((g) => g.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    const before = await page.locator('.catalog__progress-count').innerText();
    await grid.evaluate((g) => g.scrollBy({ left: g.clientWidth * 1.8 }));
    await page.waitForTimeout(900);
    log('carrossel', before, '->', await page.locator('.catalog__progress-count').innerText(), 'overflow da página', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
    await shot('02-catalog');
    await grid.evaluate((g) => g.scrollTo({ left: 0 }));
    await page.waitForTimeout(500);
  }
  // Peça / Textura por toque
  const card = page.locator('[data-testid=product-card]').first();
  await card.scrollIntoViewIfNeeded();
  await card.getByTestId('view-macro').tap();
  await page.waitForTimeout(900);
  log('textura por toque', await card.getAttribute('data-view'));
  await card.getByTestId('view-studio').tap();
  await page.waitForTimeout(500);
  log('peça por toque', await card.getAttribute('data-view'));
  await card.getByTestId('product-add').tap();
  log('selecionado', await card.getByTestId('product-add').getAttribute('aria-pressed'));
  // Spotlight
  await card.getByRole('button', { name: 'Explorar detalhes' }).tap();
  await page.waitForTimeout(900);
  const spot = page.locator('dialog[open]');
  log('spotlight aberto', await spot.count(), 'sem overflow lateral', await spot.evaluate((d) => d.getBoundingClientRect().right <= innerWidth + 1 && d.scrollWidth <= d.clientWidth + 1));
  await shot('03-spotlight');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Concierge completo
  await page.evaluate(() => document.querySelector('[data-testid=contact-cta]').click());
  await page.waitForTimeout(900);
  const next = page.getByTestId('concierge-next');
  log('etapa 1: avançar visível', await inView(page, '[data-testid=concierge-next]'));
  await shot('04-c1');
  const radios = page.getByRole('radio', { name: 'Restaurante' });
  if (!(await radios.isChecked())) {
    await next.tap();
    await page.waitForTimeout(400);
    log('validação na etapa 1 sem seleção', await page.locator('dialog[open] [role=alert]').count());
    await radios.check();
  }
  await next.tap();
  await page.waitForTimeout(500);
  const cupim = page.getByRole('checkbox', { name: 'Cupim' });
  if (!(await cupim.isChecked())) await cupim.check();
  await next.tap();
  await page.waitForTimeout(700);
  await shot('05-c3');
  const fieldOk = await page.locator('dialog[open] input:not([type=checkbox]):not([type=radio]), dialog[open] select, dialog[open] textarea').evaluateAll((els) =>
    els.filter((e) => e.offsetParent).map((e) => {
      const r = e.getBoundingClientRect();
      const d = e.closest('dialog').getBoundingClientRect();
      return r.left >= d.left - 1 && r.right <= d.right + 1 && parseFloat(getComputedStyle(e).fontSize) >= 16;
    }),
  );
  log('etapa 3: campos', fieldOk.length, 'todos dentro do painel e >=16px', fieldOk.every(Boolean));
  const ta = page.locator('dialog[open] textarea').first();
  await ta.tap();
  await ta.fill('Bifes de 180 g');
  log('etapa 3: campo focado visível acima do rodapé', await ta.evaluate((t) => t.getBoundingClientRect().bottom <= document.querySelector('.concierge__foot').getBoundingClientRect().top + 1));
  await next.tap();
  await page.waitForTimeout(700);
  await shot('06-c4');
  log('etapa 4: rodapé visível', await inView(page, '.concierge__foot'));
  await page.locator('dialog[open] .concierge__foot').getByRole('button', { name: /Voltar/ }).tap();
  await page.waitForTimeout(700);
  log('dados preservados ao voltar', JSON.stringify(await page.locator('dialog[open] textarea').first().inputValue()));
  await page.locator('dialog[open] .concierge__foot').getByRole('button', { name: /Voltar/ }).tap();
  await page.waitForTimeout(600);
  log('seleção mantida', await page.getByRole('checkbox', { name: 'Cupim' }).isChecked());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Tema pelo menu
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.locator('.nav__burger').tap();
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator('#mobile-menu [data-testid=theme-toggle]').tap();
  await page.waitForTimeout(1200);
  log('tema', before, '->', await page.evaluate(() => document.documentElement.dataset.theme), 'transição encerrada', await page.evaluate(() => !document.documentElement.classList.contains('theme-anim')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  log('menu fechado com Esc', await page.locator('#mobile-menu').isHidden(), '| erros JS:', errors.length ? errors.join(' ; ') : 'nenhum');
  await ctx.close();
}
await browser.close();
