export function timeSince(date: Date): string {
  const seconds = ((new Date().getTime() - date.getTime()) / 1000) | 0;
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  if (seconds < 3600) {
    const minutes = (seconds / 60) | 0;
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  if (seconds < 86400) {
    const hours = (seconds / 3600) | 0;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  if (seconds < 2592000) {
    const days = (seconds / 86400) | 0;
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  if (seconds < 31536000) {
    const months = (seconds / 2592000) | 0;
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  const years = (seconds / 31536000) | 0;
  return `${years} year${years === 1 ? '' : 's'}`;
}

export function formatBadgeList(badges: string[]): string {
  const bolded = badges.map((b) => `<b>${b}</b>`);
  const count = bolded.length;
  if (count === 1) return bolded[0] as string;
  if (count === 2) return `${bolded[0]} and ${bolded[1]}`;
  return `${bolded.slice(0, -1).join(', ')}, and ${bolded[count - 1]}`;
}
