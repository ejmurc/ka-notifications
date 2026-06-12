import { StorageManager } from '../lib/storage';

export async function syncMonospaceFonts() {
  const response = await fetch('https://fonts.bunny.net/list');
  const fontsJson = await response.json();
  const monospaceFonts = Object.entries(fontsJson)
    .reduce<{ key: string; family: string }[]>((acc, [key, font]) => {
      if (font.category === 'monospace') {
        acc.push({ key, family: font.familyName });
      }
      return acc;
    }, [])
    .sort((a, b) => a.family.localeCompare(b.family));
  StorageManager.set('monospaceFonts', monospaceFonts);
}
