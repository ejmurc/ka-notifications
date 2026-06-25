export interface BaseNotification {
  __typename: string;
  brandNew: boolean;
  class_: string;
  date: string;
  kaid: string;
  read: boolean;
  url: string;
  urlsafeKey: string;
}

export interface ThreadCreatedNotification extends BaseNotification {
  __typename: 'ThreadCreatedNotification';
  coachee: {
    id: string;
    kaid: string;
    nickname: string;
  };
  threadId: string;
  flagged: boolean;
}

export interface AssignmentDueDateNotification extends BaseNotification {
  __typename: 'AssignmentDueDateNotification';
  numAssignments: number;
  dueDate: string;
  contentTitle: string;
  curationNodeIconURL: string;
}

export interface AssignmentCreatedNotification extends BaseNotification {
  __typename: 'AssignmentCreatedNotification';
  numAssignments: number;
  contentTitle: string;
  curationNodeIconURL: string;
  className: string;
}

export interface CoachRequestNotification extends BaseNotification {
  __typename: 'CoachRequestNotification';
  coachIsParent: boolean;
  coach: {
    id: string;
    kaid: string;
    nickname: string;
  };
}

export interface BadgeNotification extends BaseNotification {
  __typename: 'BadgeNotification';
  badgeName: string;
  badge: {
    description: string;
    fullDescription: string;
    name: string;
    relativeUrl: string;
    icons: {
      compactUrl: string;
    };
  };
}

export interface CourseMasteryGoalCreatedNotification extends BaseNotification {
  __typename: 'CourseMasteryGoalCreatedNotification';
  curationNodeIconURL: string;
  curationNodeTranslatedTitle: string;
  masteryPercentage: number;
}

export interface ModeratorNotification extends BaseNotification {
  __typename: 'ModeratorNotification';
  text: string;
}

export interface ProgramFeedbackNotification extends BaseNotification {
  __typename: 'ProgramFeedbackNotification';
  authorAvatarSrc: string;
  authorNickname: string;
  feedbackType: string;
  translatedScratchpadTitle: string;
  content: string;
}

export interface CoachRequestAcceptedNotification extends BaseNotification {
  __typename: 'CoachRequestAcceptedNotification';
  isMultipleClassrooms: boolean;
  student: {
    id: string;
    email: string;
    nickname: string;
  };
  classroom: {
    cacheId: string;
    id: string;
    name: string;
    topics: {
      id: string;
      slug: string;
      iconUrl: string;
      key: string;
      translatedStandaloneTitle: string;
    };
  };
}

export interface AvatarNotification extends BaseNotification {
  __typename: 'AvatarNotification';
  name: string;
  thumbnailSrc: string;
}

export interface InfoNotification extends BaseNotification {
  __typename: 'InfoNotification';
  notificationType: string;
}

export interface ResponseFeedbackNotification extends BaseNotification {
  __typename: 'ResponseFeedbackNotification';
  authorAvatarUrl: string;
  authorNickname: string;
  feedbackType: string;
  focusTranslatedTitle: string;
  content: string;
  sumVotesIncremented: number;
}

export interface GroupedBadgeNotification extends BaseNotification {
  __typename: 'GroupedBadgeNotification';
  badgeNotifications: {
    badge: {
      badgeCategory: number;
      description: string;
      fullDescription: string;
      name: string;
      icons: {
        compactUrl: string;
      };
    };
  };
}

export interface UnitMasteryGoalCreatedNotification extends BaseNotification {
  __typename: 'UnitMasteryGoalCreatedNotification';
  numAssignmentsCount: number;
  classroomInfo: {
    cacheId: string;
    id: string;
    coach: {
      id: string;
      nickname: string;
    };
  };
  unit: {
    id: string;
    iconUrl: string;
    parent: {
      id: string;
      iconUrl: string;
    };
  };
}

export interface UnitMasteryDueDateCreatedNotification extends BaseNotification {
  __typename: 'UnitMasteryDueDateCreatedNotification';
  dueDate: string;
  unit: {
    id: string;
    iconUrl: string;
    translatedStandaloneTitle: string;
  };
}

export interface CourseMasteryDueDateCreatedNotification extends BaseNotification {
  __typename: 'CourseMasteryDueDateCreatedNotification';
  dueDate: string;
  course: {
    id: string;
    iconUrl: string;
    translatedStandaloneTitle: string;
  };
}

export interface MasteryGoalDueDateApproachingCreatedNotification extends BaseNotification {
  __typename: 'MasteryGoalDueDateApproachingCreatedNotification';
  classroomInfo: {
    id: string;
    cacheId: string;
  };
}

export type KhanAcademyNotification =
  | ThreadCreatedNotification
  | AssignmentDueDateNotification
  | AssignmentCreatedNotification
  | CoachRequestNotification
  | BadgeNotification
  | CourseMasteryGoalCreatedNotification
  | ModeratorNotification
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
