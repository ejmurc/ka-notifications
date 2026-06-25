import { KhanAcademyNotification } from './notification';

export type OperationName =
  | 'avatarDataForProfile'
  | 'getNotificationsForUser'
  | 'getFullUserProfile'
  | 'AddFeedbackToDiscussion'
  | 'feedbackQuery'
  | 'clearBrandNewNotifications'
  | 'StreakQuery';

export type AvatarDataForProfileVariables = {
  kaid: string;
};

export type GetNotificationsForUserVariables = {
  after: string;
};

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

export type AddFeedbackToDiscussionVariables = {
  focusKind?: string;
  focusId?: string;
  parentKey: string;
  textContent: string;
  feedbackType: FeedbackType;
  fromVideoAuthor?: boolean;
  shownLowQualityNotice?: boolean;
};

export type FeedbackAuthor = {
  __typename: 'User';
  avatar: {
    __typename: 'Avatar';
    imageSrc: string;
    name: string;
  };
  id: string;
  kaid: string;
  nickname: string;
};

export type FeedbackFocus = {
  __typename: 'FeedbackFocus';
  id: string;
  kind: string;
  relativeUrl: string;
  translatedTitle: string;
};

export type BaseFeedback = {
  appearsAsDeleted: boolean;
  author: FeedbackAuthor;
  badges: unknown[] | null;
  content: string;
  date: string;
  definitelyNotSpam: boolean;
  deleted: boolean;
  downVoted: boolean;
  expandKey: string;
  feedbackType: FeedbackType;
  flaggedBy: string[] | null;
  flaggedByUser: boolean;
  flags: string[] | null;
  focus: FeedbackFocus;
  focusUrl: string;
  fromVideoAuthor: boolean;
  isLocked: boolean;
  isPinned: boolean;
  key: string;
  lowQualityScore: number;
  notifyOnAnswer: boolean;
  permalink: string;
  qualityKind: string;
  replyCount: number;
  replyExpandKeys: string[];
  showLowQualityNotice: boolean;
  sumVotesIncremented: number;
  upVoted: boolean;
};

export type BasicFeedback = BaseFeedback & {
  __typename: 'BasicFeedback';
};

export type AnswerFeedback = BaseFeedback & {
  __typename: 'AnswerFeedback';
};

export type QuestionFeedback = BaseFeedback & {
  __typename: 'QuestionFeedback';
  answerCount: number;
  answers: AnswerFeedback[];
  hasAnswered: boolean | null;
  isOld: boolean;
};

export type Feedback = BasicFeedback | QuestionFeedback | AnswerFeedback;

export type FeedbackQueryResponse = {
  data: {
    feedback: {
      __typename: 'FeedbackForFocus';
      cursor: string | null;
      feedback: Feedback[];
      isComplete: boolean;
      sortedByDate: boolean;
    };
  };
};

export type AddFeedbackToDiscussionResponse = {
  data: {
    addFeedbackToDiscussion: {
      __typename: 'AddFeedbackToDiscussionMutation';
      error: { code: string } | null;
      feedback: BasicFeedback;
      lowQualityResponse: {
        feedbackCode: string;
        feedbackChar: string;
        feedbackType: string;
        showLowQualityNotice: boolean;
      } | null;
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
