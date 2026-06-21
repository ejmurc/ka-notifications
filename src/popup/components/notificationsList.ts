import { getNotificationsForUser } from '../../lib/api/notifications';
import { createNotificationString } from '../notification-builder';
import { addReplyButtonEventListeners } from '../reply-handler';
import type { AppStore } from '../../lib/store';
import type { StorageData } from '../../types/extension';

export async function setupNotificationsList(store: AppStore) {
  let cursor = '';
  let loading = false;

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
    const spinner = document.getElementById('notifications-spinner');
    if (!cursor && spinner) spinner.style.display = 'none';
  };

  let unsubscribe: () => void;
  const { notifications, notificationCursor } = await new Promise(resolve => {
    unsubscribe = store.subscribe(['notifications', 'notificationCursor'], values => {
      if (values.notificationCursor) {
        resolve(values);
      }
    });
  });
  unsubscribe();

  cursor = notificationCursor ?? '';
  const spinner = document.getElementById('notifications-spinner');
  if (!cursor && spinner) spinner.style.display = 'none';

  const list = document.getElementById('notifications-list');
  if (list) {
    if (!notifications?.length) {
      list.innerHTML = '<li class="notification-empty">No notifications yet.</li>';
    } else {
      list.innerHTML = notifications.map(createNotificationString).join('');
      addReplyButtonEventListeners();
    }
  }

  document.body.addEventListener('scroll', onScroll);
}
