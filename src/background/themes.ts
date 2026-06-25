import { StorageManager } from '../lib/storage';

const THEMES_CACHE_NAME = 'ace-themes-v1';
const CDN_BASE = 'https://cdn.jsdelivr.net/npm/ace-builds@latest/src-min-noconflict';

export async function syncAceThemes(): Promise<void> {
  const metaResponse = await fetch('https://data.jsdelivr.com/v1/packages/npm/ace-builds');
  const meta = await metaResponse.json();
  const latest = meta.tags.latest;

  const filesResponse = await fetch(
    `https://data.jsdelivr.com/v1/packages/npm/ace-builds@${latest}?structure=flat`,
  );
  const { files } = await filesResponse.json();
  const themes = (files as { name: string }[])
    .map(f => f.name.match(/\/src-min-noconflict\/theme-(.+)\.js$/)?.[1])
    .filter((t): t is string => !!t)
    .toSorted();

  StorageManager.set('aceThemes', themes);

  const cache = await caches.open(THEMES_CACHE_NAME);
  await Promise.allSettled(
    themes.map(async theme => {
      const url = `${CDN_BASE}/theme-${theme}.js`;
      const existing = await cache.match(url);
      if (existing?.ok) return;
      const fresh = await fetch(url);
      if (fresh.ok) cache.put(url, fresh.clone());
    }),
  );
}
