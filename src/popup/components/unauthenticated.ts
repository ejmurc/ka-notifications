import type { StorageData } from '../../types/extension';

export function renderUnauthenticated({
  authenticated,
  profileLoaded,
}: Pick<StorageData, 'authenticated' | 'profileLoaded'>): void {
  const unauthenticated = document.getElementById('unauthenticated');
  const signin = document.getElementById('signin');
  const loadingProfile = document.getElementById('loading-profile');

  if (!unauthenticated || !signin || !loadingProfile) return;

  unauthenticated.style.display = authenticated && profileLoaded ? 'none' : 'flex';
  signin.style.display = authenticated ? 'none' : 'flex';
  loadingProfile.style.display = authenticated && !profileLoaded ? 'flex' : 'none';
}
