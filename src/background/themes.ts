import { StorageManager } from '../lib/storage';

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
}
