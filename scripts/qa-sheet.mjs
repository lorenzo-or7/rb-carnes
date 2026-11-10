/** Folha de contato das capturas: node scripts/qa-sheet.mjs <pasta> <prefixo> <colunas> <largura-célula> */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const [, , dir, prefix, cols = '4', cw = '420'] = process.argv;
const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.jpg')).sort();
const meta = await sharp(path.join(dir, files[0])).metadata();
const W = +cw, H = Math.round((W * meta.height) / meta.width), C = +cols;
const rows = Math.ceil(files.length / C);
const comps = await Promise.all(
  files.map(async (f, i) => ({ input: await sharp(path.join(dir, f)).resize(W, H).toBuffer(), left: (i % C) * W, top: Math.floor(i / C) * H })),
);
await sharp({ create: { width: W * C, height: H * rows, channels: 3, background: '#777' } }).composite(comps).jpeg({ quality: 72 }).toFile(path.join(dir, `sheet-${prefix}.jpg`));
console.log(files.length, 'capturas');
