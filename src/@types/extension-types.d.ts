export type KhanAPIVariables = {
  limit?: number;
  topicId?: string;
  feedbackType?: string;
  currentSort?: number;
  qaExpandKey?: string;
  focusKind?: string;
  parentKey?: string;
  textContent?: string;
  after?: string;
  fromVideoAuthor?: boolean;
  shownLowQualityNotice?: boolean;
};

export type EditorSettings = {
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
