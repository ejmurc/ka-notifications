import { StorageData } from '../../types/extension';
import { KHAN_AVATAR_BASE_URL } from '../../lib/constants';

type avatarKeys = Pick<StorageData, 'avatarSrc', 'nickname'>;
export function renderAvatar({ nickname, avatarSrc }: avatarKeys): void {
  const container = document.getElementById('avatar-container');
  if (!container) return;
  const src = KHAN_AVATAR_BASE_URL + avatarSrc;
  const existing = container.firstElementChild;
  if (existing instanceof HTMLImageElement) {
    existing.src = src;
    existing.alt = `${nickname}'s avatar`;
    existing.onerror = () => existing.replaceWith(createInitialAvatar(nickname));
    return;
  }
  const img = createImageAvatar(nickname, src);
  if (existing) {
    existing.replaceWith(img);
  } else {
    container.appendChild(img);
  }
}

function createImageAvatar(nickname: string, avatarSrc: string): HTMLImageElement {
  const img = document.createElement('img');
  img.className = 'avatar-img';
  img.alt = `${nickname}'s avatar`;
  img.src = avatarSrc;
  img.onerror = () => img.replaceWith(createInitialAvatar(nickname));
  return img;
}

function createInitialAvatar(nickname: string): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'avatar-initial';
  div.textContent = nickname.charAt(0).toUpperCase();
  return div;
}
