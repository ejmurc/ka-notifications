function observeUntil<T>(check: () => T | null | undefined): Promise<T> {
  return new Promise(resolve => {
    const result = check();
    if (result) return resolve(result);
    const observer = new MutationObserver(() => {
      const result = check();
      if (result) {
        observer.disconnect();
        resolve(result);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export const waitForId = (id: string) => observeUntil(() => document.getElementById(id));

export const waitForClass = (className: string) =>
  observeUntil(() => {
    const els = document.getElementsByClassName(className);
    return els.length ? Array.from(els) : null;
  });

export const waitForSelector = (selector: string) =>
  observeUntil(() => document.querySelector(selector));
