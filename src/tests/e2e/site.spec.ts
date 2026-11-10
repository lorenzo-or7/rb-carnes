import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForTimeout(1200);
}

test('rodapé exibe a assinatura Or7 original e não há wordmark gigante', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.querySelector('#rodape')?.scrollIntoView());
  const sig = page.getByTestId('or7-signature').locator('img');
  await expect(sig).toBeVisible();
  await expect(sig).toHaveAttribute('alt', /Lorenzo Orsetti/);
  expect(await sig.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.footer__wordmark')).toHaveCount(0);
});

test('carrega e percorre a página inteira sem erros JS, 404 ou GLB ausente', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A excelência');
  await scrollThrough(page);
  await expect(page.locator('#rodape')).toBeVisible();
  expect(errors.filter((e) => !/GPU stall|swiftshader/i.test(e))).toEqual([]);
});

test('tema persiste após recarregar, aplicado antes do React', async ({ page, isMobile }) => {
  await page.goto('/');
  const initial = await page.evaluate(() => document.documentElement.dataset.theme);
  if (!isMobile) await page.getByTestId('theme-toggle').first().click();
  else {
    await page.getByTestId('nav-burger').click();
    await page.locator('#mobile-menu [data-testid=theme-toggle]').click();
    await page.keyboard.press('Escape');
  }
  const next = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(next).not.toBe(initial);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(next);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(next === 'light' ? 'rgb(248, 245, 239)' : 'rgb(11, 10, 9)');
});

test('catálogo: filtro, seleção e remoção', async ({ page }) => {
  await page.goto('/#produtos');
  await page.getByRole('button', { name: /^Suínos/ }).click();
  await expect(page.getByTestId('product-card')).toHaveCount(2);
  const add = page.getByTestId('product-add').first();
  await add.scrollIntoViewIfNeeded();
  await add.click();
  await expect(add).toHaveAttribute('aria-pressed', 'true');
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('rb-concierge-selection') || '{}').items.length);
  expect(stored).toBe(1);
  await add.click();
  await expect(add).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: /^Todos/ }).click();
  await expect(page.getByTestId('product-card')).toHaveCount(8);
  await page.getByTestId('catalog-more').click();
  await expect(page.getByTestId('product-card')).toHaveCount(22);
  await expect(page.getByTestId('catalog-more')).toHaveAttribute('aria-expanded', 'true');
  await page.getByTestId('catalog-more').click();
  await expect(page.getByTestId('product-card')).toHaveCount(8);
});

test('Peça ↔ Textura: alternância repetida, por clique e teclado, sem estado preso', async ({ page }) => {
  await page.goto('/#produtos');
  const card = page.getByTestId('product-card').first();
  const peca = card.getByTestId('view-studio');
  const textura = card.getByTestId('view-macro');
  for (let i = 0; i < 4; i++) {
    await textura.click();
    await expect(card).toHaveAttribute('data-view', 'macro');
    await expect(textura).toHaveAttribute('aria-pressed', 'true');
    await peca.click();
    await expect(card).toHaveAttribute('data-view', 'studio');
    await expect(peca).toHaveAttribute('aria-pressed', 'true');
  }
  // foco permanece no botão e a imagem continua coerente (bug anterior: :focus-within prendia a textura)
  await expect(peca).toBeFocused();
  // aguarda o fim do crossfade (0,6 s) e confirma que a textura saiu de cena
  await expect.poll(async () => Number(await card.locator('.pcard__layer--macro').evaluate((e) => getComputedStyle(e).opacity)), { timeout: 3000 }).toBeLessThan(0.05);
  // teclado
  await textura.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('data-view', 'macro');
  await peca.focus();
  await page.keyboard.press('Space');
  await expect(card).toHaveAttribute('data-view', 'studio');
  // filtro não quebra a alternância
  await page.getByRole('button', { name: /^Suínos/ }).click();
  const c2 = page.getByTestId('product-card').first();
  await c2.getByTestId('view-macro').click();
  await expect(c2).toHaveAttribute('data-view', 'macro');
  await c2.getByTestId('view-studio').click();
  await expect(c2).toHaveAttribute('data-view', 'studio');
});

