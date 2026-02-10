import { ALARM_NAME } from '../lib/constants';
import { StorageManager } from '../lib/storage';
import { refreshNotifications } from './refresh';

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
      await StorageManager.removeItem('cursor');
      await StorageManager.setItem('authenticated', false);
    } else {
      await StorageManager.removeAll(['cursor', 'notifications']);
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
      refreshNotifications();
    }
  }
}
