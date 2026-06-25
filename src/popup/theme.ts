import type { StorageData } from '../types/extension';

export function onThemeChanged({ darkTheme }: Pick<StorageData, 'darkTheme'>): void {
  const root = document.documentElement;
  root.classList.add('no-transition');
  void root.offsetWidth;

  if (darkTheme === true) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  void root.offsetWidth;
  root.classList.remove('no-transition');

  const el = document.getElementById('theme') as HTMLInputElement | null;
  if (el) {
    el.checked = darkTheme === true;
  }
}
