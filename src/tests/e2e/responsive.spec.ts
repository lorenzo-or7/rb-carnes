import { test, expect } from '@playwright/test';

const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1920];
// Faixas deslizáveis por toque (rolagem lateral intencional dentro do próprio contêiner).
const IGNORE = '.marquee,.solutions__tabs,.cuts__tabs,.catalog__grid,.catalog__filters';

test.describe('sem overflow horizontal', () => {
  test.skip(({ isMobile }) => isMobile, 'larguras controladas no projeto desktop');
  for (const theme of ['dark', 'light'] as const) {
    for (const w of WIDTHS) {
      test(`${w}px — ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: w < 768 ? 800 : 900 });
        await page.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
        await page.goto('/');
        const offenders = await page.evaluate(async (ignore) => {
          const out: string[] = [];
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
          if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`doc ${document.documentElement.scrollWidth}`);
          document.querySelectorAll('h1,h2,h3,p,a,button,label,input').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width && r.right > innerWidth + 2 && !el.closest(ignore)) out.push(`${el.tagName}.${(el as HTMLElement).className} ${Math.round(r.right)}`);
          });
          return out.slice(0, 8);
        }, IGNORE);
        expect(offenders).toEqual([]);
      });
    }
  }
  test('paisagem mobile 844x390', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(sw).toBeLessThanOrEqual(1);
  });
});
