import type { MdIconButton } from '@material/web/iconbutton/icon-button.js';

export function initializeNavigation(): void {
  const toggle = document.getElementById('notifications-page-toggle') as MdIconButton;
  const settingsSection = document.getElementById('settings-section') as HTMLDivElement;
  const notificationsSection = document.getElementById('notifications-section') as HTMLDivElement;

  toggle.addEventListener('click', async () => {
    if (toggle.selected) {
      notificationsSection.classList.add('hidden');
      settingsSection.classList.remove('hidden');
    } else {
      notificationsSection.classList.remove('hidden');
      settingsSection.classList.add('hidden');
    }
  });
}
