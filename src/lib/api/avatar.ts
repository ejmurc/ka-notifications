import type { AvatarDataForProfileResponse } from '../../types/api';
import { request } from './request';

export async function getAvatarDataForProfile(kaid: string): Promise<string | undefined> {
  const response = await request('avatarDataForProfile', undefined, { kaid });
  if (!response.ok) {
    console.error(
      `avatarDataForProfile failed with status ${response.status}: ${await response.text()}`,
    );
    return undefined;
  }
  const json = (await response.json()) as AvatarDataForProfileResponse;
  return json?.data?.user?.avatar?.imageSrc ?? undefined;
}
