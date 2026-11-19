import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Native title-bar buttons, audited at 2× and 2.5× capture density.
// Exact pixel signatures prevent mistaking a chart, report or dialog title for the logo.
const surfaces = new Map([
  ['d93a5803ace2a7069514b32b7ea321b2658b288925c1c1d5366a54c0e83f3e56', [27, 30, 32]],
  ['2317068c8e2d64f25b4991a721fe594134417424822856167e9be0b7ecdf182d', [14, 14, 19]],
  ['a4f4034a3422cc0d56a2954e80482236da01d09ffb081aefb46c82498a6bd7bf', [27, 30, 32]],
  ['27ba89f7c6e6617c72556c0497bd00fafd30f013b4586318a3582229377dad76', [14, 14, 19]],
  ['daf8e768682c4cc430ce5ec075251c14422326e36b4a908567e38b531c85b205', [16, 18, 22]],
  ['3f9c86c76f140bfdc88dcc233b76f52f623c0a3458342fb131fe55821e3d0da1', [13, 14, 18]],
]);
const glyph = [233, 237, 240];

export async function neutralTitleMark(input, theme, sourceWidth) {
  if (!['imprimatura', 'pentimento'].includes(theme)) return null;
  const width = sourceWidth === 3840 ? 150 : 120;
  const height = sourceWidth === 3840 ? 110 : 88;
  // Sample the adjoining title bar with the patch to inherit its actual colour.
  const sample = await sharp(input).extract({left: 0, top: 0, width: width + 1, height})
    .removeAlpha().toColourspace('srgb').raw().toBuffer();
  const patch = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    const start = y * (width + 1) * 3;
    sample.copy(patch, y * width * 3, start, start + width * 3);
  }
  const background = surfaces.get(createHash('sha256').update(patch).digest('hex'));
  if (!background) return null;

  for (let y = 0; y < height; y++) {
    const neighbour = (y * (width + 1) + width) * 3;
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * width + x) * 3 + c;
        const coverage = Math.max(0, (patch[i] - background[c]) / (glyph[c] - background[c]));
        const bar = sample[neighbour + c];
        patch[i] = Math.round(bar + coverage * (glyph[c] - bar));
      }
    }
  }
  return {input: patch, raw: {width, height, channels: 3}, left: 0, top: 0};
}
