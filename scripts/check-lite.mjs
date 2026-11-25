#!/usr/bin/env node
// Boundary check for Expo Starter, the open-source edition.
//
// Every rule reads its data from lite-manifest.json, so this script stays free
// of the words and paths it guards against. It checks the files that git would
// commit (tracked plus untracked, minus .gitignore) and fails when:
//
//   1. a path owned by the commercial edition exists,
//   2. the manifest is stale (a listed file is missing or listed twice),
//   3. a forbidden word appears outside the allowlisted files and JSON keys,
//   4. package.json declares a forbidden dependency,
//   5. code under the manifest's networkCheck paths uses a network API,
//   6. the Expo config enables OTA updates, a runtime version or an EAS project,
//      or loads a config plugin from a forbidden dependency,
//   7. gitleaks finds a secret (skip with --skip-secrets when gitleaks is not installed).
//
// Usage: pnpm check:lite [--skip-secrets]

import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skipSecrets = process.argv.includes('--skip-secrets');
const manifest = JSON.parse(readFileSync(join(root, 'lite-manifest.json'), 'utf8'));

const BINARY_EXTENSIONS = /\.(png|jpe?g|gif|ico|icns|webp|woff2?|ttf|otf|zip|gz)$/i;
const CODE_EXTENSIONS = /\.[cm]?[jt]sx?$/;
const failures = [];
const fail = (rule, message) => failures.push(`[${rule}] ${message}`);

const listFiles = () =>
  execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root,
  })
    .toString('utf8')
    .split('\0')
    .filter((file) => file && existsSync(join(root, file)));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// `dir/` matches everything below dir; `*` matches within one path segment.
const toPathMatcher = (pattern) => {
  if (pattern.endsWith('/')) return (file) => file.startsWith(pattern);
  const regex = new RegExp(`^${pattern.split('*').map(escapeRegExp).join('[^/]*')}$`);
  return (file) => regex.test(file);
};

const getKeyPath = (data, keyPath) =>
  keyPath.split('.').reduce((node, key) => (node instanceof Object ? node[key] : undefined), data);

const files = listFiles();
const readText = (file) => readFileSync(join(root, file), 'utf8');

// 1. Paths owned by the commercial edition.
for (const pattern of manifest.proPaths) {
  for (const file of files.filter(toPathMatcher(pattern))) {
    fail('pro-path', `${file} (matches ${pattern})`);
  }
}

// 2. Manifest freshness.
const listed = new Map();
for (const list of ['sharedFiles', 'liteOnlyFiles', 'generatedFiles']) {
  for (const file of manifest[list]) {
    if (listed.has(file)) fail('manifest', `${file} is in both ${listed.get(file)} and ${list}`);
    listed.set(file, list);
    if (!existsSync(join(root, file))) {
      fail('manifest', `${file} is listed in ${list} but does not exist`);
    }
  }
}

// 3. Forbidden words. In allowlisted JSON files, the listed keys (dot paths) are
// removed before the scan, and hits are reported by key path.
const allow = manifest.forbiddenWordAllowlist;
const wordPattern = new RegExp(manifest.forbiddenWords.map(escapeRegExp).join('|'), 'gi');
const wordsIn = (text) => [...new Set(text.match(wordPattern) ?? [])].join(', ');

const deleteKeyPath = (data, keyPath) => {
  const keys = keyPath.split('.');
  const last = keys.pop();
  const parent = keys.length > 0 ? getKeyPath(data, keys.join('.')) : data;
  if (parent instanceof Object) delete parent[last];
};

const scanJson = (file, value, path = []) => {
  if (typeof value === 'string') {
    if (value.match(wordPattern))
      fail('word', `${file}:${path.join('.')} contains ${wordsIn(value)}`);
  } else if (value instanceof Object) {
    for (const [key, child] of Object.entries(value)) {
      if (key.match(wordPattern)) fail('word', `${file}: key ${[...path, key].join('.')}`);
      scanJson(file, child, [...path, key]);
    }
  }
};

for (const file of files) {
  if (allow.files.includes(file) || BINARY_EXTENSIONS.test(file)) continue;
  const text = readText(file);
  if (text.includes('\0')) continue;
  const allowedKeys = allow.jsonKeys[file];
  if (allowedKeys) {
    const data = JSON.parse(text);
    for (const keyPath of allowedKeys) deleteKeyPath(data, keyPath);
    scanJson(file, data);
    continue;
  }
  text.split('\n').forEach((line, index) => {
    if (line.match(wordPattern)) fail('word', `${file}:${index + 1} contains ${wordsIn(line)}`);
  });
}

