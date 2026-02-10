import type { FeedbackQueryVariables, FeedbackQueryResponse, AddFeedbackToDiscussionVariables } from '../../types/api';
import { request } from './request';

export async function getFeedback(variables: FeedbackQueryVariables): Promise<FeedbackQueryResponse | undefined> {
  const response = await request('feedbackQuery', undefined, variables);
  if (!response.ok) {
    console.error(`feedbackQuery failed with status ${response.status}: ${await response.text()}`);
    return undefined;
  }
  return await response.json();
}

export async function addFeedback(token: string, variables: AddFeedbackToDiscussionVariables): Promise<boolean> {
  const response = await request('AddFeedbackToDiscussion', token, variables);
  if (!response.ok) {
    console.error(`feedbackQuery failed with status ${response.status}: ${await response.text()}`);
    return false;
  }
  return true;
}
