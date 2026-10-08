import { cp, mkdir } from 'node:fs/promises';

const source = new URL('./', import.meta.url);
const output = new URL('../pages-site/demo/', import.meta.url);
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'demo.css', 'demo.js']) {
  await cp(new URL(file, source), new URL(file, output));
}
console.log('Prepared standalone browser demo for Pages at /demo/.');
