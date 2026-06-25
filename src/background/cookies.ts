import { ALARM_NAME } from '../lib/constants';
import { StorageManager } from '../lib/storage';
import { syncNotifications } from './notifications';
import { syncUserProfile } from './profile';

export async function handleCookieChange({
  cookie,
  removed,
}: {
  removed: boolean;
  cookie: chrome.cookies.Cookie;
  cause: chrome.cookies.OnChangedCause;
}) {
  if (cookie.name === 'KAAS') {
    chrome.action.setBadgeText({ text: '' });
    chrome.alarms.clear(ALARM_NAME);
    if (removed) {
      await StorageManager.remove([
        'authenticated',
        'avatarSrc',
        'notifications',
        'notificationCursor',
        'nickname',
        'username',
        'points',
        'profileLoaded',
      ]);
    } else {
      await StorageManager.remove(['notificationCursor', 'notifications']);
      await Promise.all([
        StorageManager.set('authenticated', true),
        syncNotifications(),
        syncUserProfile(),
        chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 }),
      ]);
    }
  }
}
