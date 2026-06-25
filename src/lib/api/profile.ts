import type { GetFullUserProfileResponse } from '../../types/api';
import { request } from './request';

type UserProfile = NonNullable<GetFullUserProfileResponse['data']['user']>;

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
