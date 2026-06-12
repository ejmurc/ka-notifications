import { getNotificationsForUser } from '../../lib/api/notifications';
import { createNotificationString } from '../notification-builder';
import { addReplyButtonEventListeners } from '../reply-handler';
import type { AppStore } from '../../lib/store';

export function setupNotificationsList(store: AppStore) {
  let cursor = '';
  let loading = false;
  let initialRender = true;

  store.subscribe(['notificationCursor'], ({ notificationCursor }) => {
    cursor = notificationCursor ?? '';
  });

  store.subscribe(['notifications'], ({ notifications }) => {
    const list = document.getElementById('notifications-list');
    if (!list) return;
    if (!notifications?.length) {
      list.innerHTML = '<li class="notification-empty">No notifications yet.</li>';
      return;
    }
    if (!initialRender) return;
    initialRender = false;
    list.innerHTML = notifications.map(createNotificationString).join('');
    addReplyButtonEventListeners();
  });

  const onScroll = async () => {
    if (loading || !cursor) return;
    if (document.body.scrollTop + window.innerHeight < document.body.scrollHeight - 64) return;
    loading = true;
    const result = await getNotificationsForUser(cursor);
    loading = false;
    if (!result) return;
    cursor = result.after;
    const list = document.getElementById('notifications-list');
    if (list) {
      list.insertAdjacentHTML(
        'beforeend',
        result.notifications.map(createNotificationString).join(''),
      );
      addReplyButtonEventListeners();
    }
    if (!cursor) document.body.removeEventListener('scroll', onScroll);
  };

  document.body.addEventListener('scroll', onScroll);
}
