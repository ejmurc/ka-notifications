import type { Store } from 'keysub';
import type { StorageData } from '../../types/extension';
import { StorageManager } from '../../lib/storage';
import { setupSelectDropdown } from './selectDropdown';

export function setupThemeSelect(store: Store<StorageData>): void {
  const menu = document.getElementById('theme-select-menu');
  store.subscribe(['aceThemes', 'editorSettings'], ({ aceThemes, editorSettings }) => {
    if (!menu) return;
    menu.innerHTML = '';
    for (const theme of aceThemes ?? []) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'dropdown-item';
      btn.dataset['value'] = theme;
      btn.textContent = theme
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      li.appendChild(btn);
      menu.appendChild(li);
    }
    const setValue = setupSelectDropdown('theme-select-trigger', 'theme-select-menu', theme => {
      StorageManager.set('editorSettings', {
        ...editorSettings,
        theme,
      });
    });
    setValue(editorSettings?.theme ?? 'textmate');
  });
}
