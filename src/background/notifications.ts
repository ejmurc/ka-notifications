import type { KhanAcademyNotification } from '../types/notification';
import { getAuthToken, getNotificationsForUser } from '../lib/api';
import { isNetworkError } from '../lib/error';
import { StorageManager } from '../lib/storage';

export async function syncNotifications(): Promise<void> {
  const token = await getAuthToken();

  if (!token) {
    await Promise.all([
      chrome.action.setBadgeText({ text: '' }),
      StorageManager.set('authenticated', false),
      StorageManager.set('notifications', []),
      StorageManager.set('notificationCursor', ''),
      StorageManager.set('notificationsLoaded', false),
    ]);
    return;
  }

  StorageManager.set('authenticated', true);

  const notifications: KhanAcademyNotification[] = [];
  let after = '';

  while (notifications.length < 100) {
    try {
      const response = await getNotificationsForUser(after);
      if (!response) break;

      const batch: KhanAcademyNotification[] = response.notifications;
      notifications.push(...batch);

      after = response.after ?? '';

      if (!response.after || batch.some(n => !n.brandNew)) break;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('[refreshNotifications] Network connection lost. Attempting to reconnect...');
        return;
      }
      console.error('[refreshNotifications]', error);
      break;
    }
  }

  const newCount = notifications.filter(n => n.brandNew).length;
  const badgeText = newCount === 0 ? '' : newCount > 98 ? '99+' : newCount.toString();

  await Promise.all([
    chrome.action.setBadgeText({ text: badgeText }),
    StorageManager.set('notifications', notifications),
    StorageManager.set('notificationCursor', after),
    StorageManager.set('notificationsLoaded', true),
  ]);
}
