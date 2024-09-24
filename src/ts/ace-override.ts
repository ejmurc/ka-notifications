import { requireClassName } from '../utils/dom-utils';

type Ace = typeof ace;
let _ace: Ace;
Object.defineProperty(window, 'ace', {
  get() {
    return _ace;
  },
  set(value: Ace) {
    _ace = value;
    requireClassName('ace_editor').then((elements) => {
      const editorElement = <HTMLDivElement>elements[0];
      const editor = _ace.edit(editorElement);
      const programType = window?.location?.pathname?.split('/')?.[3]?.toLowerCase();
      if (programType === null) return;
      const cacheName = `__khanacademy_new_${programType}_cache__`;
      const cache = localStorage.getItem(cacheName);
      if (cache) editor.setValue(cache);
      let saveBeforeUnload = false;
      function saveProgram() {
        if (!saveBeforeUnload) window.addEventListener('beforeunload', saveProgram);
        saveBeforeUnload = true;
        const content = editor.getValue();
        if (content.length === 0) {
          localStorage.removeItem(cacheName);
        } else {
          localStorage.setItem(cacheName, content);
        }
      }
      editor.on('change', saveProgram);
      document.body.addEventListener('mouseup', (event) => {
        if (event.target && event.target instanceof HTMLElement && event.target.textContent === 'Save') {
          window.removeEventListener('beforeunload', saveProgram);
          saveBeforeUnload = false;
          localStorage.removeItem(cacheName);
        }
      });
    });
  },
});
