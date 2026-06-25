import { getFeedback, addFeedback, getAuthToken } from '../lib/api';
import type { FeedbackQueryResponse, FeedbackType } from '../types/api';

export function addReplyButtonEventListeners(): void {
  const replyButtons = document.querySelectorAll<HTMLButtonElement>('.add-listeners');
  replyButtons.forEach(btn => {
    btn.onclick = handleReplyButtonClick;
    btn.classList.replace('add-listeners', 'notification-feedback-button');
  });
}

function handleReplyButtonClick(event: MouseEvent): void {
  const btn = event.currentTarget as HTMLButtonElement;
  const existingTextarea = document.getElementById('active-textarea') as HTMLTextAreaElement | null;

  if (existingTextarea) resetActiveReply(existingTextarea);

  const textarea = document.createElement('textarea');
  textarea.id = 'active-textarea';
  textarea.placeholder = 'Write a reply...';
  textarea.rows = 2;

  btn.textContent = 'Cancel';
  btn.onclick = sendMessage;

  textarea.oninput = () => handleTextareaInput(textarea, btn);

  btn.insertAdjacentElement('beforebegin', textarea);
  textarea.focus();
}

function handleTextareaInput(textarea: HTMLTextAreaElement, btn: HTMLButtonElement): void {
  textarea.style.height = '0';
  textarea.style.height = `${textarea.scrollHeight}px`;
  btn.textContent = textarea.value.length === 0 ? 'Cancel' : 'Send';
}

function resetActiveReply(textarea: HTMLTextAreaElement): void {
  const parent = textarea.parentElement;
  if (!parent) return;

  const button = parent.querySelector('.notification-feedback-button') as HTMLButtonElement | null;
  if (button) {
    button.textContent = 'Reply';
    button.onclick = handleReplyButtonClick;
  }

  textarea.remove();
}

async function sendMessage(event: MouseEvent): Promise<void> {
  const btn = event.currentTarget as HTMLButtonElement;
  const textarea = document.getElementById('active-textarea') as HTMLTextAreaElement | null;
  if (!textarea) return;

  const message = textarea.value.trim();
  if (message.length === 0) {
    resetActiveReply(textarea);
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;
  textarea.disabled = true;

  const { url, typename, feedbacktype } = btn.dataset;

  const handleError = (msg: string) => {
    console.error('Error sending message:', msg);
    textarea.disabled = false;
    textarea.value = message;
    btn.disabled = false;
    btn.textContent = msg;
    btn.title = msg;
  };

  try {
    const token = await getAuthToken();
    if (!token) return handleError('Missing or expired auth token');

    if (!url || !typename || !feedbacktype)
      return handleError(
        `Invalid button dataset (url=${url}, typename=${typename}, feedbacktype=${feedbacktype})`,
      );

    // narrow feedbacktype to the FeedbackType union
    if (!isFeedbackType(feedbacktype)) return handleError(`Invalid feedback type: ${feedbacktype}`);

    const params = new URL('https://www.google.com' + url).searchParams;
    const qaExpandKey = params.get('qa_expand_key');
    if (!qaExpandKey) return handleError('Missing qa_expand_key in URL params');

    const [parentFeedbackType, childFeedbackType] = getFeedbackTypes(typename, feedbacktype);
    if (!parentFeedbackType || !childFeedbackType)
      return handleError('Unrecognized notification type');

    const topicId = extractTopicId(url);
    if (!topicId) return handleError('Failed to parse topicId from URL');

    console.log(topicId, parentFeedbackType, qaExpandKey);

    const parentFeedbackJSON: FeedbackQueryResponse | undefined = await getFeedback({
      topicId,
      feedbackType: parentFeedbackType,
      currentSort: 1,
      qaExpandKey,
      focusKind: 'scratchpad',
    });

    const feedbackData = parentFeedbackJSON?.data?.feedback?.feedback?.[0];

    const parentKey =
      feedbacktype === 'QUESTION' && params.get('qa_expand_type') === 'answer'
        ? feedbackData?.__typename === 'QuestionFeedback'
          ? (feedbackData.answers?.[0]?.key ?? feedbackData.key)
          : feedbackData?.key
        : feedbackData?.key;

    if (!parentKey) return handleError('Failed to resolve parent feedback key');

    const success = await addFeedback(token, {
      parentKey,
      textContent: message,
      feedbackType: childFeedbackType,
      fromVideoAuthor: false,
      shownLowQualityNotice: false,
    });

    if (!success) return handleError('Failed to send message');

    btn.textContent = 'Success!';
    textarea.value = '';
    setTimeout(() => resetActiveReply(textarea), 2000);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    handleError(msg);
  } finally {
    btn.disabled = false;
  }
}

/** Type guard for allowed feedback types */
function isFeedbackType(type: string): type is FeedbackType {
  return ['QUESTION', 'ANSWER', 'COMMENT', 'REPLY'].includes(type);
}

/** Map typename+feedbacktype to parent/child types */
function getFeedbackTypes(
  typename: string,
  feedbacktype: FeedbackType,
): [FeedbackType | undefined, FeedbackType | undefined] {
  if (typename === 'ResponseFeedbackNotification') {
    return [feedbacktype === 'ANSWER' ? 'QUESTION' : 'COMMENT', 'REPLY'];
  }
  if (typename === 'ProgramFeedbackNotification') {
    return [feedbacktype, feedbacktype === 'QUESTION' ? 'ANSWER' : 'REPLY'];
  }
  return [undefined, undefined];
}

/** Extract topicId from notification URL */
function extractTopicId(url: string): string | undefined {
  const parts = url.split('?')?.[0]?.split('/');
  return parts?.at(-1);
}
