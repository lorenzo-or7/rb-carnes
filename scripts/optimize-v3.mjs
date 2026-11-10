/**
 * Lote 3 (IMAGENS3.zip): hero oficial (escuro/claro) e ilustrações do manifesto.
 * Só redimensiona e recodifica — nenhuma alteração na arte.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const IN = '_incoming/v3/IMAGENS3';
const jobs = [
  { src: 'hero.png', out: 'public/assets/hero/hero-dark', widths: [800, 1280, 1672] },
  { src: 'hero-claro.png', out: 'public/assets/hero/hero-light', widths: [800, 1280, 1671] },
  { src: 'carnes.png', out: 'public/assets/manifesto/carnes', widths: [560, 860, 1106] },
  { src: 'tempo.png', out: 'public/assets/manifesto/tempo', widths: [560, 860, 1106] },
  { src: 'solucoes.png', out: 'public/assets/manifesto/solucoes', widths: [560, 860, 1106] },
];
const meta = {};
for (const j of jobs) {
  fs.mkdirSync(path.dirname(j.out), { recursive: true });
  const src = path.join(IN, j.src);
  const m = await sharp(src).metadata();
  meta[path.basename(j.out)] = { w: m.width, h: m.height };
  for (const w of j.widths) {
    await sharp(src).resize({ width: w }).avif({ quality: 58, effort: 4 }).toFile(`${j.out}-${w}.avif`);
    await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(`${j.out}-${w}.webp`);
  }
  await sharp(src).resize({ width: j.widths[1] }).flatten({ background: '#0b0a09' }).jpeg({ quality: 78, mozjpeg: true }).toFile(`${j.out}-${j.widths[1]}.jpg`);
}
console.log(meta);
