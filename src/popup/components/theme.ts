import { StorageManager } from '../../lib/storage';

export function setupTheme(): void {
  const theme = document.getElementById('theme') as HTMLInputElement | null;
  if (!theme) return;
  theme.addEventListener('change', () => {
    StorageManager.set('darkTheme', theme.checked);
  });
}
