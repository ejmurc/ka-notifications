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

chrome.storage.local.remove(['prefetchCursor', 'prefetchData', 'editorSettings']);
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
    const notificationCountResponse = await khanApiFetch('getFullUserProfile');
    if (!notificationCountResponse.ok) {
      throw new Error(
        `getFullUserProfile failed with status ${notificationCountResponse.status}: ${await notificationCountResponse.text()}`,
      );
    }
    const notificationCountText = await notificationCountResponse.text();
    const notificationCountJSON = JSON.parse(notificationCountText);
    const notificationCount = notificationCountJSON?.data?.user?.newNotificationCount;

    if (notificationCount === null) {
      chrome.alarms.clear(ALARM_NAME);
      await chrome.storage.local.remove(['prefetchCursor']);
      await chrome.storage.local.set({
        prefetchData: '$logged_out',
      });
      return;
    }

    const notificationsResponse = await khanApiFetch('getNotificationsForUser');
    if (!notificationsResponse.ok) {
      throw new Error(
        `getNotificationsForUser failed with status ${notificationsResponse.status}: ${await notificationsResponse.text()}`,
      );
    }
    const notificationsText = await notificationsResponse.text();
    const notificationsJSON = JSON.parse(notificationsText);
    const notifications = notificationsJSON?.data?.user?.notifications;

    if (notifications === null) {
      await chrome.action.setBadgeText({
        text: '',
      });
      await chrome.storage.local.remove(['prefetchCursor']);
      await chrome.storage.local.set({
        prefetchData: [],
      });
      return;
    }

    await chrome.storage.local.set({
      prefetchData: notifications.notifications,
      prefetchCursor: notifications.pageInfo.nextCursor,
    });

    const badgeText = notificationCount === 0 ? '' : notificationCount > 98 ? '99+' : notificationCount.toString();
    await chrome.action.setBadgeText({ text: badgeText });
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
