import { getAuthToken } from '../../lib/api/auth';
import { clearBrandNewNotifications } from '../../lib/api/notifications';

export function setupMarkAllRead(): void {
  const markAllRead = document.getElementById('mark-all-read') as HTMLButtonElement | null;
  if (!markAllRead || markAllRead.disabled) return;
  markAllRead.addEventListener('click', async () => {
    markAllRead.disabled = true;
    const token = await getAuthToken();
    if (!token) return;
    const success = await clearBrandNewNotifications(token);
    if (!success) return;
    chrome.action.setBadgeText({ text: '' });
    markAllRead.disabled = false;
  });
}
