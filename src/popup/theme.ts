import type { StorageData } from '../types/extension';
import { StorageManager } from '../lib/storage';

export function onThemeChanged({ darkTheme }: Pick<StorageData, 'darkTheme'>): Promise<void> {
  const root = document.documentElement;
  if (darkTheme === true) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const el = document.getElementById('theme');
  if (el) {
    el.checked = darkTheme === true;
  }
}
