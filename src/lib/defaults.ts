import type { StorageData } from '../types/extension';

export const defaults: StorageData = {
  aceThemes: [],
  authenticated: false,
  notifications: [],
  notificationCursor: '',
  darkTheme: false,
  editorSettings: {
    fontFamily: 'default',
    fontKey: '',
    fontSize: '14',
    theme: 'textmate',
    wrap: true,
    showLineNumbers: true,
    showGutter: true,
    behavioursEnabled: false,
    autocompletion: false,
    slimCursor: false,
    softTabs: true,
    tabSize: '2',
    lineHeight: '1.0',
    displayIndentGuides: false,
    wideEditor: false,
  },
  commentSort: 'Top Voted',
  monospaceFonts: [],
  nickname: '',
  username: '',
  points: 0,
  avatarSrc: '',
  profileLoaded: false,
  badgeCounts: [0, 0, 0, 0, 0, 0],
  subtitle: 'points',
  streak: 0,
} as const;

export const storageKeyset = new Set(Object.keys(defaults) as (keyof StorageData)[]);
