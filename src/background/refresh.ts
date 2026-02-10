import type { KhanAcademyNotification } from '../types/notification';
import { getAuthToken, getNotificationsForUser } from '../lib/api';
import { isNetworkError } from '../lib/error';

export async function refreshNotifications(): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    chrome.action.setBadgeText({ text: '' });
    chrome.storage.local.set({
      notifications: {
        status: 'loggedOut',
        data: [],
        cursor: '',
      },
    });
    return;
  }
  const notifications: KhanAcademyNotification[] = [];
  let after: string = '';
  while (notifications.length < 100) {
    try {
      const response = await getNotificationsForUser(after);
      if (!response) break;
      const batch: KhanAcademyNotification[] = response.notifications;
      notifications.push(...batch);
      if (!response.after || batch.some((n) => !n.brandNew)) break;
      after = response.after;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('[getNotificationsForUser] Network connection lost. Attempting to reconnect...');
        return;
      } else {
        console.error(error);
        break;
      }
    }
  }
  if (notifications.length === 0) {
    await chrome.action.setBadgeText({ text: '' });
    await chrome.storage.local.set({
      notifications: {
        status: 'ok',
        data: [],
        cursor: '',
      },
    });
  } else {
    const nextCursor = after || '';
    await chrome.storage.local.set({
      prefetchData: notifications,
      prefetchCursor: nextCursor,
    });
    const newCount = notifications.filter((n) => n.brandNew).length;
    const badgeText = newCount === 0 ? '' : newCount > 98 ? '99+' : newCount.toString();
    await chrome.action.setBadgeText({ text: badgeText });
  }
}
