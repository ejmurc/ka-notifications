import type { Store } from 'keysub';
import type { StorageData } from '../../types/extension';
import { StorageManager } from '../../lib/storage';

export async function setupTheme(store: Store<StorageData>): Promise<void> {
  const theme = document.getElementById('theme');
  theme.addEventListener('change', () => {
    StorageManager.set('darkTheme', theme.checked);
  });
}
