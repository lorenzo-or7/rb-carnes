import { test, expect, type Page } from '@playwright/test';

/** Experiência mobile por toque (projeto "mobile", Pixel 7 com touch). */
test.skip(({ isMobile }) => !isMobile, 'fluxos de toque rodam no projeto mobile');

/** Nenhum elemento visível do diálogo aberto passa das bordas da tela. */
const dialogOverflow = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('dialog[open] *')]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
      })
      .map((e) => `${e.tagName}.${(e as HTMLElement).className}`)
      .slice(0, 5),
  );

test('hero vertical: arte inteira, headline e CTAs visíveis, sem faixa abaixo da arte', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeInViewport();
  const g = await page.evaluate(() => {
    const v = document.querySelector('.hero__visual')!.getBoundingClientRect();
    const s = document.querySelector('.hero__stage')!.getBoundingClientRect();
    return { below: Math.abs(v.bottom - s.bottom), fullWidth: Math.abs(s.width - innerWidth) };
  });
  expect(g.below).toBeLessThan(2);
  expect(g.fullWidth).toBeLessThan(2);
  for (const sel of ['.hero__ctas .btn--primary', '.hero__ctas .btn--link']) {
    const b = (await page.locator(sel).boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
});

test('paisagem 844×390: split lateral, headline e arte inteira na primeira tela', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeInViewport();
  const stageBottom = await page.locator('.hero__stage').evaluate((e) => e.getBoundingClientRect().bottom);
  expect(stageBottom).toBeLessThanOrEqual(391);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test('menu mobile: abre, fecha com animação de saída, navega e alterna o tema', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav__burger').tap();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar menu' }).last().tap();
  await expect(page.locator('#mobile-menu')).toHaveClass(/is-closing/);
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await page.locator('.nav__burger').tap();
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator('#mobile-menu [data-testid=theme-toggle]').tap();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).not.toBe(before);
  await page.locator('#mobile-menu').getByRole('link', { name: /Produtos/ }).tap();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#catalog-title')).toBeInViewport();
});

test('catálogo por toque: faixa deslizável com progresso, filtros e Peça/Textura sem hover', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#produtos');
  const grid = page.locator('.catalog__grid');
  expect(await grid.evaluate((g) => getComputedStyle(g).scrollSnapType)).toContain('x');
  const count = page.locator('.catalog__progress-count');
  await expect(count).toHaveText(/01\s*\/\s*08/);
  await grid.evaluate((g) => g.scrollBy({ left: g.clientWidth * 1.8 }));
  await expect(count).not.toHaveText(/01\s*\//);
  // trocar o filtro volta ao início da faixa
  await page.locator('.catalog__filters').getByRole('button', { name: /Bovinos/ }).tap();
  await expect(count).toHaveText(/^01/);
  const card = page.locator('[data-testid=product-card]').first();
  await card.getByTestId('view-macro').tap();
  await expect(card).toHaveAttribute('data-view', 'macro');
  await card.getByTestId('view-studio').tap();
  await expect(card).toHaveAttribute('data-view', 'studio');
  for (const id of ['view-macro', 'product-add']) {
    expect((await card.getByTestId(id).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await card.getByTestId('product-add').tap();
  await expect(card.getByTestId('product-add')).toHaveAttribute('aria-pressed', 'true');
});

test('Cortes Sob Medida: as cinco opções visíveis sem rolagem lateral (360 px)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/#sob-medida');
  const tabs = page.locator('.cuts__tab');
  await expect(tabs).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    const b = (await tabs.nth(i).boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(361);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
  await tabs.nth(3).tap();
  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
});

test('RB Concierge em 320×568: quatro etapas sem nada cortado, rodapé visível e dados preservados', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/#contato');
  await page.getByTestId('contact-cta').tap();
  const next = page.getByTestId('concierge-next');
  await expect(next).toBeInViewport();
  expect(await dialogOverflow(page)).toEqual([]);
  await page.getByRole('radio', { name: 'Restaurante' }).check();
  await next.tap();
  await page.getByRole('checkbox', { name: 'Cupim' }).check();
  expect(await dialogOverflow(page)).toEqual([]);
  await next.tap();
  const notes = page.locator('dialog[open] textarea').first();
  await notes.fill('Bifes de 180 g');
  const sizes = await page.locator('dialog[open] input:not([type=checkbox]):not([type=radio]), dialog[open] select, dialog[open] textarea').evaluateAll((els) =>
    els.filter((e) => (e as HTMLElement).offsetParent).map((e) => parseFloat(getComputedStyle(e).fontSize)),
  );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(16); // sem zoom automático no iOS
  expect(await dialogOverflow(page)).toEqual([]);
  await next.tap();
  expect(await dialogOverflow(page)).toEqual([]);
  await expect(page.locator('dialog[open] .concierge__foot')).toBeInViewport({ ratio: 1 });
  await page.locator('dialog[open] .concierge__foot').getByRole('button', { name: /Voltar/ }).tap();
  await expect(page.locator('dialog[open] textarea').first()).toHaveValue('Bifes de 180 g');
  await page.locator('dialog[open] .concierge__foot').getByRole('button', { name: /Voltar/ }).tap();
  await expect(page.getByRole('checkbox', { name: 'Cupim' })).toBeChecked();
});

test('Product Spotlight em 320 px: sem estouro lateral e fecha com o botão', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/#produtos');
  await page.locator('[data-testid=product-card]').first().getByRole('button', { name: 'Explorar detalhes' }).tap();
  await expect(page.locator('dialog[open]')).toBeVisible();
  expect(await page.locator('dialog[open]').evaluate((d) => d.scrollWidth - d.clientWidth)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});
