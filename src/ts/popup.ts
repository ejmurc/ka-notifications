import { themes } from '../generated/themes';
import { getAuthToken, khanApiFetch } from '../utils/khan-api';
import { createNotificationString, addReplyButtonEventListeners } from '../utils/notification-utils';
import { StringMap } from '../@types/common-types';
import { EditorSettings } from '../@types/extension-types';
import '../css/popup.css';

// Page switching
const settingsSection = document.getElementById('settings-section') as HTMLDivElement;
const notificationsSection = document.getElementById('notifications-section') as HTMLDivElement;
const pageButton = document.getElementById('page-button') as HTMLButtonElement;
const settingsIcon = document.getElementById('settings-icon') as HTMLElement;
const backIcon = document.getElementById('back-icon') as HTMLElement;

pageButton.onclick = () => {
  notificationsSection.classList.toggle('hidden');
  settingsSection.classList.toggle('hidden');
  settingsIcon.classList.toggle('hidden');
  backIcon.classList.toggle('hidden');
};

// Notification handling
const notificationsContainer = document.getElementById('notifications-container') as HTMLDivElement;
const loadingSpinner = document.getElementById('loading-spinner-container') as HTMLDivElement;
let __global_cursor__ = '';
let __loading_notifications__ = false;

function handleScroll(): void {
  if (
    !__loading_notifications__ &&
    Math.abs(notificationsSection.scrollHeight - notificationsSection.scrollTop - notificationsSection.clientHeight) <
      77
  ) {
    __loading_notifications__ = true;
    loadNotifications();
  }
}

async function loadNotifications(): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    notificationsContainer.innerHTML =
      '<li class="notification new"><div class="notification-header"><img class="notification-author-avatar" src="32.png"><h3 class="notification-author-nickname">KA Notifications</h3></div><div class="notification-content">You are logged out. Please <a class="hyperlink" href="https://khanacademy.org/login" target="_blank">log in to Khan Academy</a> to use this extension.</div></li>';
    notificationsSection.onscroll = null;
    loadingSpinner.classList.add('hidden');
    return;
  }

  try {
    const notificationsResponse = await khanApiFetch('getNotificationsForUser', undefined, {
      after: __global_cursor__ || '',
    });
    const notificationsJSON = await notificationsResponse.json();
    const notifications = notificationsJSON?.data?.user?.notifications;

    if (!notifications) {
      notificationsContainer.innerHTML =
        '<li class="notification new"><div class="notification-header"><img class="notification-author-avatar" src="32.png"><h3 class="notification-author-nickname">KA Notifications</h3></div><div class="notification-content">You have no notifications.</div></li>';
      notificationsSection.onscroll = null;
      loadingSpinner.classList.add('hidden');
      return;
    }

    notificationsContainer.innerHTML += notifications.notifications.map(createNotificationString).join('');
    addReplyButtonEventListeners();

    if (notifications.pageInfo?.nextCursor === null) {
      notificationsSection.onscroll = null;
      loadingSpinner.classList.add('hidden');
    } else {
      __global_cursor__ = notifications.pageInfo.nextCursor;
      __loading_notifications__ = false;
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'Failed to fetch') {
      console.warn('Possible network disconnect detected, please check your internet connection.');
    } else {
      console.error(err);
    }
  }
}

const defaultEditorSettings: EditorSettings = {
  fontSize: '14',
  fontFamily: 'default',
  theme: 'textmate',
  wrap: true,
  showLineNumbers: true,
  showGutter: true,
  behavioursEnabled: false,
  enableBasicAutocompletion: false,
  slimCursor: false,
  useSoftTabs: true,
  tabSize: '2',
  lineHeight: '1.2',
  displayIndentGuides: false,
  wideEditor: false,
};

