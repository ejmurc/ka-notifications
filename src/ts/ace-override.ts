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
      if (!programType) return;
      const cacheName = `__khanacademy_new_${programType}_cache__`;
      const cache = localStorage.getItem(cacheName);
      if (cache) {
        try {
          const { content, cursor, scrollTop } = JSON.parse(cache);
          editor.setValue(content, -1);
          if (cursor) editor.moveCursorToPosition(cursor);
          if (typeof scrollTop === 'number') editor.session.setScrollTop(scrollTop);
          editor.clearSelection();
        } catch (error) {
          console.error(error);
        }
      }
      let saveBeforeUnload = false;
      function saveProgram() {
        if (!saveBeforeUnload) window.addEventListener('beforeunload', saveProgram);
        saveBeforeUnload = true;
        const content = editor.getValue();
        const cursor = editor.getCursorPosition();
        const scrollTop = editor.session.getScrollTop();
        if (content.length === 0) {
          localStorage.removeItem(cacheName);
        } else {
          localStorage.setItem(cacheName, JSON.stringify({ content, cursor, scrollTop }));
        }
      }
      editor.on('change', saveProgram);
      document.body.addEventListener('mouseup', (e) => {
        if (e.target instanceof HTMLElement && e.target.textContent === 'Save') {
          window.removeEventListener('beforeunload', saveProgram);
          saveBeforeUnload = false;
          localStorage.removeItem(cacheName);
        }
      });
    });
  },
});
