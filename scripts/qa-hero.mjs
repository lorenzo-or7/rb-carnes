/** Capturas e medições da Hero: node scripts/qa-hero.mjs <url> <pasta> */
import { chromium } from '@playwright/test';
const [, , base, out] = process.argv;
const sizes = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1024, 600], [1280, 720], [1440, 900], [1440, 700], [1920, 1080], [1920, 800]];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const theme of ['dark', 'light']) {
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 });
    await ctx.addInitScript((t) => localStorage.setItem('rb-theme', t), theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2400);
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s)?.getBoundingClientRect();
      const hero = r('.hero'), stage = r('.hero__stage'), vis = r('.hero__visual'), text = r('.hero__text'), body = r('.hero__body'), meta = r('.hero__meta');
      const kids = [...document.querySelectorAll('.hero__text *')].filter((e) => e.getBoundingClientRect().right > (text.right + 1));
      return {
        overflowX: document.documentElement.scrollWidth > innerWidth,
        hero: Math.round(hero.height), visual: Math.round(vis.height), stage: [Math.round(stage.width), Math.round(stage.height)],
        gapTop: Math.round(stage.top - vis.top), gapBottom: Math.round(vis.bottom - stage.bottom),
        bodyMetaOverlap: body.bottom > meta.top + 1,
        textOverflow: kids.map((e) => e.className || e.tagName).slice(0, 3),
        heroInView: hero.bottom <= innerHeight + 1,
      };
    });
    console.log(theme, `${w}x${h}`, JSON.stringify(m), errors.length ? errors : '');
    await page.screenshot({ path: `${out}/hero-${theme}-${w}x${h}.jpg`, quality: 62, type: 'jpeg' });
    await ctx.close();
  }
}
await browser.close();
