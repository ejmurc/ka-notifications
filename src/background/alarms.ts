import { ALARM_NAME } from '../lib/constants';
import { syncUserProfile } from './profile';
import { syncMonospaceFonts } from './fonts';
import { syncNotifications } from './notifications';

export async function handleAlarm({ name }: chrome.alarms.Alarm): Promise<void> {
  if (name === ALARM_NAME) {
    await Promise.all([syncUserProfile(), syncNotifications(), syncMonospaceFonts()]);
  }
}
