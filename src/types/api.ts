import { KhanAcademyNotification } from './notification';

const OPERATION_NAMES = [
  'avatarDataForProfile',
  'getNotificationsForUser',
  'getFullUserProfile',
  'AddFeedbackToDiscussion',
  'feedbackQuery',
  'clearBrandNewNotifications',
  'StreakQuery',
] as const;

export type AvatarDataForProfileVariables = {
  kaid: string;
};

export type GetNotificationsForUserVariables = {
  after: string;
};

export type OperationName = (typeof OPERATION_NAMES)[number];

export type QueryCache = Partial<Record<OperationName, string>>;

export type NotificationsResponse = {
  after: string | null;
  notifications: KhanAcademyNotification[];
};

export type GetNotificationsForUserResponse = {
  data: {
    user: {
      id: string;
      notifications: {
        notifications: KhanAcademyNotification[];
        pageInfo: {
          nextCursor: string | null;
        };
      } | null;
    } | null;
  };
};

export type ClearBrandNewNotificationsResponse = {
  clearBrandNewNotifications: {
    error: {
      code: string;
    } | null;
  } | null;
};

export type FeedbackType = 'QUESTION' | 'ANSWER' | 'COMMENT' | 'REPLY';

export type FeedbackQueryVariables = {
  topicId: string;
  focusKind: string;
  cursor?: string;
  limit?: number;
  feedbackType: FeedbackType;
  currentSort: number;
  qaExpandKey?: string;
};

export type FeedbackQueryResponse = {
  feedback: {
    feedback: any[];
    cursor?: string;
    isComplete: boolean;
    sortedByDate: boolean;
  };
};

export type AddFeedbackToDiscussionVariables = {
  focusKind?: string;
  focusId?: string;
  parentKey: string;
  textContent: string;
  feedbackType: FeedbackType;
  fromVideoAuthor?: boolean;
  shownLowQualityNotice?: boolean;
};

export type AddFeedbackToDiscussionResponse = {
  addFeedbackToDiscussion: {
    feedback: any;
    lowQualityResponse?: {
      feedbackCode: string;
      feedbackChar: string;
      feedbackType: string;
      showLowQualityNotice: boolean;
    };
    error?: {
      code: string;
    };
  };
};

export type GetFullUserProfileResponse = {
  data: {
    user: {
      id: string;
      kaid: string;
      nickname: string;
      username: string;
      profileRoot: string;
      points: number;
      bio: string;
      joined: string;
      isPhantom: boolean;
      isDeveloper: boolean;
      isPublisher: boolean;
      isModerator: boolean;
      isParent: boolean;
      isTeacher: boolean;
      isFormalTeacher: boolean;
      isChild: boolean;
      isOrphan: boolean;
      isSelf: boolean;
      isDataCollectible: boolean;
      isK4dStudent: boolean;
      isKmapStudent: boolean;
      isMidsignupPhantom: boolean;
      isCoachingLoggedInUser: boolean;
      canModifyCoaches: boolean;
      canHellban: boolean;
      canMessageUsers: boolean;
      hideVisual: boolean;
      soundOn: boolean;
      muteVideos: boolean;
      showCaptions: boolean;
      prefersReducedMotion: boolean;
      noColorInVideos: boolean;
      newNotificationCount: number;
      countVideosCompleted: number;
      badgeCounts: string;
      homepageUrl: string;
      hasStudents: boolean;
      hasClasses: boolean;
      hasChildren: boolean;
      hasCoach: boolean;
      hasUnifiedTeacherRole: boolean;
      hasUnifiedCoachRole: boolean;
      canAccessDistrictsHomepage: boolean;
      isInKacPilotDistrict: boolean;
      includesDistrictOwnedData: boolean;
      includesKmapDistrictOwnedData: boolean;
      includesK4dDistrictOwnedData: boolean;
      tosAccepted: boolean;
      shouldShowAgeCheck: boolean;
      lastLoginCountry: string;
      region: string | null;
      authEmails: string[];
      pendingEmailVerifications: { email: string }[];
      birthMonthYear: string;
      gaUserId: string;
      email: string;
      key: string;
      userId: string;
      profile: {
        accessLevel: string;
      };
      underAgeGate: {
        parentEmail: string;
        daysUntilCutoff: number;
        approvalGivenAt: string;
      } | null;
      signupDataIfUnverified: {
        email: string;
        emailBounced: boolean;
      } | null;
      schoolAffiliation: {
        id: string;
        location: string;
      } | null;
      userDistrictInfos: {
        id: string;
        isKAD: boolean;
        primaryRole: string;
        district: {
          id: string;
          region: string;
        };
      }[];
      hasAccessToAIGuideCompanionMode: boolean;
      hasAccessToAIGuideLearner: boolean;
      hasAccessToAIGuideDistrictAdmin: boolean;
      hasAccessToAIGuideParent: boolean;
      hasAccessToAIGuideTeacher: boolean;
    } | null;
  };
};

export type AvatarDataForProfileResponse = {
  data: {
    user: {
      id: string;
      kaid: string;
      avatar: {
        name: string;
        imageSrc: string;
      };
    } | null;
  };
};

export type StreakQueryResponse = {
  data: {
    user: {
      id: string;
      stpStreak: {
        length: number;
        isExpiring: boolean;
        longestLength: number;
      } | null;
    } | null;
  };
};

export type GraphQLVariables =
  | GetNotificationsForUserVariables
  | AddFeedbackToDiscussionVariables
  | FeedbackQueryVariables
  | AvatarDataForProfileVariables;
