export function requireId(id: string): Promise<Element> {
  return new Promise((resolve) => {
    const element = document.getElementById(id);
    if (element) return resolve(element);
    const observer = new MutationObserver(() => {
      const element = document.getElementById(id);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function requireClassName(className: string): Promise<Element[]> {
  return new Promise((resolve) => {
    const elements = document.getElementsByClassName(className);
    if (elements && elements.length) return resolve(Array.from(elements));
    const observer = new MutationObserver(() => {
      const elements = document.getElementsByClassName(className);
      if (elements && elements.length) {
        observer.disconnect();
        resolve(Array.from(elements));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
