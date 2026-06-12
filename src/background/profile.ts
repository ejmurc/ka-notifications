import { getFullUserProfile, getAvatarDataForProfile, getStreak } from '../lib/api';
import { StorageManager } from '../lib/storage';
import { isNetworkError } from '../lib/error';

export async function syncUserProfile(): Promise<void> {
  try {
    const profile = await getFullUserProfile();
    if (!profile) return;

    await StorageManager.set('authenticated', true);

    const parsed = JSON.parse(profile.badgeCounts);
    const badgeCounts = [];
    for (let i = 0; i < 6; i++) {
      badgeCounts[i] = parsed[i];
    }

    const [avatarSrc, streak] = await Promise.all([
      getAvatarDataForProfile(profile.kaid),
      getStreak(),
      StorageManager.set({
        nickname: profile.nickname,
        username: profile.username,
        points: profile.points,
        badgeCounts,
      }),
    ]);

    await StorageManager.set({
      ...(avatarSrc && { avatarSrc }),
      ...(streak !== undefined && { streak }),
      profileLoaded: true,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn('[syncUserProfile] Network connection lost. Attempting to reconnect...');
      return;
    }
    console.error('[syncUserProfile]', error);
  }
}
