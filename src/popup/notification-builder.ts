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

function resolveIcon(...sources: (string | null | undefined)[]): string {
  for (const src of sources) {
    if (src && (src.startsWith('https://') || src.startsWith('//'))) return src;
  }
  return '48.png';
}

function baseWrapper(
  notification: BaseReadableNotification,
  header: string,
  content: string,
): string {
  const { brandNew } = notification;
  const classes = ['notification'];
  if (brandNew) classes.push('notification--new');
  return `<li class="${classes.join(' ')}">${header}<div class="notification-body">${content}</div></li>`;
}

function headerTemplate(
  iconSrc: string,
  nickname: string,
  link: string | null,
  linkText: string | null,
  date: string,
  flags?: { flagged?: boolean; brandNew?: boolean },
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
      ${flags?.flagged ? `<span class="notification-flag" title="This content was flagged">⚑ Flagged</span>` : ''}
      <span class="notification-date">${timeSince(new Date(date))} ago</span>
    </div>`;
}

function buildResponseFeedback(n: ResponseFeedbackNotification): string {
  const actionText =
    n.feedbackType === 'REPLY'
      ? 'added a comment'
      : n.feedbackType === 'ANSWER'
        ? 'answered a question'
        : n.feedbackType === 'QUESTION'
          ? 'asked a question'
          : 'left feedback';
  const header = headerTemplate(
    resolveIcon(n.authorAvatarUrl),
    n.authorNickname,
    n.url,
    n.focusTranslatedTitle ? `${actionText} on ${escapeHtml(n.focusTranslatedTitle)}` : actionText,
    n.date,
  );
  const content = `<p class="notification-content">${n.content ? parseMarkdown(n.content) : ''}</p>
  <div class="notification-actions">
      <button class="notification-btn add-listeners"
        data-url="${n.url}"
        data-typename="ResponseFeedbackNotification"
        data-feedbacktype="${n.feedbackType}">Reply</button>
    </div>`;
  return baseWrapper(n, header, content);
}

function buildProgramFeedback(n: ProgramFeedbackNotification): string {
  const actionText = n.feedbackType === 'COMMENT' ? 'commented' : 'asked a question';
  const header = headerTemplate(
    resolveIcon(n.authorAvatarSrc),
    n.authorNickname,
    n.url,
    `${actionText} on ${escapeHtml(n.translatedScratchpadTitle)}`,
    n.date,
  );
  const content = `
    <p class="notification-content">${parseMarkdown(n.content)}</p>
    <div class="notification-actions">
      <button class="notification-btn add-listeners"
        data-url="${n.url}"
        data-typename="ProgramFeedbackNotification"
        data-feedbacktype="${n.feedbackType}">Reply</button>
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
  const content = `<p class="notification-content">You unlocked <b>${escapeHtml(n.translatedDisplayName)}</b>! <i>${n.translatedRequirements.join(
    ', ',
  )}</i></p>`;
  return baseWrapper(n, header, content);
}

function buildGroupedBadge(n: GroupedBadgeNotification): string {
  const header = headerTemplate(resolveIcon(n.iconSrc), 'KA Badges', n.url, 'view badges', n.date);
  const content = `<p class="notification-content">You earned ${formatBadgeList(n.translatedDescriptions)}. Congratulations!</p>`;
  return baseWrapper(n, header, content);
}

function buildBadge(n: BadgeNotification): string {
  const header = headerTemplate(resolveIcon(n.iconSrc), 'KA Badges', n.url, 'view badge', n.date);
  const content = `<p class="notification-content">You earned <b>${n.translatedDescription}</b>! <i>${n.translatedExtendedDescription}</i></p>`;
  return baseWrapper(n, header, content);
}

function buildModeration(n: ModerationNotification): string {
  const header = headerTemplate('guardian.png', 'KA Guardian', null, null, n.date);
  const content = `<p class="notification-content">${parseMarkdown(n.text)}</p>`;
  return baseWrapper(n, header, content);
}

function buildInfo(n: InfoNotification): string {
  const header = headerTemplate(resolveIcon(), 'KA Info', null, null, n.date);
  const content = `<p class="notification-content">${parseMarkdown(n.translatedText)}</p>`;
  return baseWrapper(n, header, content);
}

function buildThreadCreated(n: ThreadCreatedNotification): string {
  const actor =
    n.relationship === 'coach'
      ? 'A student'
      : n.relationship === 'self'
        ? 'You'
        : n.nickname
          ? escapeHtml(n.nickname)
          : 'Someone';
  const header = headerTemplate(resolveIcon(n.iconSrc), n.nickname, n.url, 'view thread', n.date, {
    flagged: n.flagged,
  });
  const content = `<p class="notification-content">${actor} started a new discussion thread.</p>`;
  return baseWrapper(n, header, content);
}

function buildAssignmentCreated(n: AssignmentCreatedNotification): string {
  const header = headerTemplate(
    n.topicIconUrl || resolveIcon(),
    'Assignments',
    n.url,
    'view assignment',
    n.date,
  );
  const content = `<p class="notification-content">New assignment: <b>${escapeHtml(n.contentTitle)}</b> in <i>${escapeHtml(n.className)}</i>.</p>`;
  return baseWrapper(n, header, content);
}

function buildAssignmentDueDate(n: AssignmentDueDateNotification): string {
  const header = headerTemplate(
    n.topicIconUrl || resolveIcon(),
    'Assignments',
    n.url,
    'view details',
    n.date,
  );
  const content = `<p class="notification-content">You have ${n.numAssignments ?? 1} assignment(s) due <b>${new Date(
    n.dueDate,
  ).toLocaleDateString()}</b>: ${escapeHtml(n.contentTitle)}.</p>`;
  return baseWrapper(n, header, content);
}

