import { handleCookieChange } from './cookies';
import { handleAlarm } from './alarms';
import { setupBadge } from './badge';
import { syncNotifications } from './notifications';
import { syncUserProfile } from './profile';
import { syncMonospaceFonts } from './fonts';
import { ALARM_NAME } from '../lib/constants';
import { StorageManager } from '../lib/storage';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    await StorageManager.remove([
      'authenticated',
      'notifications',
      'notificationCursor',
      'nickname',
      'username',
      'points',
      'avatarSrc',
      'profileLoaded',
    ]);
    await Promise.all([syncUserProfile(), syncNotifications(), syncMonospaceFonts()]);
  }
});

chrome.cookies.onChanged.addListener(handleCookieChange);
chrome.alarms.onAlarm.addListener(handleAlarm);
chrome.alarms.clear(ALARM_NAME);
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
setupBadge();
