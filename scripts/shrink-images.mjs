// 사용법: node scripts/shrink-images.mjs
// public/images/gen, public/images/photo 의 그림을 가로 1400px 이하로 줄이고
// PNG 는 팔레트 양자화로 용량을 줄인다. 파일명은 그대로 둔다(이미지 슬롯 이름이 바뀌지 않게).
import sharp from 'sharp';
import { readdirSync, statSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'public', 'images');
for (const dir of ['gen', 'photo']) {
  for (const f of readdirSync(join(root, dir))) {
    if (!/\.(png|jpe?g)$/i.test(f)) continue;
    const p = join(root, dir, f);
    const before = statSync(p).size;
    const tmp = p + '.tmp';
    const img = sharp(p).resize({ width: 1400, withoutEnlargement: true });
    if (/\.png$/i.test(f)) await img.png({ palette: true, quality: 85, compressionLevel: 9 }).toFile(tmp);
    else await img.jpeg({ quality: 82, mozjpeg: true }).toFile(tmp);
    renameSync(tmp, p);
    console.log(f, (before / 1024).toFixed(0) + 'K', '->', (statSync(p).size / 1024).toFixed(0) + 'K');
  }
}