// Local storage
chrome.storage.local.get(
  ['prefetchCursor', 'prefetchData', 'preferredTheme', 'defaultCommentSort', 'editorSettings'],
  async ({ prefetchCursor, prefetchData, preferredTheme, defaultCommentSort, editorSettings }) => {
    if (!editorSettings) {
      editorSettings = defaultEditorSettings;
      await chrome.storage.local.set({ editorSettings });
    }
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    themes.forEach((themeName) => {
      const option = document.createElement('option');
      option.value = themeName;
      option.textContent = themeName;
      themeSelect.appendChild(option);
    });
    themeSelect.value = editorSettings.theme ?? 'textmate';

    const tabSizeSelect = document.getElementById('tabsize-select') as HTMLSelectElement;
    tabSizeSelect.value = editorSettings.tabSize ?? '4';

    const fontSizeInput = document.getElementById('font-size-input') as HTMLInputElement;
    fontSizeInput.value = parseInt(editorSettings.fontSize ?? '14').toString();

    // Get every supported font
    const testElement = document.createElement('span');
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.whiteSpace = 'nowrap';
    testElement.style.fontSize = '16px';
    testElement.textContent = 'iiiiiiiiii';
    document.body.appendChild(testElement);
    testElement.style.fontFamily = 'monospace';
    const controlWidth = testElement.offsetWidth;
    const fontFamilySelect = document.getElementById('font-family-select') as HTMLSelectElement;
    const terminusFont = new FontFace('Terminus', `url(${chrome.runtime.getURL('Terminus.ttf')})`, {
      style: 'normal',
      weight: '400',
    });
    try {
      await terminusFont.load();
      document.fonts.add(terminusFont);
    } catch (error) {
      console.error(error);
    }
    for (const font of [
      'Roboto Mono',
      'Source Code Pro',
      'DejaVu Sans Mono',
      'Droid Sans Mono',
      'Fira Code',
      'Cascadia Code',
      'JetBrains Mono',
      'Ubuntu Mono',
      'Inconsolata',
      'PT Mono',
    ]) {
      testElement.style.fontFamily = font;
      if (testElement.offsetWidth === controlWidth) {
        fontFamilySelect.add(new Option(font, font));
      }
    }
    document.body.removeChild(testElement);
    fontFamilySelect.value = editorSettings.fontFamily ?? 'monospace';

    const lineHeightInput = document.getElementById('line-height-input') as HTMLInputElement;
    lineHeightInput.value = parseFloat(editorSettings.lineHeight ?? '1.2').toFixed(2);

    const checkboxes: StringMap = {
      'soft-tabs-checkbox': 'useSoftTabs',
      'wrap-checkbox': 'wrap',
      'auto-close-checkbox': 'behavioursEnabled',
      'show-gutter-checkbox': 'showGutter',
      'autocomplete-checkbox': 'enableBasicAutocompletion',
      'indent-guides-checkbox': 'displayIndentGuides',
      'line-numbers-checkbox': 'showLineNumbers',
      'slim-cursor-checkbox': 'slimCursor',
      'wide-editor-checkbox': 'wideEditor',
    } as const;

    Object.entries(checkboxes).forEach(([id, key]) => {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      checkbox.checked = editorSettings[key] || false;
    });

    const updateEditorSettings = () => {
      const updatedSettings = {
        ...editorSettings,
        theme: themeSelect.value,
        tabSize: tabSizeSelect.value,
        fontSize: fontSizeInput.value,
        fontFamily: fontFamilySelect.value,
        lineHeight: lineHeightInput.value,
      };

      Object.keys(checkboxes).forEach((id) => {
        const key = checkboxes[id];
        if (key) {
          updatedSettings[key] = (document.getElementById(id) as HTMLInputElement).checked ?? false;
        }
      });

      chrome.storage.local.set({ editorSettings: updatedSettings });
    };

    themeSelect.addEventListener('change', updateEditorSettings);
    tabSizeSelect.addEventListener('change', updateEditorSettings);
    fontSizeInput.addEventListener('change', updateEditorSettings);
    fontFamilySelect.addEventListener('change', updateEditorSettings);
    lineHeightInput.addEventListener('change', updateEditorSettings);

    Object.keys(checkboxes).forEach((id) => {
      document.getElementById(id)?.addEventListener('change', updateEditorSettings);
    });

    // Handle notifications
    __global_cursor__ = prefetchCursor ?? '';
    switch (prefetchData) {
      case '$logged_out':
        notificationsContainer.innerHTML =
          '<li class="notification new"><div class="notification-header"><img class="notification-author-avatar" src="32.png"><h3 class="notification-author-nickname">KA Notifications</h3></div><div class="notification-content">You are logged out. Please <a class="hyperlink" href="https://khanacademy.org/login" target="_blank">log in to Khan Academy</a> to use this extension.</div></li>';
        loadingSpinner.classList.add('hidden');
        break;
      case undefined:
        __loading_notifications__ = true;
        loadNotifications();
        break;
      default:
        if (prefetchData.length === 0) {
          notificationsContainer.innerHTML =
            '<li class="notification new"><div class="notification-header"><img class="notification-author-avatar" src="32.png"><h3 class="notification-author-nickname">KA Notifications</h3></div><div class="notification-content">You have no notifications.</div></li>';
          loadingSpinner.classList.add('hidden');
          return;
        } else {
          notificationsContainer.innerHTML = prefetchData.map(createNotificationString).join('');
          addReplyButtonEventListeners();
          notificationsSection.onscroll = handleScroll;
        }
        break;
    }

    // Theme switching
    let theme = preferredTheme ?? 'light';
    const themeButton = document.getElementById('theme-button') as HTMLButtonElement;
    const lightIcon = document.getElementById('light-icon') as HTMLElement;
    const darkIcon = document.getElementById('dark-icon') as HTMLElement;

    if (theme === 'dark') {
      lightIcon.classList.toggle('hidden');
      darkIcon.classList.toggle('hidden');
    }

    document.body.className = theme;

    themeButton.onclick = () => {
      theme = theme === 'light' ? 'dark' : 'light';
      chrome.storage.local.set({
        preferredTheme: theme,
      });
      lightIcon.classList.toggle('hidden');
      darkIcon.classList.toggle('hidden');
      document.body.className = theme;
    };

    // Mark all read
    const markAllRead = document.getElementById('mark-all-read') as HTMLButtonElement;
    const markAllReadLoading = document.getElementById('mark-all-read-loading') as HTMLDivElement;
    let isMarkingRead = false;
    markAllRead.onclick = async () => {
      if (isMarkingRead) return;
      isMarkingRead = true;
      markAllReadLoading.classList.remove('hidden');
      try {
        const token = await getAuthToken();
        if (!token) {
          notificationsContainer.innerHTML =
            '<li class="notification new"><div class="notification-header"><img class="notification-author-avatar" src="32.png"><h3 class="notification-author-nickname">KA Notifications</h3></div><div class="notification-content">Your authentication cookie has expired. Please <a class="hyperlink" href="https://khanacademy.org/" target="_blank">navigate to Khan Academy</a> to refresh it.</div></li>';
          return;
        }

        const clearNotificationsResponse = await khanApiFetch('clearBrandNewNotifications', token);
        if (clearNotificationsResponse.ok) {
          isMarkingRead = false;
          markAllReadLoading.classList.add('hidden');
          chrome.action.setBadgeText({
            text: '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Default comment sort
    const commentSort = document.getElementById('sort-comments') as HTMLInputElement;
    commentSort.value = defaultCommentSort ?? 'Top Voted';
    commentSort.onchange = () => {
      chrome.storage.local.set({
        defaultCommentSort: commentSort.value,
      });
    };
  },
);