// 4. npm dependencies.
const pkg = JSON.parse(readText('package.json'));
for (const field of [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
]) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    if (manifest.forbiddenDependencies.includes(name)) {
      fail('dependency', `package.json ${field} declares ${name}`);
    }
  }
}

// 5. Network APIs. An API name counts when it stands alone or hangs off a global
// object (`fetch(`, `typeof fetch`, `globalThis.fetch`, `from 'axios'`); a method
// of the same name on another object, such as `NetInfo.fetch()`, does not.
const { paths: networkPaths, apis } = manifest.networkCheck;
const apiNames = apis.map(escapeRegExp).join('|');
const apiPattern = new RegExp(
  `(?<![\\w$.])(?:${apiNames})(?![\\w$])|\\b(?:globalThis|window|self|global)\\s*\\.\\s*(?:${apiNames})(?![\\w$])`,
  'g'
);

for (const file of files) {
  if (!CODE_EXTENSIONS.test(file) || !networkPaths.some((path) => file.startsWith(path))) continue;
  readText(file)
    .split('\n')
    .forEach((line, index) => {
      const found = line.match(apiPattern);
      if (found) fail('network', `${file}:${index + 1} uses ${[...new Set(found)].join(', ')}`);
    });
}

// 6. Expo config. Checks the evaluated config, and the source text so that keys and
// plugins added only under some environment variables are caught too.
const { file: appConfigFile, forbiddenKeys } = manifest.appConfig;
const appConfigText = readText(appConfigFile);
const packageOf = (specifier) =>
  specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');

const findKey = (value, key, path = []) => {
  if (!(value instanceof Object)) return [];
  return Object.entries(value).flatMap(([name, child]) => [
    ...(name === key ? [[...path, name].join('.')] : []),
    ...findKey(child, key, [...path, name]),
  ]);
};

for (const key of forbiddenKeys) {
  const name = key.split('.').pop();
  if (new RegExp(`(?<![\\w$.])(['"]?)${escapeRegExp(name)}\\1\\s*:`).test(appConfigText)) {
    fail('app-config', `${appConfigFile} source sets ${name}`);
  }
}
for (const dependency of manifest.forbiddenDependencies) {
  if (new RegExp(`['"\`]${escapeRegExp(dependency)}['"\`/]`).test(appConfigText)) {
    fail('app-config', `${appConfigFile} source references ${dependency}`);
  }
}

let exp;
try {
  const requireFromExpo = createRequire(join(root, 'node_modules/expo/package.json'));
  ({ exp } = requireFromExpo('@expo/config').getConfig(root, {
    skipSDKVersionRequirement: true,
  }));
} catch (error) {
  fail(
    'app-config',
    `could not evaluate the Expo config (run pnpm install first): ${error.message}`
  );
}
if (exp) {
  // A dotted key is an exact path; a plain key counts at any depth (`ios.runtimeVersion`).
  for (const key of forbiddenKeys) {
    const paths = key.includes('.')
      ? [key].filter((path) => getKeyPath(exp, path) !== undefined)
      : findKey(exp, key);
    for (const path of paths) fail('app-config', `evaluated config sets ${path}`);
  }
  for (const plugin of exp.plugins ?? []) {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    if (typeof name === 'string' && manifest.forbiddenDependencies.includes(packageOf(name))) {
      fail('app-config', `evaluated config loads plugin ${name}`);
    }
  }
}

// 7. Secrets.
if (skipSecrets) {
  console.warn('check:lite: secret scan skipped (--skip-secrets)');
} else if (spawnSync('gitleaks', ['version'], { stdio: 'ignore' }).status !== 0) {
  fail(
    'secrets',
    'gitleaks is not installed; install it (https://github.com/gitleaks/gitleaks) or pass --skip-secrets'
  );
} else {
  const staging = mkdtempSync(join(tmpdir(), 'check-lite-'));
  try {
    for (const file of files) {
      mkdirSync(dirname(join(staging, file)), { recursive: true });
      copyFileSync(join(root, file), join(staging, file));
    }
    // Scanning from inside the copy keeps the reported paths relative to the repository.
    const config = join(root, '.gitleaks.toml');
    const scan = spawnSync(
      'gitleaks',
      ['dir', '.', '--config', config, '--no-banner', '--redact', '--exit-code', '1'],
      { cwd: staging, stdio: 'inherit' }
    );
    if (scan.status !== 0) fail('secrets', 'gitleaks reported findings (see output above)');
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.error(`check:lite failed with ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(`check:lite passed (${files.length} files checked)`);
