import type { Store } from 'keysub';
import type { StorageData, EditorSettings } from '../../types/extension';
import { StorageManager } from '../../lib/storage';
import { setupSelectDropdown } from './selectDropdown';

export function setupEditorSettings(store: Store<StorageData>): void {
  const toggles: { id: string; key: keyof EditorSettings }[] = [
    { id: 'wrap', key: 'wrap' },
    { id: 'show-line-numbers', key: 'showLineNumbers' },
    { id: 'show-gutter', key: 'showGutter' },
    { id: 'behaviours', key: 'behavioursEnabled' },
    { id: 'autocompletion', key: 'autocompletion' },
    { id: 'slim-cursor', key: 'slimCursor' },
    { id: 'soft-tabs', key: 'softTabs' },
    { id: 'indent-guides', key: 'displayIndentGuides' },
    { id: 'wide-editor', key: 'wideEditor' },
  ];

  const dropdowns: { triggerId: string; menuId: string; key: keyof EditorSettings }[] = [
    { triggerId: 'font-size-select-trigger', menuId: 'font-size-select-menu', key: 'fontSize' },
    { triggerId: 'theme-select-trigger', menuId: 'theme-select-menu', key: 'theme' },
    { triggerId: 'tab-size-select-trigger', menuId: 'tab-size-select-menu', key: 'tabSize' },
    {
      triggerId: 'line-height-select-trigger',
      menuId: 'line-height-select-menu',
      key: 'lineHeight',
    },
  ];

  const setValueFns = new Map<keyof EditorSettings, (value: string) => void>();

  for (const { triggerId, menuId, key } of dropdowns) {
    const setValue = setupSelectDropdown(triggerId, menuId, value => {
      const current = store.get();
      StorageManager.set('editorSettings', { ...current.editorSettings, [key]: value });
    });
    setValueFns.set(key, setValue);
  }

  for (const { id, key } of toggles) {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (!checkbox) continue;
    checkbox.addEventListener('change', () => {
      const current = store.get();
      StorageManager.set('editorSettings', { ...current.editorSettings, [key]: checkbox.checked });
    });
  }

  store.subscribe(['editorSettings'], ({ editorSettings }) => {
    if (!editorSettings) return;

    for (const { id, key } of toggles) {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox) checkbox.checked = editorSettings[key] as boolean;
    }

    for (const { key } of dropdowns) {
      setValueFns.get(key)?.(String(editorSettings[key] ?? ''));
    }
  });
}
