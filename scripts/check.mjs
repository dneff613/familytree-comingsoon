import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const pages = ['index.html', 'privacy/index.html', 'thank-you/index.html'];
for (const path of pages) {
  const html = await readFile(path, 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: exactly one h1`);
  assert.match(html, /name="viewport"/);
  assert.match(html, /name="description"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${path}: unique IDs`);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `Anchor exists: ${target}`);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (url.startsWith('#') || /^(https:|mailto:)/.test(url)) continue;
    const local = url.split('#')[0];
    await access(local === '/' ? 'index.html' : `.${local}${local.endsWith('/') ? 'index.html' : ''}`);
  }
  assert(!/api[_-]?key|Bearer\s/i.test(html), `${path}: no private credentials`);
}
const html = await readFile('index.html', 'utf8');
for (const text of ['Build', 'Research', 'Connect', 'Coming soon.', 'Where Researchers Come Together.']) assert(html.includes(text));
const alpha = html.match(/<input[^>]*id="signup-alpha"[^>]*>/)?.[0];
assert(alpha && /type="checkbox"/.test(alpha) && !/\bchecked\b|\brequired\b/.test(alpha), 'Alpha is optional and unchecked');
assert.match(html, /type="hidden" name="groups\[\]" value="202062562161854094"/);
assert.match(html, /id="signup-alpha" name="groups\[\]" value="202062569642395128"/);
assert.match(html, /id="signup-consent"[^>]*required/);
assert.match(html, /id="signup-fields"[^>]*disabled/);
assert.match(html, /role="status"/);
assert(!html.includes('universal.js'), 'No universal tracking snippet');
assert(html.indexOf('id="soon-title"') < html.indexOf('id="signup-title"'));
const privacy = await readFile('privacy/index.html', 'utf8');
assert(privacy.includes('Kin Discover') && privacy.includes('support@kindiscover.com'));
assert(!privacy.includes('preparation status'));
console.log('Checks passed: page structure, metadata, links/assets, signup groups and consent, privacy contact.');