test('Product Spotlight abre, alterna textura e fecha com Escape devolvendo o foco', async ({ page }) => {
  await page.goto('/#produtos');
  const btn = page.getByRole('button', { name: 'Explorar detalhes' }).first();
  // caminho de teclado: foco + Enter (o trilho traz o card para a vista)
  await btn.focus();
  await page.keyboard.press('Enter');
  const dlg = page.getByTestId('spotlight');
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button', { name: 'Textura' }).click();
  await expect(dlg.getByRole('button', { name: 'Textura' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(btn).toBeFocused();
});

test('RB Concierge: 4 etapas, validação, cópia e WhatsApp indisponível', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#produtos');
  await page.getByRole('button', { name: /^Bovinos/ }).click();
  const add = page.getByTestId('product-add').first();
  await add.focus();
  await page.keyboard.press('Enter');
  await expect(add).toHaveAttribute('aria-pressed', 'true');

  await page.evaluate(() => (document.querySelector('[data-testid=contact-cta]') as HTMLButtonElement).click());
  const dlg = page.getByTestId('concierge');
  await expect(dlg).toBeVisible();

  // Etapa 1: validação
  await dlg.getByTestId('concierge-next').click();
  await expect(dlg.getByText('Selecione o tipo de operação.')).toBeVisible();
  await dlg.getByRole('radio', { name: 'Marmitaria' }).check();
  await dlg.getByTestId('concierge-next').click();

  // Etapa 2: item do catálogo já marcado + outro
  await expect(dlg.getByRole('checkbox', { name: 'Entrecôte' })).toBeChecked();
  await dlg.getByRole('checkbox', { name: 'Carne moída' }).check();
  await dlg.getByTestId('concierge-next').click();

  // Etapa 3: especificações opcionais
  await dlg.getByLabel('Periodicidade').selectOption('Semanal');
  await dlg.getByTestId('concierge-next').click();

  // Etapa 4: erro, correção, cópia
  await dlg.getByTestId('copy-request').click();
  await expect(dlg.getByText('Informe seu nome.')).toBeVisible();
  await dlg.getByLabel('Seu nome').fill('Ana Teste');
  await dlg.getByLabel('Estabelecimento').fill('Marmitas Demo');
  await dlg.getByLabel('Cidade').fill('São José');
  await dlg.getByLabel('WhatsApp para retorno').fill('48999990000');
  await expect(dlg.getByLabel('WhatsApp para retorno')).toHaveValue('(48) 99999-0000');

  await expect(dlg.getByTestId('wa-disabled')).toHaveAttribute('aria-disabled', 'true');
  await expect(dlg.locator('a[href^="https://wa.me"]')).toHaveCount(0);

  await dlg.getByTestId('copy-request').click();
  await expect(dlg.getByTestId('copy-request')).toContainText('Solicitação copiada');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('Operação: Marmitaria');
  expect(text).toContain('Entrecôte');
  expect(text).toContain('Carne moída');
  expect(text).toContain('Periodicidade: Semanal');
  expect(text).toContain('WhatsApp: (48) 99999-0000');

  // revisão editável
  await dlg.getByRole('button', { name: /Editar operação/ }).click();
  await expect(dlg.getByRole('radio', { name: 'Marmitaria' })).toBeChecked();

  const saved = await page.evaluate(() => sessionStorage.getItem('rb-concierge-selection') || '');
  expect(saved).not.toContain('Ana Teste');

  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
});

test('Food Service pré-seleciona o segmento no Concierge', async ({ page }) => {
  await page.goto('/#solucoes');
  await page.getByRole('tab', { name: /Delivery/ }).click();
  await page.getByTestId('solution-cta').click();
  const dlg = page.getByTestId('concierge');
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button', { name: /Etapa 1 de 4/ }).click();
  await expect(dlg.getByRole('radio', { name: 'Delivery' })).toBeChecked();
});

test('Cortes Sob Medida adiciona formato ao Concierge na etapa de especificações', async ({ page }) => {
  await page.goto('/#sob-medida');
  await page.getByRole('tab', { name: /Cubos/ }).click();
  await page.getByRole('button', { name: 'Solicitar corte personalizado' }).click();
  const dlg = page.getByTestId('concierge');
  await expect(dlg.getByText('Corte sob medida: Cubos').first()).toBeVisible();
  await expect(dlg.getByRole('button', { name: /Etapa 3 de 4/ })).toHaveAttribute('aria-current', 'step');
});

test('navegação por âncoras e menu mobile com Escape e foco', async ({ page, isMobile }) => {
  await page.goto('/');
  if (!isMobile) {
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Qualidade' }).click();
    await expect(page.locator('#qualidade')).toBeInViewport();
    return;
  }
  const burger = page.getByTestId('nav-burger');
  await burger.click();
  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: /Produtos/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(burger).toBeFocused();
  await burger.click();
  await menu.getByRole('link', { name: /Contato/ }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('#contato')).toBeInViewport();
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe WCAG A/AA sem violações sérias ou críticas — tema ${theme}`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
    await page.goto('/');
    await scrollThrough(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(2500);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const summary = serious.map((v) => `${v.id}: ${v.nodes.length} → ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(summary).toEqual([]);
  });
}

test('sem 3D: nenhuma cena WebGL nem GLB carregado', async ({ page }) => {
  const glb: string[] = [];
  page.on('request', (r) => {
    if (/\.glb($|\?)/.test(r.url())) glb.push(r.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.querySelector('#historia')?.scrollIntoView());
  await page.waitForTimeout(800);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(glb).toEqual([]);
});

test('reduced motion: Living Archive vertical com os três capítulos legíveis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#historia')).toHaveClass(/archive--stack/);
  for (const y of ['2001', '2019', '2021']) await expect(page.locator('.archive__year', { hasText: y })).toBeVisible();
});

