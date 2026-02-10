import type {
  KhanAcademyNotification,
  BaseReadableNotification,
  ResponseFeedbackNotification,
  ProgramFeedbackNotification,
  AvatarNotification,
  GroupedBadgeNotification,
  BadgeNotification,
  ModerationNotification,
  InfoNotification,
  AssignmentCreatedNotification,
  AssignmentDueDateNotification,
  CourseMasteryGoalCreatedNotification,
  ThreadCreatedNotification,
  CoachRequestNotification,
  CoachRequestAcceptedNotification,
  UnitMasteryGoalCreatedNotification,
  UnitMasteryDueDateCreatedNotification,
  CourseMasteryDueDateCreatedNotification,
  MasteryGoalDueDateApproachingCreatedNotification,
} from '../types/notification';
import { parseMarkdown, escapeHtml } from './markdown';
import { formatBadgeList, timeSince } from './formatters';

function getSafeIcon(iconSrc?: string | null): string {
  if (iconSrc && iconSrc.startsWith('https://')) return iconSrc;
  return '48.png';
}

function baseWrapper(notification: BaseReadableNotification, header: string, content: string): string {
  const { brandNew } = notification;
  const classes = ['notification'];
  if (brandNew) classes.push('notification--new');
  return `<li class="${classes.join(' ')}">${header}<div class="notification-content">${content}</div></li>`;
}

function headerTemplate(
  iconSrc: string,
  nickname: string,
  link: string | null,
  linkText: string | null,
  date: string,
): string {
  return `
    <div class="notification-header">
      <img class="notification-avatar" src="${iconSrc}">
      <h3 class="notification-nickname">${escapeHtml(nickname)}</h3>
      ${
        link
          ? `<a class="notification-link" href="https://www.khanacademy.org${link}" target="_blank">${linkText}</a>`
          : ''
      }
      <span class="notification-date">${timeSince(new Date(date))} ago</span>
    </div>`;
}

function buildResponseFeedback(n: ResponseFeedbackNotification): string {
  const header = headerTemplate(
    n.authorAvatarSrc || getSafeIcon(),
    n.authorNickname,
    n.url,
    n.feedbackIsReply
      ? 'added a comment'
      : n.feedbackIsQuestion
        ? 'asked a question'
        : n.feedbackIsProjectEvalRequest
          ? 'requested an evaluation'
          : n.feedbackIsProjectEvalAnswer
            ? 'evaluated your project'
            : 'left feedback',
    n.date,
  );
  const content = `
    ${n.content ? parseMarkdown(n.content) : ''}
    <div class="notification-actions">
      <button class="notification-btn add-listeners"
        data-url="${n.url}"
        data-typename="ResponseFeedbackNotification">Reply</button>
    </div>`;
  return baseWrapper(n, header, content);
}

function buildProgramFeedback(n: ProgramFeedbackNotification): string {
  const header = headerTemplate(
    n.authorAvatarSrc || getSafeIcon(),
    n.authorNickname,
    n.url,
    n.feedbackIsComment ? 'commented' : 'asked a question',
    n.date,
  );
  const content = `
    ${parseMarkdown(n.content)}
    <div class="notification-actions">
      <button class="notification-btn add-listeners"
        data-url="${n.url}"
        data-typename="ProgramFeedbackNotification">Reply</button>
    </div>`;
  return baseWrapper(n, header, content);
}

function buildAvatar(n: AvatarNotification): string {
  const header = headerTemplate(
    n.thumbnailSrc.startsWith('https://cdn.kastatic.org/')
      ? n.thumbnailSrc
      : 'https://cdn.kastatic.org' + n.thumbnailSrc,
    'KA Avatars',
    n.url,
    'use avatar',
    n.date,
  );
  const content = `You unlocked <b>${escapeHtml(n.translatedDisplayName)}</b>! <i>${n.translatedRequirements.join(
    ', ',
  )}</i>`;
  return baseWrapper(n, header, content);
}

function buildGroupedBadge(n: GroupedBadgeNotification): string {
  const header = headerTemplate(getSafeIcon(n.iconSrc), 'KA Badges', n.url, 'view badges', n.date);
  const content = `You earned ${formatBadgeList(n.translatedDescriptions)}. Congratulations!`;
  return baseWrapper(n, header, content);
}

function buildBadge(n: BadgeNotification): string {
  const header = headerTemplate(getSafeIcon(n.iconSrc), 'KA Badges', n.url, 'view badge', n.date);
  const content = `You earned <b>${n.translatedDescription}</b>! <i>${n.translatedExtendedDescription}</i>`;
  return baseWrapper(n, header, content);
}

