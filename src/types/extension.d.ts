import type { KhanAcademyNotification } from './notification';

type EditorSettings = {
  fontSize?: string;
  fontFamily?: string;
  theme?: string;
  wrap?: boolean;
  showLineNumbers?: boolean;
  showGutter?: boolean;
  behavioursEnabled?: boolean;
  enableBasicAutocompletion?: boolean;
  slimCursor?: boolean;
  useSoftTabs?: boolean;
  tabSize?: string;
  lineHeight?: string;
  displayIndentGuides?: boolean;
  wideEditor?: boolean;
};

export type StorageData = {
  authenticated?: boolean;
  cursor?: string;
  notifications?: KhanAcademyNotification[];
  theme?: 'light' | 'dark';
  editorSettings?: EditorSettings;
  commentSort?: string;
};
