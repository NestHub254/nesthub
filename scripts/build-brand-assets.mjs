import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
// Supply SHARP_MODULE when using a bundled runtime instead of a local install.
const sharp=require(process.env.SHARP_MODULE||'sharp');
for(const [app,role,bg] of [['frontend','owner','#14264B'],['tenant-portal','tenant','#A53F37']]){
  const dir=path.join(app,'public','brand');
  const source=await fs.readFile(path.join(dir,`${role}-mark.svg`),'utf8');
  for(const size of [32,180,192,512]){
    await sharp(Buffer.from(source)).resize(size,size).png().toFile(path.join(dir,`${role}-${size}.png`));
  }
  // Keep all meaningful geometry inside the central 80% safe circle.
  const symbol=source.replace(/<rect[^>]+\/>/,'').replace(/<svg[^>]+>/,'').replace('</svg>','');
  const maskable=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${bg}"/><g transform="translate(51.2 51.2) scale(.8)">${symbol}</g></svg>`;
  await sharp(Buffer.from(maskable)).resize(512,512).png().toFile(path.join(dir,`${role}-maskable-512.png`));
  const png=await sharp(Buffer.from(source)).resize(32,32).png().toBuffer();
  const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
  await fs.writeFile(path.join(dir,`${role}-favicon.ico`),Buffer.concat([header,png]));
  console.log(`${role}: SVG, favicon, Apple touch icon, PWA and maskable assets generated.`);
}
