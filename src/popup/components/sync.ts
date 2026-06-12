import {
  getNotificationsForUser,
  getFullUserProfile,
  getAvatarDataForProfile,
  getAuthToken,
} from '../../lib/api';
import { isNetworkError } from '../../lib/error';
import type { Store } from 'keysub';
import type { StorageData } from '../../types/extension';

export function setupSync(store: Store<StorageData>): void {
  const btn = document.getElementById('sync') as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.classList.add('spinning');
    btn.disabled = true;
    try {
      await Promise.all([syncNotifications(store), syncUserProfile(store)]);
    } finally {
      btn.classList.remove('spinning');
      btn.disabled = false;
    }
  });
}

async function syncNotifications(store: Store<StorageData>): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    store.patch({
      authenticated: false,
      notifications: [],
      notificationCursor: '',
    });
    return;
  }
  const notifications = [];
  let after = '';
  while (notifications.length < 100) {
    try {
      const response = await getNotificationsForUser(after);
      if (!response) break;

      const batch = response.notifications;
      notifications.push(...batch);

      if (!response.after || batch.some(n => !n.brandNew)) break;
      after = response.after;
    } catch (error) {
      if (!isNetworkError(error)) console.error('[syncNotifications]', error);
      break;
    }
  }
  store.patch({
    authenticated: true,
    notifications,
    notificationCursor: after,
  });
  const newCount = notifications.filter(n => n.brandNew).length;
  const badgeText = newCount === 0 ? '' : newCount > 98 ? '99+' : newCount.toString();
  await chrome.action.setBadgeText({ text: badgeText });
}

async function syncUserProfile(store: Store<StorageData>): Promise<void> {
  try {
    const profile = await getFullUserProfile();
    if (!profile) return;

    const avatarSrc = await getAvatarDataForProfile(profile.kaid);

    store.patch({
      nickname: profile.nickname,
      username: profile.username,
      points: profile.points,
      ...(avatarSrc && { avatarSrc }),
    });
  } catch (error) {
    if (!isNetworkError(error)) console.error('[syncUserProfile]', error);
  }
}