test('hero: duas artes no mesmo quadro, crossfade sincronizado com o tema', async ({ page, isMobile }) => {
  await page.addInitScript(() => localStorage.setItem('rb-theme', 'dark'));
  await page.goto('/');
  const dark = page.locator('.hero__art--dark');
  const light = page.locator('.hero__art--light');
  const boxes = await Promise.all([dark.boundingBox(), light.boundingBox()]);
  expect(boxes[0]).toEqual(boxes[1]);
  const op = (l: typeof dark) => l.evaluate((e) => Number(getComputedStyle(e).opacity));
  await expect.poll(() => op(dark)).toBeGreaterThan(0.99);
  expect(await op(light)).toBeLessThan(0.01);
  if (!isMobile) await page.getByTestId('theme-toggle').first().click();
  else await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
  });
  // durante a transição as duas coexistem; ao final, a clara assume o quadro
  await expect.poll(() => op(light), { timeout: 3000 }).toBeGreaterThan(0.99);
  expect(await op(dark)).toBeLessThan(0.01);
  // nenhuma logo extra sobreposta à arte; nenhum texto dentro do quadro
  expect(await page.locator('.hero__stage').evaluate((e) => e.textContent?.trim() ?? '')).toBe('');
  // logo e carne preservadas: a arte é exibida inteira, na proporção do arquivo
  const fit = await page.locator('.hero__art--dark img').evaluate((i) => getComputedStyle(i).objectFit);
  expect(fit).toBe('contain');
});