function buildModeration(n: ModerationNotification): string {
  const header = headerTemplate('guardian.png', 'KA Guardian', null, null, n.date);
  return baseWrapper(n, header, parseMarkdown(n.text));
}

function buildInfo(n: InfoNotification): string {
  const header = headerTemplate(getSafeIcon(), 'KA Info', null, null, n.date);
  return baseWrapper(n, header, parseMarkdown(n.translatedText));
}

function buildThreadCreated(n: ThreadCreatedNotification): string {
  const header = headerTemplate(getSafeIcon(n.iconSrc), n.nickname, n.url, 'view thread', n.date);
  const content = `${n.relationship === 'coach' ? 'A student' : 'Someone'} started a new discussion thread.`;
  return baseWrapper(n, header, content);
}

function buildAssignmentCreated(n: AssignmentCreatedNotification): string {
  const header = headerTemplate(n.topicIconUrl || getSafeIcon(), 'Assignments', n.url, 'view assignment', n.date);
  const content = `New assignment: <b>${escapeHtml(n.contentTitle)}</b> in <i>${escapeHtml(n.className)}</i>.`;
  return baseWrapper(n, header, content);
}

function buildAssignmentDueDate(n: AssignmentDueDateNotification): string {
  const header = headerTemplate(n.topicIconUrl || getSafeIcon(), 'Assignments', n.url, 'view details', n.date);
  const content = `You have ${n.numAssignments ?? 1} assignment(s) due <b>${new Date(
    n.dueDate,
  ).toLocaleDateString()}</b>: ${escapeHtml(n.contentTitle)}.`;
  return baseWrapper(n, header, content);
}

function buildCourseMasteryGoalCreated(n: CourseMasteryGoalCreatedNotification): string {
  const header = headerTemplate(n.topicIconUrl || getSafeIcon(), 'Mastery Goals', n.url, 'view goal', n.date);
  const content = `You set a mastery goal for <b>${escapeHtml(
    n.topicTranslatedTitle,
  )}</b> (${n.masteryPercentage}% target).`;
  return baseWrapper(n, header, content);
}

function buildCoachRequest(n: CoachRequestNotification): string {
  const header = headerTemplate(getSafeIcon(n.iconSrc), n.coachNickname, n.url, 'view request', n.date);
  const content = `${n.coachIsParent ? 'A parent' : 'A coach'} requested to coach you.`;
  return baseWrapper(n, header, content);
}

function buildCoachRequestAccepted(n: CoachRequestAcceptedNotification): string {
  const header = headerTemplate(getSafeIcon(n.imageSource), 'Coaching', n.url, 'view details', n.date);
  const content = `Coach request accepted by <b>${escapeHtml(
    n.studentIdentifier ?? 'student',
  )}</b>. Class info: ${escapeHtml(n.classInfo ?? 'N/A')}.`;
  return baseWrapper(n, header, content);
}

function buildUnitMasteryGoalCreated(n: UnitMasteryGoalCreatedNotification): string {
  const header = headerTemplate(n.iconUrl || getSafeIcon(), 'Mastery Goal', n.url, 'view goal', n.date);
  const content = `${n.coachName} created a mastery goal for ${n.numAssignments} assignment(s).`;
  return baseWrapper(n, header, content);
}

function buildUnitMasteryDueDateCreated(n: UnitMasteryDueDateCreatedNotification): string {
  const header = headerTemplate(n.iconUrl || getSafeIcon(), 'Mastery Due Date', n.url, 'view details', n.date);
  const content = `${n.topicName} (${n.curationNodeLevel}) due <b>${new Date(n.dueDate).toLocaleDateString()}</b>.`;
  return baseWrapper(n, header, content);
}

function buildCourseMasteryDueDateCreated(n: CourseMasteryDueDateCreatedNotification): string {
  const header = headerTemplate(n.iconUrl || getSafeIcon(), 'Mastery Due Date', n.url, 'view details', n.date);
  const content = `${n.topicName} (${n.curationNodeLevel}) due <b>${new Date(n.dueDate).toLocaleDateString()}</b>.`;
  return baseWrapper(n, header, content);
}

function buildMasteryGoalDueDateApproaching(n: MasteryGoalDueDateApproachingCreatedNotification): string {
  const header = headerTemplate(getSafeIcon(n.iconSrc), 'Mastery Goal', n.url, 'view goal', n.date);
  const content = `Your mastery goal due date is approaching!`;
  return baseWrapper(n, header, content);
}

