import type { StreakQueryResponse } from '../../types/api';
import { request } from './request';

export async function getStreak(): Promise<number | undefined> {
  const response = await request('StreakQuery');
  if (!response.ok) {
    console.error(`StreakQuery failed with status ${response.status}: ${await response.text()}`);
    return undefined;
  }
  const json = (await response.json()) as StreakQueryResponse;
  return json?.data?.user?.stpStreak?.length ?? undefined;
}
