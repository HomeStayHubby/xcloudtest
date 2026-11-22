#!/usr/bin/env node
// ELITEQuest version bump tool.
//
// Usage:
//   npm run version:feat  -- --note "Short feature summary"
//   npm run version:fix   -- --note "Short bugfix summary"
//   npm run version:major -- --note "Summary"   (manual only — product owner decides)
//
// Bumps the version (X.Y.Z): feat -> Y+1 (Z reset to 0), fix -> Z+1,
// major -> X+1 (Y and Z reset to 0). Syncs every workspace package.json,
// rewrites client/src/version.ts, and updates version.md (Current Version
// block + a new changelog entry).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PACKAGE_FILES = [
  'package.json',
  'client/package.json',
  'server/package.json',
  'shared/package.json',
];
const CLIENT_VERSION_FILE = 'client/src/version.ts';
const VERSION_FILE = 'version.md';

function fail(message) {
  console.error(`version-bump: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const kind = argv[0];
  const noteIndex = argv.indexOf('--note');
  const note = noteIndex !== -1 ? argv[noteIndex + 1] : undefined;
  return { kind, note };
}

const { kind, note } = parseArgs(process.argv.slice(2));

if (!['feat', 'fix', 'major'].includes(kind)) {
  fail("first argument must be 'feat', 'fix', or 'major'");
}
if (!note || note.trim().length === 0) {
  fail('a --note "Short summary" is required so version.md gets a changelog entry');
}
const summary = note.trim();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

const rootPackage = readJson('package.json');
const current = rootPackage.version;
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
if (!match) {
  fail(`root package.json version '${current}' is not in X.Y.Z format`);
}

const [x, y, z] = [Number(match[1]), Number(match[2]), Number(match[3])];
let next;
if (kind === 'feat') {
  next = `${x}.${y + 1}.0`;
} else if (kind === 'fix') {
  next = `${x}.${y}.${z + 1}`;
} else {
  next = `${x + 1}.0.0`;
}

for (const file of PACKAGE_FILES) {
  const data = readJson(file);
  data.version = next;
  writeJson(file, data);
}

fs.writeFileSync(
  path.join(root, CLIENT_VERSION_FILE),
  `export const APP_VERSION = '${next}';\n`
);

const versionMdPath = path.join(root, VERSION_FILE);
let versionMd = fs.readFileSync(versionMdPath, 'utf8');
// Match the file's existing line endings (editors/git may save CRLF on Windows).
const nl = versionMd.includes('\r\n') ? '\r\n' : '\n';

const currentVersionHeading =
  /^## Current Version\r?\n\r?\n\*\*[\d.]+\*\*\r?\n\r?\n[\s\S]*?(?=\r?\n\r?\n---)/m;
if (!currentVersionHeading.test(versionMd)) {
  fail('could not find the "## Current Version" block in version.md');
}
versionMd = versionMd.replace(
  currentVersionHeading,
  `## Current Version${nl}${nl}**${next}**${nl}${nl}${kind === 'fix' ? 'Bugfix' : 'Feature'}: ${summary}`
);

const changelogHeading = /^## Changelog\r?\n/m;
if (!changelogHeading.test(versionMd)) {
  fail('could not find the "## Changelog" heading in version.md');
}
const entryKind = kind === 'fix' ? 'Bugfix' : kind === 'feat' ? 'Feature' : 'Major release';
const changelogEntry = `### ${next} — ${summary}${nl}- ${entryKind}: ${summary}.${nl}`;
versionMd = versionMd.replace(changelogHeading, `## Changelog${nl}${nl}${changelogEntry}`);

fs.writeFileSync(versionMdPath, versionMd);

console.log(`Version bumped: ${current} -> ${next} (${kind})`);
console.log(`Updated: ${PACKAGE_FILES.join(', ')}, ${CLIENT_VERSION_FILE}, ${VERSION_FILE}`);
