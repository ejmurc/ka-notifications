const objectToString = Object.prototype.toString;

const isError = (value: unknown): value is Error => objectToString.call(value) === '[object Error]';

const errorMessages = new Set([
  'network error',
  'failed to fetch',
  'networkerror when attempting to fetch resource.',
  'the internet connection appears to be offline.',
]);

export function isNetworkError(error: unknown): boolean {
  if (!error || !isError(error)) return false;
  if (error.name !== 'TypeError' || typeof error.message !== 'string') return false;
  const message = error.message.trim().toLowerCase();
  if (message === 'load failed') {
    return error.stack === undefined || '__sentry_captured__' in error;
  }
  if (errorMessages.has(message)) return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  const cause = (error as Error & { cause?: unknown }).cause;
  return !(cause && isNetworkError(cause));
}
