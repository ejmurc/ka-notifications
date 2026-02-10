import { ALARM_NAME } from '../lib/constants';
import { refreshNotifications } from './refresh';

export function handleAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name === ALARM_NAME) {
    refreshNotifications();
  }
}