test('hero: composição integrada, conteúdo visível após a entrada e troca de tema sem resíduo', async ({ page, isMobile }) => {
  await page.addInitScript(() => localStorage.setItem('rb-theme', 'dark'));
  await page.goto('/');
  // Sequência de entrada termina com todo o texto visível (sem elementos presos em opacidade 0).
  for (const sel of ['.hero__eyebrow', '.hero__lead', '.hero__ctas .btn--primary', '.hero__ctas .btn--link', '.hero__meta-item']) {
    await expect.poll(() => page.locator(sel).first().evaluate((e) => Number(getComputedStyle(e).opacity)), { timeout: 4000 }).toBeGreaterThan(0.99);
  }
  // A arte encosta na base do painel: nenhuma faixa vazia abaixo; o respiro acima é preenchido pelo céu derivado da arte.
  const g = await page.evaluate(() => {
    const v = document.querySelector('.hero__visual')!.getBoundingClientRect();
    const s = document.querySelector('.hero__stage')!.getBoundingClientRect();
    return { bottomGap: Math.abs(v.bottom - s.bottom), width: Math.abs(v.width - s.width) };
  });
  expect(g.bottomGap).toBeLessThan(2);
  expect(g.width).toBeLessThan(2);
  if (!isMobile) {
    expect(await page.locator('.hero__sky--dark').evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('hero-dark-extend');
    await page.getByTestId('theme-toggle').first().click();
    // A troca liga a transição global só durante o crossfade e a remove ao final.
    await expect(page.locator('html')).toHaveClass(/theme-anim/);
    await expect(page.locator('html')).not.toHaveClass(/theme-anim/, { timeout: 3000 });
    await expect.poll(() => page.locator('.logo-x__v--light').first().evaluate((e) => Number(getComputedStyle(e).opacity)), { timeout: 3000 }).toBeGreaterThan(0.99);
  }
});

test('manifesto: slideshow com três artes, avanço manual e pausa', async ({ page }) => {
  await page.goto('/#manifesto');
  const slides = page.locator('.slides__slide');
  await expect(slides).toHaveCount(3);
  await expect(page.locator('.slides__count')).toContainText('01');
  await page.getByTestId('slides-toggle').click();
  await expect(page.getByTestId('slides-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('slides-next').click();
  await expect(page.locator('.slides__count')).toContainText('02');
  await expect(page.locator('.slides__count')).toContainText('Tempo');
  await page.getByTestId('slides-next').click();
  await expect(page.locator('.slides__count')).toContainText('Soluções');
  await page.getByTestId('slides-next').click();
  await expect(page.locator('.slides__count')).toContainText('Carnes');
});

test('Food Service sem os três atos e com os benefícios', async ({ page }) => {
  await page.goto('/#food-service');
  await expect(page.locator('.flow, .act1, .act2, .act3')).toHaveCount(0);
  await expect(page.locator('.benefit')).toHaveCount(6);
  await expect(page.getByRole('heading', { name: /Mais tempo para servir bem/ })).toBeVisible();
});

test('Concierge etapa 3: campos lado a lado alinhados e dados preservados ao voltar', async ({ page, isMobile }) => {
  await page.goto('/#solucoes');
  await page.getByTestId('solution-cta').click();
  const dlg = page.getByTestId('concierge');
  await dlg.getByRole('checkbox', { name: 'Cupim' }).check();
  await dlg.getByTestId('concierge-next').click();
  const fmt = dlg.locator('select').first();
  const qty = dlg.getByLabel(/Quantidade aproximada/).first();
  await fmt.selectOption('Cubos');
  await qty.fill('12 kg por semana');
  await dlg.getByLabel(/Observações do item/).first().fill('Cubos de 3 cm');
  if (!isMobile) {
    const [a, b] = await Promise.all([fmt.boundingBox(), qty.boundingBox()]);
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
    expect(Math.abs(a!.height - b!.height)).toBeLessThan(1);
    const per = dlg.getByLabel(/Periodicidade/);
    const por = dlg.getByLabel(/Porções/);
    const [c, d] = await Promise.all([per.boundingBox(), por.boundingBox()]);
    expect(Math.abs(c!.y - d!.y)).toBeLessThan(1);
    expect(Math.abs(c!.height - d!.height)).toBeLessThan(1);
  }
  // o rodapé do painel não cobre o último campo
  const notes = dlg.locator('#spec-notes');
  await notes.scrollIntoViewIfNeeded();
  const [n, f] = await Promise.all([notes.boundingBox(), dlg.locator('.concierge__foot').boundingBox()]);
  expect(n!.y + n!.height).toBeLessThanOrEqual(f!.y + 1);
  // voltar e avançar preserva o que foi digitado
  await dlg.getByRole('button', { name: /Voltar/ }).click();
  await dlg.getByTestId('concierge-next').click();
  await expect(dlg.locator('select').first()).toHaveValue('Cubos');
  await expect(dlg.getByLabel(/Quantidade aproximada/).first()).toHaveValue('12 kg por semana');
  await expect(dlg.getByLabel(/Observações do item/).first()).toHaveValue('Cubos de 3 cm');
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe nos diálogos (Concierge etapa 4 e Spotlight) — tema ${theme}`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
    await page.goto('/#solucoes');
    await page.getByTestId('solution-cta').click();
    const dlg = page.getByTestId('concierge');
    await dlg.getByRole('checkbox', { name: 'Cupim' }).check();
    await dlg.getByTestId('concierge-next').click();
    await dlg.getByTestId('concierge-next').click();
    await dlg.getByTestId('copy-request').click(); // exibe erros de campo
    await page.waitForTimeout(500);
    const a = await new AxeBuilder({ page }).include('[data-testid=concierge]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const bad = a.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    expect(bad).toEqual([]);
    await page.keyboard.press('Escape');

    await page.goto('/#produtos');
    const btn = page.getByRole('button', { name: 'Explorar detalhes' }).first();
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('spotlight')).toBeVisible();
    await page.waitForTimeout(700);
    const b = await new AxeBuilder({ page }).include('[data-testid=spotlight]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const bad2 = b.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    expect(bad2).toEqual([]);
  });
}

test('Living Archive: três quadros reservados, sem imagens nem requisições da seção', async ({ page }) => {
  const reqs: string[] = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto('/');
  await page.evaluate(() => document.querySelector('#historia')?.scrollIntoView());
  await page.waitForTimeout(600);
  await expect(page.locator('#historia .archive__placeholder')).toHaveCount(3);
  await expect(page.locator('#historia img')).toHaveCount(0);
  await expect(page.locator('#historia').getByText('Imagem conceitual futura').first()).toBeAttached();
  expect(reqs.filter((u) => /carne-moida-studio|alcatra-completa-studio|ato1-preparo/.test(u) && !/food|benefit/.test(u))).toEqual([]);
});

test('Cortes Sob Medida: a miniatura Texture Macro fica acima da moldura principal', async ({ page, isMobile }) => {
  test.skip(isMobile, 'composição verificada no desktop');
  await page.goto('/');
  await page.locator('.cuts__macro').evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  const box = await page.locator('.cuts__macro').boundingBox();
  // pontos sobre a borda da miniatura que coincidem com a área da moldura principal
  const pts = [
    [box!.x + box!.width - 4, box!.y + 4],
    [box!.x + box!.width - 4, box!.y + box!.height / 2],
    [box!.x + box!.width / 2, box!.y + 4],
  ];
  for (const [x, y] of pts) {
    const hit = await page.evaluate(([x, y]) => {
      const e = document.elementFromPoint(x, y);
      return e?.closest('.cuts__macro') ? 'macro' : String(e?.className ?? 'null');
    }, [x, y]);
    expect(hit).toBe('macro');
  }
});

test('Food Service: introdução, foto e seis benefícios em uma tela (1440×900)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'regra de uma tela vale para desktop');
  await page.goto('/');
  await page.evaluate(() => {
    const el = document.querySelector('.food__screen') as HTMLElement;
    // a tela útil começa abaixo da navbar fixa (84 px)
    scrollTo(0, el.getBoundingClientRect().top + scrollY - 84);
  });
  await page.waitForTimeout(1200);
  const vh = await page.evaluate(() => innerHeight);
  for (const sel of ['#food-title', '.benefits__visual', '.benefit:nth-child(5)', '.benefit:nth-child(6)']) {
    const b = await page.locator(sel).boundingBox();
    expect(b!.y).toBeGreaterThanOrEqual(84);
    expect(b!.y + b!.height).toBeLessThanOrEqual(vh + 1);
  }
});
