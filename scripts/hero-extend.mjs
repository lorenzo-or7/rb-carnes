/**
 * Extensão contínua do céu da arte do hero (escuro/claro).
 * Usa somente pixels da própria arte: uma faixa do topo é esticada na vertical e suavizada,
 * para preencher o espaço residual acima da imagem sem faixas vazias nem recorte.
 */
import sharp from 'sharp';

const IN = '_incoming/v3/IMAGENS3';
const jobs = [
  { src: 'hero.png', out: 'public/assets/hero/hero-dark-extend.webp' },
  { src: 'hero-claro.png', out: 'public/assets/hero/hero-light-extend.webp' },
];
const W = 720;
const H = 420;
for (const j of jobs) {
  const src = `${IN}/${j.src}`;
  const { info } = await sharp(src).resize({ width: W }).toBuffer({ resolveWithObject: true });
  const height = info.height;
  const band = Math.max(4, Math.round(height * 0.035));
  const strip = await sharp(src).resize({ width: W }).extract({ left: 0, top: 0, width: W, height: band }).toBuffer();
  await sharp(strip)
    .resize({ width: W, height: H, fit: 'fill', kernel: 'cubic' })
    .blur(18)
    .webp({ quality: 82 })
    .toFile(j.out);
  console.log(j.out, 'band', band);
}
