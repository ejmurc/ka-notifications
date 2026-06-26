import { handleCookieChange } from './cookies';
import { handleAlarm } from './alarms';
import { setupBadge } from './badge';
import { syncNotifications } from './notifications';
import { syncUserProfile } from './profile';
import { syncMonospaceFonts } from './fonts';
import { syncAceThemes } from './themes';
import { ALARM_NAME } from '../lib/constants';
import { StorageManager } from '../lib/storage';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    await StorageManager.remove([
      'authenticated',
      'avatarSrc',
      'notifications',
      'notificationCursor',
      'notificationsLoaded',
      'nickname',
      'username',
      'points',
      'profileLoaded',
    ]);
    await Promise.all([
      syncUserProfile(),
      syncNotifications(),
      syncMonospaceFonts(),
      syncAceThemes(),
    ]);
  }
});

chrome.cookies.onChanged.addListener(handleCookieChange);
chrome.alarms.onAlarm.addListener(handleAlarm);
chrome.alarms.clear(ALARM_NAME);
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
setupBadge();
