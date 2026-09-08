import { readFile, writeFile } from 'node:fs/promises';

// This guide is fully rendered at build time. Native anchors, downloads, and
// <details> work without hydration; relative asset URLs support any Pages path.
const path = new URL('../dist/client/index.html', import.meta.url);
let html = await readFile(path, 'utf8');
if (!html.includes('How much of the error')) {
  throw new Error('Expected the HA-MAI article in the exported index.html');
}
html = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
  .replace(/<link\b[^>]*\b(?:as="script"|rel="modulepreload")[^>]*>/gi, '')
  .replace(/\b(href|src)="\/(?!\/)/g, '$1="./');
await writeFile(path, html);
await writeFile(new URL('../dist/client/.nojekyll', import.meta.url), '');
console.log('Prepared portable, fully rendered static HA-MAI guide.');
