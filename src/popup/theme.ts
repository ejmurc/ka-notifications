import type { MdIconButton } from '@material/web/iconbutton/icon-button.js';
import { StorageManager } from '../lib/storage';

export async function initializeTheme(): void {
  let theme = (await StorageManager.getItem('theme')) ?? 'light';
  const themeButton = document.getElementById('notifications-theme-toggle') as MdIconButton;
  themeButton.addEventListener('click', () => {
    theme = themeButton.selected ? 'dark' : 'light';
    document.body.className = theme;
    StorageManager.setItem('theme', theme);
  });
  themeButton.selected = theme === 'dark';
  document.body.className = theme;
}
