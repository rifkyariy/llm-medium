export function formatRelativeTime(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return 'just now';
  }

  const diff = Date.now() - time;
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