export function createNotificationString(n: KhanAcademyNotification): string {
  if (isResponseFeedbackNotification(n)) return buildResponseFeedback(n);
  if (isProgramFeedbackNotification(n)) return buildProgramFeedback(n);
  if (isAvatarNotification(n)) return buildAvatar(n);
  if (isGroupedBadgeNotification(n)) return buildGroupedBadge(n);
  if (isBadgeNotification(n)) return buildBadge(n);
  if (isModerationNotification(n)) return buildModeration(n);
  if (isInfoNotification(n)) return buildInfo(n);
  if (isThreadCreatedNotification(n)) return buildThreadCreated(n);
  if (isAssignmentCreatedNotification(n)) return buildAssignmentCreated(n);
  if (isAssignmentDueDateNotification(n)) return buildAssignmentDueDate(n);
  if (isCourseMasteryGoalCreatedNotification(n)) return buildCourseMasteryGoalCreated(n);
  if (isCoachRequestNotification(n)) return buildCoachRequest(n);
  if (isCoachRequestAcceptedNotification(n)) return buildCoachRequestAccepted(n);
  if (isUnitMasteryGoalCreatedNotification(n)) return buildUnitMasteryGoalCreated(n);
  if (isUnitMasteryDueDateCreatedNotification(n)) return buildUnitMasteryDueDateCreated(n);
  if (isCourseMasteryDueDateCreatedNotification(n)) return buildCourseMasteryDueDateCreated(n);
  if (isMasteryGoalDueDateApproachingCreatedNotification(n)) return buildMasteryGoalDueDateApproaching(n);
  const unknownNotification = n as any;
  console.warn(`Unsupported notification type: ${unknownNotification.__typename}`);
  return baseWrapper(
    unknownNotification,
    headerTemplate(getSafeIcon(), 'Unknown', null, null, unknownNotification.date),
    `<pre>${JSON.stringify(unknownNotification, null, 2)}</pre>`,
  );
}

function isResponseFeedbackNotification(n: KhanAcademyNotification): n is ResponseFeedbackNotification {
  return n.__typename === 'ResponseFeedbackNotification';
}

function isProgramFeedbackNotification(n: KhanAcademyNotification): n is ProgramFeedbackNotification {
  return n.__typename === 'ProgramFeedbackNotification';
}

function isAvatarNotification(n: KhanAcademyNotification): n is AvatarNotification {
  return n.__typename === 'AvatarNotification';
}

function isGroupedBadgeNotification(n: KhanAcademyNotification): n is GroupedBadgeNotification {
  return n.__typename === 'GroupedBadgeNotification';
}

function isBadgeNotification(n: KhanAcademyNotification): n is BadgeNotification {
  return n.__typename === 'BadgeNotification';
}

function isModerationNotification(n: KhanAcademyNotification): n is ModerationNotification {
  return n.__typename === 'ModerationNotification';
}

function isInfoNotification(n: KhanAcademyNotification): n is InfoNotification {
  return n.__typename === 'InfoNotification';
}

function isThreadCreatedNotification(n: KhanAcademyNotification): n is ThreadCreatedNotification {
  return n.__typename === 'ThreadCreatedNotification';
}

function isAssignmentCreatedNotification(n: KhanAcademyNotification): n is AssignmentCreatedNotification {
  return n.__typename === 'AssignmentCreatedNotification';
}

function isAssignmentDueDateNotification(n: KhanAcademyNotification): n is AssignmentDueDateNotification {
  return n.__typename === 'AssignmentDueDateNotification';
}

function isCourseMasteryGoalCreatedNotification(n: KhanAcademyNotification): n is CourseMasteryGoalCreatedNotification {
  return n.__typename === 'CourseMasteryGoalCreatedNotification';
}

function isCoachRequestNotification(n: KhanAcademyNotification): n is CoachRequestNotification {
  return n.__typename === 'CoachRequestNotification';
}

function isCoachRequestAcceptedNotification(n: KhanAcademyNotification): n is CoachRequestAcceptedNotification {
  return n.__typename === 'CoachRequestAcceptedNotification';
}

function isUnitMasteryGoalCreatedNotification(n: KhanAcademyNotification): n is UnitMasteryGoalCreatedNotification {
  return n.__typename === 'UnitMasteryGoalCreatedNotification';
}

function isUnitMasteryDueDateCreatedNotification(
  n: KhanAcademyNotification,
): n is UnitMasteryDueDateCreatedNotification {
  return n.__typename === 'UnitMasteryDueDateCreatedNotification';
}

function isCourseMasteryDueDateCreatedNotification(
  n: KhanAcademyNotification,
): n is CourseMasteryDueDateCreatedNotification {
  return n.__typename === 'CourseMasteryDueDateCreatedNotification';
}

function isMasteryGoalDueDateApproachingCreatedNotification(
  n: KhanAcademyNotification,
): n is MasteryGoalDueDateApproachingCreatedNotification {
  return n.__typename === 'MasteryGoalDueDateApproachingCreatedNotification';
}
