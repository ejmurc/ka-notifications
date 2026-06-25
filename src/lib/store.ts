import { createStore } from 'keysub';
import { StorageManager } from './storage';
import { defaults, storageKeyset } from './defaults';
import type { StorageData } from '../types/extension';

export async function createAppStore() {
  const stored = await StorageManager.getAll();
  const store = createStore({ ...defaults, ...stored });
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'local') return;
    const patch = Object.entries(changes).reduce<Partial<StorageData>>(
      (acc, [key, { newValue }]) => {
        if (storageKeyset.has(key)) {
          (acc as Record<string, unknown>)[key] = newValue;
        }
        return acc;
      },
      {},
    );
    if (Object.keys(patch).length > 0) store.patch(patch);
  });
  return store;
}
