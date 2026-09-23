import type {
  KhanAcademyNotification,
  BaseNotification,
  ResponseFeedbackNotification,
  ProgramFeedbackNotification,
  AvatarNotification,
  GroupedBadgeNotification,
  BadgeNotification,
  ModeratorNotification,
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

function baseWrapper(notification: BaseNotification, header: string, content: string): string {
  const { brandNew } = notification;
  const classes = ['notification'];
  if (brandNew) classes.push('notification--new');
  return `<li class="${classes.join(' ')}">${header}<div class="notification-body">${content}</div></li>`;
}

function headerTemplate(
  iconSrc: string,
  nickname: string,
  nicknameUrl: string | null,
  link: string | null,
  linkText: string | null,
  date: string,
  flags?: { flagged?: boolean; brandNew?: boolean },
): string {
  return `
    <div class="notification-header">
      <img class="notification-avatar" src="${iconSrc}">
      ${nicknameUrl ? `<a class="notification-nickname" href=${nicknameUrl} target="_blank">${escapeHtml(nickname)}</a>` : `<h3 class="notification-nickname">${escapeHtml(nickname)}</h3>`}
      ${link ? `<a class="notification-link" href="https://www.khanacademy.org${link}" target="_blank">${linkText}</a>` : ''}
      ${flags?.flagged ? `<span class="notification-flag" title="This content was flagged">⚑ Flagged</span>` : ''}
      <span class="notification-date">${timeSince(new Date(date))} ago</span>
    </div>`;
}

function extractKaid(url?: string) {
  if (!url) return null;
  try {
    const matchKey = url.match(/[?&]qa_expand_key=([^&]+)/);
    if (!matchKey) return null;
    const encodedKey = matchKey[1];
    if (!encodedKey) return null;
    const key = decodeURIComponent(encodedKey);
    let base64 = key.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const decoded = atob(base64);
    const kaidMatch = decoded.match(/kaid_\d+/);
    return kaidMatch ? kaidMatch[0] : null;
  } catch {
    return null;
  }
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
  const kaid = extractKaid(n.url);
  const header = headerTemplate(
    resolveIcon(n.authorAvatarUrl),
    n.authorNickname,
    kaid ? `https://www.khanacademy.org/profile/${kaid}` : null,
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
  const kaid = extractKaid(n.url);
  const header = headerTemplate(
    resolveIcon(n.authorAvatarSrc),
    n.authorNickname,
    kaid ? `https://www.khanacademy.org/profile/${kaid}` : null,
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
    null,
    n.url,
    'use avatar',
    n.date,
  );
  const content = `<p class="notification-content">You unlocked <b>${escapeHtml(n.name)}</b>!</p>`;
  return baseWrapper(n, header, content);
}

function buildGroupedBadge(n: GroupedBadgeNotification): string {
  const icon = resolveIcon(n.badgeNotifications?.badge?.icons?.compactUrl);
  const header = headerTemplate(icon, 'KA Badges', null, n.url, 'view badges', n.date);
  const descriptions = [n.badgeNotifications?.badge?.description].filter(Boolean) as string[];
  const content = `<p class="notification-content">You earned ${formatBadgeList(descriptions)}. Congratulations!</p>`;
  return baseWrapper(n, header, content);
}

function buildBadge(n: BadgeNotification): string {
  const icon = resolveIcon(n.badge?.icons?.compactUrl);
  const header = headerTemplate(icon, 'KA Badges', null, n.url, 'view badge', n.date);
  const content = `<p class="notification-content">You earned <b>${n.badge.description}</b>! <i>${n.badge.fullDescription}</i></p>`;
  return baseWrapper(n, header, content);
}

function buildModeration(n: ModeratorNotification): string {
  const header = headerTemplate('guardian.png', 'KA Guardian', null, null, null, n.date);
  const content = `<p class="notification-content">${parseMarkdown(n.text)}</p>`;
  return baseWrapper(n, header, content);
}

function buildInfo(n: InfoNotification): string {
  const header = headerTemplate(resolveIcon(), 'KA Info', null, null, null, n.date);
  const content = `<p class="notification-content">${n.notificationType}</p>`;
  return baseWrapper(n, header, content);
}

function buildThreadCreated(n: ThreadCreatedNotification): string {
  const nickname = n.coachee?.nickname ?? '';
  const actor = n.coachee ? escapeHtml(nickname) : 'Someone';
  const header = headerTemplate(resolveIcon(), nickname, null, n.url, 'view thread', n.date, {
    flagged: n.flagged,
  });
  const content = `<p class="notification-content">${actor} started a new discussion thread.</p>`;
  return baseWrapper(n, header, content);
}

function buildAssignmentCreated(n: AssignmentCreatedNotification): string {
  const header = headerTemplate(
    resolveIcon(n.curationNodeIconURL) || resolveIcon(),
    'Assignments',
    null,
    n.url,
    'view assignment',
    n.date,
  );
  const content = `<p class="notification-content">New assignment: <b>${escapeHtml(n.contentTitle)}</b> in <i>${escapeHtml(n.className)}</i>.</p>`;
  return baseWrapper(n, header, content);
}

function buildAssignmentDueDate(n: AssignmentDueDateNotification): string {
  const header = headerTemplate(
    resolveIcon(n.curationNodeIconURL) || resolveIcon(),
    'Assignments',
    null,
    n.url,
    'view details',
    n.date,
  );
  const content = `<p class="notification-content">You have ${n.numAssignments ?? 1} assignment(s) due <b>${new Date(n.dueDate).toLocaleDateString()}</b>: ${escapeHtml(n.contentTitle)}.</p>`;
  return baseWrapper(n, header, content);
}

function buildCourseMasteryGoalCreated(n: CourseMasteryGoalCreatedNotification): string {
  const header = headerTemplate(
    resolveIcon(n.curationNodeIconURL) || resolveIcon(),
    'Mastery Goals',
    null,
    n.url,
    'view goal',
    n.date,
  );
  const content = `<p class="notification-content">You set a mastery goal for <b>${escapeHtml(n.curationNodeTranslatedTitle)}</b> (${n.masteryPercentage}% target).</p>`;
  return baseWrapper(n, header, content);
}

function buildCoachRequest(n: CoachRequestNotification): string {
  const header = headerTemplate(
    resolveIcon(),
    n.coach.nickname,
    null,
    n.url,
    'view request',
    n.date,
  );
  const content = `<p class="notification-content">${n.coachIsParent ? 'A parent' : 'A coach'} requested to coach you.</p>`;
  return baseWrapper(n, header, content);
}

function buildCoachRequestAccepted(n: CoachRequestAcceptedNotification): string {
  const icon = resolveIcon(n.classroom?.topics?.iconUrl);
  const header = headerTemplate(icon, 'Coaching', null, n.url, 'view details', n.date);
  const studentName = n.student?.nickname ?? n.student?.email ?? 'a student';
  const className = n.classroom?.name;
  const content = `<p class="notification-content">Coach request accepted by <b>${escapeHtml(studentName)}</b>.
    ${className ? `Class: <i>${escapeHtml(className)}</i>.` : ''}</p>
    <div class="notification-actions">
      <a class="notification-btn" href="https://www.khanacademy.org${n.url}" target="_blank">Respond</a>
    </div>`;
  return baseWrapper(n, header, content);
}

function buildUnitMasteryGoalCreated(n: UnitMasteryGoalCreatedNotification): string {
  const icon = resolveIcon(n.unit?.iconUrl ?? n.unit?.parent?.iconUrl);
  const coachName = n.classroomInfo?.coach?.nickname ?? 'Your coach';
  const header = headerTemplate(icon, 'Mastery Goal', null, n.url, 'view goal', n.date);
  const content = `<p class="notification-content">${coachName} created a mastery goal for ${n.numAssignmentsCount} assignment(s).</p>`;
  return baseWrapper(n, header, content);
}

function buildMasteryDueDateCreated(
  n: UnitMasteryDueDateCreatedNotification | CourseMasteryDueDateCreatedNotification,
): string {
  const isUnit = n.__typename === 'UnitMasteryDueDateCreatedNotification';
  const label = isUnit ? 'Unit Mastery' : 'Course Mastery';
  const icon = isUnit
    ? resolveIcon((n as UnitMasteryDueDateCreatedNotification).unit?.iconUrl)
    : resolveIcon((n as CourseMasteryDueDateCreatedNotification).course?.iconUrl);
  const topicName = isUnit
    ? (n as UnitMasteryDueDateCreatedNotification).unit?.translatedStandaloneTitle
    : (n as CourseMasteryDueDateCreatedNotification).course?.translatedStandaloneTitle;
  const header = headerTemplate(icon, `${label} Due Date`, null, n.url, 'view details', n.date);
  const content = `<p class="notification-content"><b>${escapeHtml(topicName ?? '')}</b> ${label.toLowerCase()} goal due <b>${new Date(n.dueDate).toLocaleDateString()}</b>.</p>`;
  return baseWrapper(n, header, content);
}

function buildMasteryGoalDueDateApproaching(
  n: MasteryGoalDueDateApproachingCreatedNotification,
): string {
  const header = headerTemplate(resolveIcon(), 'Mastery Goal', null, n.url, 'view goal', n.date);
  const content = `<p class="notification-content">Your mastery goal due date is approaching!</p>
  <div class="notification-actions">
      <a class="notification-btn" href="https://www.khanacademy.org${n.url}" target="_blank">View Goal</a>
    </div>`;
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
  if (isUnitMasteryDueDateCreatedNotification(n)) return buildMasteryDueDateCreated(n);
  if (isCourseMasteryDueDateCreatedNotification(n)) return buildMasteryDueDateCreated(n);
  if (isMasteryGoalDueDateApproachingCreatedNotification(n))
    return buildMasteryGoalDueDateApproaching(n);
  const unknownNotification = n as KhanAcademyNotification & Record<string, unknown>;
  console.warn(`Unsupported notification type: ${unknownNotification.__typename}`);
  return baseWrapper(
    unknownNotification,
    headerTemplate(resolveIcon(), 'Unknown', null, null, null, unknownNotification.date),
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
function isModerationNotification(n: KhanAcademyNotification): n is ModeratorNotification {
  return n.__typename === 'ModeratorNotification';
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
