/**
 * Gera os assets otimizados do site a partir dos originais em _incoming/.
 *  - Produtos: AVIF + WebP em 3 larguras (studio e macro), + JPEG mínimo de fallback.
 *  - Logos RB: remove apenas a placa de fundo (preto ou branco) por "unmultiply",
 *    preservando cores, traço e proporções da arte original.
 *  - Favicons.
 * Uso: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const IN = '_incoming/IMAGENS';
const IN2 = '_incoming/v2/IMAGENS2';
const OUT = 'public/assets/products';
const BRAND_OUT = 'public/assets/brand';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(BRAND_OUT, { recursive: true });

// Mapeamento conferido visualmente (folha de contato). Para capa de contra-filé,
// o arquivo 02 é a foto de estúdio e o 01 é o macro. Coxão duro só tem dois close-ups.
const PRODUCTS = {
  'acem-lombo': ['acem-lombo01.jpeg', 'acem-lombo02.jpeg'],
  'alcatra-completa': ['alcatra-completa01.jpeg', 'alcatra-completa02.jpeg'],
  'alcatra-miolo': ['alcatra-miolo01.jpeg', 'alcatra-miolo02.png'],
  'capa-contra-file': ['capa-contra-file02.jpeg', 'capa-contra-file01.jpeg'],
  'capa-coxao-mole': ['capa-coxao-mole01.jpeg', 'capa-coxao-mole02.jpeg'],
  'contra-file-cbc': ['contra-file-cbc01.jpeg', 'contra-file-cbc02.jpeg'],
  'contra-file': ['contra-file01.jpeg', 'contra-file02.jpeg'],
  costela: ['costela01.jpeg', 'costela02.jpeg'],
  'coxao-duro': ['coxao-duro01.jpeg', 'coxao-duro02.jpeg'],
  'coxao-mole': ['coxao-mole01.jpeg', 'coxao-mole02.jpeg'],
  cupim: ['cupim01.jpeg', 'cupim02.jpeg'],
  entrecote: ['entrecote01.jpeg', 'entrecote02.jpeg'],
  'fraldinha-miolo': ['fraldinha-miolo01.jpeg', 'fraldinha-miolo02.jpeg'],
  fraldinha: ['fraldinha01.jpeg', 'fraldinha02.jpeg'],
  'paleta-suina': ['paleta-suina01.jpeg', 'paleta-suina02.jpeg'],
  'sobrepaleta-suina': ['sobrepaleta-suina01.jpeg', 'sobrepaleta-suina02.jpeg'],
  // Lote 2 (IMAGENS2.zip)
  'bifes-padronizados': ['v2:bifes-padronizados01.png', 'v2:bifes-padronizados02.png'],
  cubos: ['v2:cubos01.png', 'v2:cubos02.png'],
  'tiras-iscas': ['v2:tiras-iscas01.png', 'v2:tiras-iscas02.png'],
  'carne-moida': ['v2:carne-moida01.png', 'v2:carne-moida02.png'],
  'cortes-personalizados': ['v2:cortes-personalizados01.png', 'v2:cortes-personalizados02.png'],
  'molhos-ekma': ['v2:molhos-ekma.png', null],
};
// Cenas (Food Service / segmentos): uma imagem cada
const SCENES = {
  'ato1-preparo': 'cada-minuto-faz-diferença.png',
  'seg-restaurantes': 'restaurantes.png',
  'seg-hamburguerias': 'lanchonetes-hamburguerias.png',
  'seg-marmitarias': 'marmitaria.png',
  'seg-delivery': 'delivery.png',
};
const WIDTHS = [480, 800, 1120];

const manifest = {};
for (const [slug, [studio, macro]] of Object.entries(PRODUCTS)) {
  manifest[slug] = {};
  for (const [kind, file] of [['studio', studio], ['macro', macro]]) {
    if (!file) continue;
    const src = file.startsWith('v2:') ? path.join(IN2, file.slice(3)) : path.join(IN, file);
    if (process.env.ONLY_V2 && !file.startsWith('v2:')) { manifest[slug][kind] = (await sharp(src).metadata().then((m) => ({ w: m.width, h: m.height }))); continue; }
    const meta = await sharp(src).metadata();
    manifest[slug][kind] = { w: meta.width, h: meta.height };
    for (const w of WIDTHS) {
      const base = path.join(OUT, `${slug}-${kind}-${w}`);
      const pipeline = () => sharp(src).resize({ width: Math.min(w, meta.width) });
      await pipeline().avif({ quality: 52, effort: 4 }).toFile(`${base}.avif`);
      await pipeline().webp({ quality: 74 }).toFile(`${base}.webp`);
    }
    await sharp(src).resize({ width: 800 }).jpeg({ quality: 72, mozjpeg: true }).toFile(path.join(OUT, `${slug}-${kind}-800.jpg`));
  }
}
const SCN = 'public/assets/scenes';
fs.mkdirSync(SCN, { recursive: true });
manifest.__scenes = {};
for (const [slug, file] of Object.entries(SCENES)) {
  const src = path.join(IN2, file);
  if (!fs.existsSync(src)) continue;
  const meta = await sharp(src).metadata();
  manifest.__scenes[slug] = { w: meta.width, h: meta.height };
  for (const w of [640, 1080, 1600]) {
    const base = path.join(SCN, slug + '-' + w);
    await sharp(src).resize({ width: Math.min(w, meta.width) }).avif({ quality: 50, effort: 4 }).toFile(base + '.avif');
    await sharp(src).resize({ width: Math.min(w, meta.width) }).webp({ quality: 74 }).toFile(base + '.webp');
  }
  await sharp(src).resize({ width: 1080 }).jpeg({ quality: 72, mozjpeg: true }).toFile(path.join(SCN, slug + '-1080.jpg'));
}
fs.writeFileSync('src/data/image-manifest.json', JSON.stringify(manifest, null, 2));

// ---------- Logos ----------
async function unplate(src, out, plate) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    let a, cr, cg, cb;
    if (plate === 'black') {
      a = Math.max(r, g, b);
      cr = a ? r / a : 0; cg = a ? g / a : 0; cb = a ? b / a : 0;
    } else {
      a = Math.max(1 - r, 1 - g, 1 - b);
      cr = a ? (r - (1 - a)) / a : 0; cg = a ? (g - (1 - a)) / a : 0; cb = a ? (b - (1 - a)) / a : 0;
    }
    // limiar de ruído de compressão da placa
    if (a < 0.06) a = 0;
    px[i] = Math.round(Math.min(1, Math.max(0, cr)) * 255);
    px[i + 1] = Math.round(Math.min(1, Math.max(0, cg)) * 255);
    px[i + 2] = Math.round(Math.min(1, Math.max(0, cb)) * 255);
    px[i + 3] = Math.round(a * 255);
  }
  const img = sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } });
  await img.clone().resize(480).webp({ quality: 90, alphaQuality: 100 }).toFile(`${out}-480.webp`);
  await img.clone().resize(480).png({ compressionLevel: 9 }).toFile(`${out}-480.png`);
  await img.clone().resize(960).webp({ quality: 90, alphaQuality: 100 }).toFile(`${out}-960.webp`);
}
const LOGO_DARK = process.env.LOGO_DARK; // arte com fundo preto (para tema escuro)
const LOGO_LIGHT = process.env.LOGO_LIGHT; // arte com fundo branco (para tema claro)
if (LOGO_DARK && fs.existsSync(LOGO_DARK)) {
  await unplate(LOGO_DARK, path.join(BRAND_OUT, 'rb-logo-on-dark'), 'black');
  // ícone: a arte completa com sua placa original
  await sharp(LOGO_DARK).resize(192).png().toFile('public/icon-192.png');
  await sharp(LOGO_DARK).resize(512).png().toFile('public/icon-512.png');
  await sharp(LOGO_DARK).resize(180).png().toFile('public/apple-touch-icon.png');
  await sharp(LOGO_DARK).resize(48).png().toFile('public/favicon.png');
  await sharp(LOGO_DARK).resize(1200, 630, { fit: 'contain', background: '#0B0A09' }).jpeg({ quality: 82 }).toFile('public/og-image.jpg');
}
if (LOGO_LIGHT && fs.existsSync(LOGO_LIGHT)) {
  await unplate(LOGO_LIGHT, path.join(BRAND_OUT, 'rb-logo-on-light'), 'white');
}
console.log('produtos:', Object.keys(PRODUCTS).length);
