import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(__dirname, '..', '..', 'app');

function collectRoutes(dir: string, segments: string[], routes: string[][]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Route groups such as `(tabs)` do not add a URL segment.
      const isGroup = /^\(.+\)$/.test(entry.name);
      collectRoutes(
        path.join(dir, entry.name),
        isGroup ? segments : [...segments, entry.name],
        routes
      );
      continue;
    }
    const match = /^(.+)\.tsx$/.exec(entry.name);
    if (!match) continue;
    const name = match[1];
    if (name.startsWith('_') || name.startsWith('+')) continue;
    routes.push(name === 'index' ? segments : [...segments, name]);
  }
}

const ROUTES: string[][] = [];
collectRoutes(APP_DIR, [], ROUTES);

/** Whether a path such as `/showcase/theming` resolves to a screen file under `app/`. */
export function routeExists(href: string) {
  const parts = href.split('?')[0].split('/').filter(Boolean);
  return ROUTES.some(
    (route) =>
      route.length === parts.length &&
      route.every((segment, index) => /^\[.+\]$/.test(segment) || segment === parts[index])
  );
}
