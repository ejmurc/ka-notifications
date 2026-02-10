import { KhanAcademyNotification } from './notification';

const OPERATION_NAMES = [
  'getNotificationsForUser',
  'AddFeedbackToDiscussion',
  'feedbackQuery',
  'clearBrandNewNotifications',
] as const;

type GetNotificationsForUserVariables = {
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

type FeedbackQueryVariables = {
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

type AddFeedbackToDiscussionVariables = {
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

export type GraphQLVariables =
  | GetNotificationsForUserVariables
  | AddFeedbackToDiscussionVariables
  | FeedbackQueryVariables;
