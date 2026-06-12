import { getAuthToken } from '../../lib/api/auth';
import { clearBrandNewNotifications } from '../../lib/api/notifications';
import { StorageManager } from '../../lib/storage';

export function setupMarkAllRead(): void {
  const markAllRead = document.getElementById('markAllRead');
  if (!markAllRead || markAllRead.disabled) return;
  markAllRead.addEventListener('click', async () => {
    markAllRead.disabled = true;
    const token = await getAuthToken();
    if (!token) return;
    const success = await clearBrandNewNotifications(token);
    if (!success) return;
    markAllRead.disabled = false;
  });
}
