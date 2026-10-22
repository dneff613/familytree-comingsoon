import { mkdir, rm, cp } from 'node:fs/promises';
import './check.mjs';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'assets', 'privacy', 'thank-you', '_headers', 'robots.txt']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log('Built static site in dist/');
