const objectToString = Object.prototype.toString;

const isError = value => objectToString.call(value) === '[object Error]';

const errorMessages = new Set([
  'network error', // Chrome
  'failed to fetch', // Chrome
  'networkerror when attempting to fetch resource.', // Firefox
  'the internet connection appears to be offline.', // Safari 16
]);

export function isNetworkError(error) {
  if (!error || !isError(error)) return false;
  if (error.name !== 'TypeError' || typeof error.message !== 'string') return false;

  const message = error.message.trim().toLowerCase();

  // Safari 17+: generic "Load failed" message, no stack
  if (message === 'load failed') {
    return (
      error.stack === undefined ||
      '__sentry_captured__' in error
    );
  }

  // Standardized network errors
  if (errorMessages.has(message)) return true;

  // Browser hint (not definitive)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }

  // Handle wrapped errors (e.g. `new Error("foo", { cause })`)
  return !(error.cause && isNetworkError(error.cause));
}
