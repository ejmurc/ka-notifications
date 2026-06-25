import { StorageManager } from '../lib/storage';

interface BunnyFont {
  category: string;
  familyName: string;
}

export async function syncMonospaceFonts() {
  const response = await fetch('https://fonts.bunny.net/list');
  const fontsJson = (await response.json()) as Record<string, BunnyFont>;
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
