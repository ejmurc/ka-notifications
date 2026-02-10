type BaseReadableNotification = {
  __typename: string;
  brandNew: boolean;
  date: string;
  kaid: string;
  read: boolean;
  url: string;
  urlsafeKey: string;
  iconSrc: string;
  class_: Array<string>;
};

type ThreadCreatedNotification = BaseReadableNotification & {
  nickname: string;
  flagged: boolean;
  threadId: string;
  relationship: string;
};

type AssignmentDueDateNotification = BaseReadableNotification & {
  numAssignments: number | null | undefined;
  dueDate: string;
  contentTitle: string;
  topicIconUrl: string;
};

type AssignmentCreatedNotification = BaseReadableNotification & {
  numAssignments: number | null | undefined;
  contentTitle: string;
  topicIconUrl: string;
  className: string;
};

type CourseMasteryGoalCreatedNotification = BaseReadableNotification & {
  masteryPercentage: number;
  topicTranslatedTitle: string;
  topicIconUrl: string;
};

type BadgeNotification = BaseReadableNotification & {
  translatedDescription: string;
  translatedExtendedDescription: string;
};

type CoachRequestNotification = BaseReadableNotification & {
  coachNickname: string;
  coachIsParent: boolean;
  coachKaid: string;
};

type ModerationNotification = BaseReadableNotification & {
  text: string;
};

type ProgramFeedbackNotification = BaseReadableNotification & {
  authorAvatarSrc: string;
  feedbackIsComment: boolean;
  authorNickname: string;
  translatedScratchpadTitle: string;
  content: string;
};

type CoachRequestAcceptedNotification = BaseReadableNotification & {
  imageSource: string | null | undefined;
  studentIdentifier: string | null | undefined;
  classInfo: string | null | undefined;
};

type AvatarNotification = BaseReadableNotification & {
  thumbnailSrc: string;
  translatedDisplayName: string;
  translatedRequirements: Array<string>;
};

type InfoNotification = BaseReadableNotification & {
  translatedText: string;
};

type ResponseFeedbackNotification = BaseReadableNotification & {
  authorAvatarSrc: string;
  feedbackIsProjectEvalRequest?: boolean;
  feedbackIsProjectEvalAnswer?: boolean;
  feedbackIsPassingEvalAnswer?: boolean;
  feedbackIsQuestion?: boolean;
  feedbackIsReply?: boolean;
  authorNickname: string;
  translatedFocusTitle: string;
  content: string | null | undefined;
};

type GroupedBadgeNotification = BaseReadableNotification & {
  translatedDescriptions: Array<string>;
};

type UnitMasteryGoalCreatedNotification = BaseReadableNotification & {
  coachName: string;
  numAssignments: number;
  iconUrl: string | null | undefined;
};

type UnitMasteryDueDateCreatedNotification = BaseReadableNotification & {
  dueDate: string;
  iconUrl: string | null | undefined;
  topicName: string;
  curationNodeLevel: 'UNIT';
};

type CourseMasteryDueDateCreatedNotification = BaseReadableNotification & {
  dueDate: string;
  iconUrl: string | null | undefined;
  topicName: string;
  curationNodeLevel: 'COURSE';
};

type MasteryGoalDueDateApproachingCreatedNotification = BaseReadableNotification;

export type KhanAcademyNotification =
  | ThreadCreatedNotification
  | AssignmentDueDateNotification
  | AssignmentCreatedNotification
  | BadgeNotification
  | CoachRequestNotification
  | CourseMasteryGoalCreatedNotification
  | ModerationNotification
  | ProgramFeedbackNotification
  | CoachRequestAcceptedNotification
  | AvatarNotification
  | InfoNotification
  | ResponseFeedbackNotification
  | GroupedBadgeNotification
  | UnitMasteryGoalCreatedNotification
  | UnitMasteryDueDateCreatedNotification
  | CourseMasteryDueDateCreatedNotification
  | MasteryGoalDueDateApproachingCreatedNotification;
