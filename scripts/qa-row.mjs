/** Junta capturas lado a lado: node scripts/qa-row.mjs <pasta> <saida> <altura> <arquivos...> */
import sharp from 'sharp';
const [, , dir, out, hs, ...names] = process.argv;
const H = +hs;
const imgs = await Promise.all(names.map((n) => sharp(`${dir}/${n}`).resize({ height: H }).toBuffer({ resolveWithObject: true })));
let x = 0; const comps = [];
for (const i of imgs) { comps.push({ input: i.data, top: 0, left: x }); x += i.info.width + 8; }
await sharp({ create: { width: x, height: H, channels: 3, background: '#777' } }).composite(comps).jpeg({ quality: 72 }).toFile(`${dir}/${out}`);
