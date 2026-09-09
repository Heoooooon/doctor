import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const loaderPath = process.argv[2];
assert.ok(loaderPath, 'Pass the installed Senpi core/skills.js module path');
const { loadSkillsFromDir, formatSkillsForPrompt } = await import(pathToFileURL(resolve(loaderPath)).href);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(projectRoot, '.agents/skills');
const result = loadSkillsFromDir({ dir: root, source: 'project' });
const matches = result.skills.filter(skill => skill.name === 'design-pipeline');
assert.equal(matches.length, 1, 'Expected one discoverable project design-pipeline skill');
const skill = matches[0];
assert.equal(skill.filePath, resolve(root, 'design-pipeline/SKILL.md'));
assert.equal(skill.disableModelInvocation, false);
assert.ok(skill.description.trim().length > 0);
assert.deepEqual(result.diagnostics.filter(item => item.path?.startsWith(skill.baseDir)), []);
const source = await readFile(skill.filePath, 'utf8');
let references = 0;
for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
  const target = match[1].split('#')[0];
  if (!target || /^[a-z]+:/i.test(target)) continue;
  const path = resolve(skill.baseDir, target);
  assert.ok(!relative(skill.baseDir, path).startsWith('..'), 'Skill reference must stay inside its package');
  assert.ok((await stat(path)).isFile(), 'Skill reference must exist');
  assert.ok((await readFile(path, 'utf8')).trim().length > 0);
  references++;
}
assert.ok(references >= 3, 'Skill must link its reusable reference files');
const listing = formatSkillsForPrompt([skill]);
assert.ok(listing.includes('<name>design-pipeline</name>'));
assert.ok(listing.includes('design-pipeline/SKILL.md'));
console.log(listing);
console.log(JSON.stringify({ status: 'PASS', name: skill.name, filePath: skill.filePath, references, loader: resolve(loaderPath) }));