function buildCourseMasteryGoalCreated(n: CourseMasteryGoalCreatedNotification): string {
  const header = headerTemplate(
    n.topicIconUrl || resolveIcon(),
    'Mastery Goals',
    n.url,
    'view goal',
    n.date,
  );
  const content = `<p class="notification-content">You set a mastery goal for <b>${escapeHtml(
    n.topicTranslatedTitle,
  )}</b> (${n.masteryPercentage}% target).</p>`;
  return baseWrapper(n, header, content);
}

function buildCoachRequest(n: CoachRequestNotification): string {
  const header = headerTemplate(
    resolveIcon(n.iconSrc),
    n.coachNickname,
    n.url,
    'view request',
    n.date,
  );
  const content = `<p class="notification-content">${n.coachIsParent ? 'A parent' : 'A coach'} requested to coach you.</p>`;
  return baseWrapper(n, header, content);
}

function buildCoachRequestAccepted(n: CoachRequestAcceptedNotification): string {
  const header = headerTemplate(
    resolveIcon(n.imageSource, n.iconSrc),
    'Coaching',
    n.url,
    'view details',
    n.date,
  );
  const content = `<p class="notification-content">Coach request accepted by <b>${escapeHtml(n.studentIdentifier ?? 'a student')}</b>.
    ${n.classInfo ? `Class: <i>${escapeHtml(n.classInfo)}</i>.` : ''}</p>
    <div class="notification-actions">
      <a class="notification-btn" href="https://www.khanacademy.org${n.url}" target="_blank">Respond</a>
    </div>`;
  return baseWrapper(n, header, content);
}

function buildUnitMasteryGoalCreated(n: UnitMasteryGoalCreatedNotification): string {
  const header = headerTemplate(
    resolveIcon(n.iconUrl, n.iconSrc),
    'Mastery Goal',
    n.url,
    'view goal',
    n.date,
  );
  const content = `<p class="notification-content">${n.coachName} created a mastery goal for ${n.numAssignments} assignment(s).</p>`;
  return baseWrapper(n, header, content);
}

function buildMasteryDueDateCreated(
  n: UnitMasteryDueDateCreatedNotification | CourseMasteryDueDateCreatedNotification,
): string {
  const label = n.curationNodeLevel === 'UNIT' ? 'Unit Mastery' : 'Course Mastery';
  const header = headerTemplate(
    resolveIcon(n.iconUrl, n.iconSrc),
    `${label} Due Date`,
    n.url,
    'view details',
    n.date,
  );
  const content = `<p class="notification-content"><b>${escapeHtml(n.topicName)}</b> ${label.toLowerCase()} goal due <b>${new Date(n.dueDate).toLocaleDateString()}</b>.</p>`;
  return baseWrapper(n, header, content);
}

function buildMasteryGoalDueDateApproaching(
  n: MasteryGoalDueDateApproachingCreatedNotification,
): string {
  const header = headerTemplate(resolveIcon(n.iconSrc), 'Mastery Goal', n.url, 'view goal', n.date);
  const content = `<p class="notification-content">Your mastery goal due date is approaching!</p>
  <div class="notification-actions">
      <a class="notification-btn" href="https://www.khanacademy.org${n.url}" target="_blank">View Goal</a>
    </div>`;
  return baseWrapper(n, header, content);
}

export function createNotificationString(n: KhanAcademyNotification): string {
  console.log(n);
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
  if (isUnitMasteryDueDateCreatedNotification(n)) return buildMasteryDueDateCreated(n);
  if (isCourseMasteryDueDateCreatedNotification(n)) return buildMasteryDueDateCreated(n);
  if (isMasteryGoalDueDateApproachingCreatedNotification(n))
    return buildMasteryGoalDueDateApproaching(n);
  const unknownNotification = n as any;
  console.warn(`Unsupported notification type: ${unknownNotification.__typename}`);
  return baseWrapper(
    unknownNotification,
    headerTemplate(resolveIcon(), 'Unknown', null, null, unknownNotification.date),
    `<pre>${JSON.stringify(unknownNotification, null, 2)}</pre>`,
  );
}

function isResponseFeedbackNotification(
  n: KhanAcademyNotification,
): n is ResponseFeedbackNotification {
  return n.__typename === 'ResponseFeedbackNotification';
}

function isProgramFeedbackNotification(
  n: KhanAcademyNotification,
): n is ProgramFeedbackNotification {
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

function isAssignmentCreatedNotification(
  n: KhanAcademyNotification,
): n is AssignmentCreatedNotification {
  return n.__typename === 'AssignmentCreatedNotification';
}

function isAssignmentDueDateNotification(
  n: KhanAcademyNotification,
): n is AssignmentDueDateNotification {
  return n.__typename === 'AssignmentDueDateNotification';
}

function isCourseMasteryGoalCreatedNotification(
  n: KhanAcademyNotification,
): n is CourseMasteryGoalCreatedNotification {
  return n.__typename === 'CourseMasteryGoalCreatedNotification';
}

function isCoachRequestNotification(n: KhanAcademyNotification): n is CoachRequestNotification {
  return n.__typename === 'CoachRequestNotification';
}

function isCoachRequestAcceptedNotification(
  n: KhanAcademyNotification,
): n is CoachRequestAcceptedNotification {
  return n.__typename === 'CoachRequestAcceptedNotification';
}

function isUnitMasteryGoalCreatedNotification(
  n: KhanAcademyNotification,
): n is UnitMasteryGoalCreatedNotification {
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
