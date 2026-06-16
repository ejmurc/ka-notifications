import type { GetNotificationsForUserResponse, NotificationsResponse } from '../../types/api';
import { request } from './request';

export async function getNotificationsForUser(
  after: string,
): Promise<NotificationsResponse | undefined> {
  const response = await request('getNotificationsForUser', undefined, { after });
  if (!response.ok) {
    console.error(
      `getNotificationsForUser failed with status ${response.status}: ${await response.text()}`,
    );
    return undefined;
  }
  const json = (await response.json()) as GetNotificationsForUserResponse;
  const data = json?.data?.user?.notifications;
  if (!data) {
    return undefined;
  }
  return {
    after: data.pageInfo.nextCursor,
    notifications: data.notifications,
  };
}

export async function clearBrandNewNotifications(token: string): Promise<boolean> {
  const response = await request('clearBrandNewNotifications', token);
  if (!response.ok) {
    console.error(
      `clearBrandNewNotifications failed with status ${response.status}: ${await response.text()}`,
    );
    return false;
  }
  return true;
}
