import type { GetFullUserProfileResponse } from '../../types/api';
import type { UserProfile } from '../../types/extension';
import { request } from './request';

export async function getFullUserProfile(): Promise<UserProfile | undefined> {
  const response = await request('getFullUserProfile');
  if (!response.ok) {
    console.error(
      `getFullUserProfile failed with status ${response.status}: ${await response.text()}`,
    );
    return undefined;
  }
  const json = (await response.json()) as GetFullUserProfileResponse;
  return json?.data?.user ?? undefined;
}
