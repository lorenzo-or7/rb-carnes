import sharp from 'sharp'; import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2]; const out = process.argv[3];
const files = fs.readdirSync(dir).filter(f=>new RegExp(process.argv[4]||'01.(jpe?g|png)$').test(f)).sort();
const W=220,H=270, cols=6; const rows=Math.ceil(files.length/cols);
const comps = await Promise.all(files.map(async (f,i)=>({input: await sharp(path.join(dir,f)).resize(W,H,{fit:'cover'}).composite([{input:Buffer.from(`<svg width="${W}" height="24"><rect width="${W}" height="24" fill="black"/><text x="4" y="17" font-size="14" fill="white">${f}</text></svg>`),top:H-24,left:0}]).toBuffer(), left:(i%cols)*W, top:Math.floor(i/cols)*H})));
await sharp({create:{width:W*cols,height:H*rows,channels:3,background:'#222'}}).composite(comps).jpeg().toFile(out);
console.log(files.length);
