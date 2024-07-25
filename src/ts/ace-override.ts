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
      const programType = window.location.pathname.split('/')[3].toLowerCase();
      const cacheName = `__khanacademy_new_${programType}_cache__`;
      const cache = localStorage.getItem(cacheName);
      if (cache) editor.setValue(cache);
      function saveProgram() {
        const value = editor.getValue();
        if (value.length === 0) return localStorage.removeItem(cacheName);
        localStorage.setItem(cacheName, value);
      }
      editor.getSession().on('change', saveProgram);
      window.addEventListener('beforeunload', saveProgram);
    });
  },
});
