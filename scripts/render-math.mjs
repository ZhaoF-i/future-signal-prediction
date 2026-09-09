import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Typeset during the build: each SVG embeds its STIX2 glyph paths and needs
// neither client-side MathJax nor a font/CDN request to display the equation.
global.MathJax = {
  loader: {
    paths: { mathjax: '@mathjax/src/bundle' },
    load: ['input/tex', 'output/svg', 'adaptors/liteDOM'],
    require: file => import(file),
  },
  output: { font: 'mathjax-stix2' },
  svg: { fontCache: 'none' },
};
await import('@mathjax/src/bundle/startup.js');
await MathJax.startup.promise;

const definitions = JSON.parse(await readFile(new URL('../math/equations.json', import.meta.url), 'utf8'));
const output = new URL('../public/equations/', import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL('MathJax-LICENSE.txt', output),
  await readFile(new URL('../node_modules/@mathjax/src/LICENSE', import.meta.url)));
await writeFile(new URL('STIX-OFL.txt', output),
  await readFile(new URL('../public/fonts/stixtwomath-OFL.txt', import.meta.url)));

const dimensions = {};
try {
  for (const [id, { tex }] of Object.entries(definitions)) {
    const node = await MathJax.tex2svgPromise(tex, {
      display: true, em: 16, ex: 8, containerWidth: 1200,
    });
    const adaptor = MathJax.startup.adaptor;
    let svg = adaptor.serializeXML(adaptor.tags(node, 'svg')[0]);
    if (/data-mml-node="merror"|<text\b|<use\b/.test(svg)) {
      throw new Error(`S${id}: unexpected error, fallback text or external glyph reference`);
    }
    const [, , , width, height] = svg.match(/viewBox="([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)"/) || [];
    if (!width || !height) throw new Error(`S${id}: missing SVG dimensions`);
    const widthEm = Number(width) / 1000;
    const heightEm = Number(height) / 1000;
    dimensions[id] = { widthEm, heightEm };
    // Give external SVG images explicit intrinsic pixel dimensions. CSS then
    // scales them to the article's math size, preserving the full viewBox.
    svg = svg.replace(/\bwidth="[^"]+"/, `width="${widthEm * 16}"`)
      .replace(/\bheight="[^"]+"/, `height="${heightEm * 16}"`);
    await writeFile(new URL(`s${id}.svg`, output), svg + '\n');
  }
  await writeFile(new URL('../math/dimensions.generated.json', import.meta.url), JSON.stringify(dimensions, null, 2) + '\n');
  console.log(`Typeset ${Object.keys(dimensions).length} STIX2 equations as self-contained SVG.`);
} finally {
  MathJax.done();
}
