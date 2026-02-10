import { handleCookieChange } from './cookies';
import { handleAlarm } from './alarms';
import { setupBadge } from './badge';
import { refreshNotifications } from './refresh';
import { ALARM_NAME } from '../lib/constants';

chrome.cookies.onChanged.addListener(handleCookieChange);
chrome.alarms.onAlarm.addListener(handleAlarm);

chrome.alarms.clear(ALARM_NAME);
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });

setupBadge();
refreshNotifications();
