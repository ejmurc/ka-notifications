import type { KhanAcademyNotification } from './notification';

export type Font = {
  key: string;
  family: string;
};

export type EditorSettings = {
  fontFamily: string;
  fontKey: string;
  fontSize: string;
  theme: string;
  wrap: boolean;
  showLineNumbers: boolean;
  showGutter: boolean;
  behavioursEnabled: boolean;
  autocompletion: boolean;
  slimCursor: boolean;
  softTabs: boolean;
  tabSize: string;
  lineHeight: string;
  displayIndentGuides: boolean;
  wideEditor: boolean;
};

export type StorageData = {
  aceThemes: string[];
  authenticated: boolean;
  avatarSrc: string;
  notifications: KhanAcademyNotification[];
  notificationCursor: string;
  darkTheme: boolean;
  editorSettings: EditorSettings;
  commentSort: string;
  monospaceFonts: Font[];
  nickname: string;
  username: string;
  points: number;
  profileLoaded: boolean;
  badgeCounts: number[];
  subtitle: 'points' | 'badges' | 'streak' | 'none';
  streak: number;
};
