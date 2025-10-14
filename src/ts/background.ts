import type { KhanAcademyNotification } from '../@types/notification.d.ts';
import { khanApiFetch, getAuthToken } from '../utils/khan-api';

const ALARM_NAME = 'KHAN_ACADEMY_NOTIFICATIONS';

// Authentication status monitoring
chrome.cookies.onChanged.addListener(async ({ cookie, removed }) => {
  if (cookie.name === 'KAAS') {
    chrome.action.setBadgeText({ text: '' });
    chrome.alarms.clear(ALARM_NAME);
    if (removed) {
      chrome.storage.local.remove(['prefetchCursor']);
      chrome.storage.local.set({
        prefetchData: '$logged_out',
      });
    } else {
      chrome.storage.local.remove(['prefetchCursor', 'prefetchData']);
      chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: 1,
      });
      refreshNotifications();
    }
  }
});

// Refresh notifications every minute
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    refreshNotifications();
  }
});

chrome.alarms.clear(ALARM_NAME);

chrome.alarms.create(ALARM_NAME, {
  periodInMinutes: 1,
});

chrome.storage.local.remove(['prefetchCursor', 'prefetchData']);
refreshNotifications();

// Teal background for notification count badge
chrome.action.setBadgeBackgroundColor({
  color: '#00BFA5',
});

async function refreshNotifications() {
  const token = await getAuthToken();
  if (token === undefined) {
    chrome.action.setBadgeText({ text: '' });
    chrome.storage.local.remove(['prefetchCursor']);
    chrome.storage.local.set({
      prefetchData: '$logged_out',
    });
    return;
  }

  try {
    const notifications: KhanAcademyNotification[] = [];
    let nextCursor = '';
    for (;;) {
      const response = await khanApiFetch('getNotificationsForUser', undefined, { after: nextCursor });
      if (!response.ok) {
        throw new Error(`getNotificationsForUser failed with status ${response.status}: ${await response.text()}`);
      }
      const json = await response.json();
      const data = json?.data?.user?.notifications;
      if (!data || !data.notifications) break;
      const batch: KhanAcademyNotification[] = data.notifications;
      notifications.push(...batch);
      nextCursor = data.pageInfo?.nextCursor;
      if (batch.some((n) => !n.brandNew) || notifications.length > 99 || !nextCursor) break;
    }
    if (notifications.length === 0) {
      await chrome.action.setBadgeText({
        text: '',
      });
      await chrome.storage.local.remove(['prefetchCursor']);
      await chrome.storage.local.set({
        prefetchData: [],
      });
    } else {
      await chrome.storage.local.set({
        prefetchData: notifications,
        prefetchCursor: nextCursor,
      });
      console.log(notifications);
      let notificationCount = 0;
      for (let i = 0; i < notifications.length; i++) {
        if (!notifications[i].brandNew) {
          break;
        }
        notificationCount++;
      }
      const badgeText = notificationCount === 0 ? '' : notificationCount > 98 ? '99+' : notificationCount.toString();
      await chrome.action.setBadgeText({ text: badgeText });
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('JSON parse error:', err);
    } else if (err instanceof Error) {
      if (err.message.includes('Failed to fetch')) {
        console.warn('Network error - check internet connection');
      } else if (err.message.includes('failed with status')) {
        console.error('API request failed:', err.message);
      } else {
        console.error('Unexpected error:', err);
      }
    }
    console.trace();
  }
}
