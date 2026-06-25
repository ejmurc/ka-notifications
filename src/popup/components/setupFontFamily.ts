import type { Store } from 'keysub';
import type { StorageData, EditorSettings } from '../../types/extension';
import { StorageManager } from '../../lib/storage';
import { setupSelectDropdown } from './selectDropdown';

export async function setupFontFamily(store: Store<StorageData>): Promise<void> {
  const menu = document.getElementById('font-family-select-menu');
  let currentSettings: EditorSettings | null = null;
  let setValue: (value: string) => void = () => {};
  const loadedFonts = new Set<string>();

  function loadFont(btn: HTMLButtonElement) {
    const fontKey = btn.dataset['value'];
    if (!fontKey || loadedFonts.has(fontKey)) return;
    loadedFonts.add(fontKey);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.bunny.net/css?family=${fontKey}`;
    document.head.appendChild(link);
    btn.style.fontFamily = btn.textContent!.trim();
  }

  store.subscribe(['monospaceFonts'], ({ monospaceFonts }) => {
    if (!menu) return;
    menu.innerHTML = '';
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          loadFont(entry.target as HTMLButtonElement);
          observer.unobserve(entry.target);
        }
      },
      { root: menu, threshold: 0, rootMargin: '0px 0px 120px 0px' },
    );
    const defaultItem = document.createElement('li');
    const defaultBtn = document.createElement('button');
    defaultBtn.className = 'dropdown-item';
    defaultBtn.dataset['value'] = '';
    defaultBtn.textContent = 'Default';
    defaultItem.appendChild(defaultBtn);
    menu.appendChild(defaultItem);
    for (const font of monospaceFonts ?? []) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'dropdown-item';
      btn.dataset['value'] = font.key;
      btn.textContent = font.family;
      observer.observe(btn);
      li.appendChild(btn);
      menu.appendChild(li);
    }
    setValue = setupSelectDropdown(
      'font-family-select-trigger',
      'font-family-select-menu',
      fontKey => {
        const font = (monospaceFonts ?? []).find(f => f.key === fontKey);
        if (!currentSettings) return;
        StorageManager.set('editorSettings', {
          ...currentSettings,
          fontKey: font?.key ?? '',
          fontFamily: font?.family ?? 'Default',
        });
      },
    );
    setValue(currentSettings?.fontKey ?? '');
  });

  store.subscribe(['editorSettings'], ({ editorSettings }) => {
    currentSettings = editorSettings;
    setValue(editorSettings?.fontKey ?? '');
  });
}
