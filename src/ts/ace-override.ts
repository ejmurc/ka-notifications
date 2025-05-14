import { requireClassName } from '../utils/dom-utils';
import { EditorSettings } from '../@types/extension-types';

type Ace = typeof ace;
let _ace: Ace;
let editor: AceAjax.Editor;
let settings: EditorSettings = {};

function isNewProgramURL(url: string) {
  return /^https:\/\/www\.khanacademy\.org\/(computer-programming|cs)\/new\/[^/]+$/.test(url);
}

async function fetchExtensionSettings() {
  return new Promise((resolve) => {
    const listener = (event: MessageEvent) => {
      if (event.data.type === 'EDITOR_SETTINGS') {
        window.removeEventListener('message', listener);
        resolve(true);
      }
    };
    window.addEventListener('message', listener);
    window.postMessage({ type: 'EDITOR_SETTINGS_REQUEST' }, '*');
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  switch (event.data.type) {
    case 'EDITOR_SETTINGS':
      settings = event.data.settings;
      updateEditorSettings();
      break;
  }
});

let allowEditorSettingsOverride = false;
async function updateEditorSettings() {
  if (!editor || !settings) return;
  allowEditorSettingsOverride = true;
  editor.setOptions({
    fontSize: `${parseInt(settings.fontSize ?? '14')}px`,
    fontFamily: `${settings.fontFamily || 'Monaco'}`,
    theme: `ace/theme/${settings.theme || 'textmate'}`,
    wrap: settings.wrap !== false,
    showLineNumbers: settings.showLineNumbers !== false,
    showGutter: settings.showGutter !== false,
    behavioursEnabled: settings.behavioursEnabled !== false,
    enableLiveAutocompletion: settings.enableBasicAutocompletion !== false,
    enableBasicAutocompletion: settings.enableBasicAutocompletion !== false,
  });
  allowEditorSettingsOverride = false;

  document.querySelectorAll('style[data-slim-cursor]').forEach((el) => el.remove());
  if (settings.slimCursor) {
    const style = document.createElement('style');
    style.textContent = `
      .ace_cursor {
        border-left-width: 1px !important;
        margin-left: -0.5px !important;
      }
    `;
    style.setAttribute('data-slim-cursor', 'true');
    document.head.appendChild(style);
  }

  const session = editor.getSession();
  session.setOptions({
    useSoftTabs: !!settings.useSoftTabs,
    tabSize: parseInt(settings.tabSize ?? '2'),
  });

  editor.container.style.lineHeight = settings.lineHeight || 'normal';

  editor.renderer.updateFontSize();
  editor.renderer.updateCursor();
}

Object.defineProperty(window, 'ace', {
  get() {
    return _ace;
  },
  set(value: Ace) {
    _ace = value;
    requireClassName('ace_editor').then((elements) => {
      const editorElement = <HTMLDivElement>elements[0];
      editor = _ace.edit(editorElement);
      const originalSetFontSize = editor.setFontSize.bind(editor);
      editor.setFontSize = function (size) {
        if (!allowEditorSettingsOverride) {
          return;
        }
        return originalSetFontSize(size);
      };
      fetchExtensionSettings();
      if (isNewProgramURL(window.location.href)) {
        const programType = window?.location?.pathname?.split('/')?.[3]?.toLowerCase();
        if (!programType) return;
        const cacheName = `__khanacademy_new_${programType}_cache__`;
        const cache = localStorage.getItem(cacheName);
        if (cache) {
          try {
            const { content, cursor } = JSON.parse(cache);
            editor.session.setValue(content);
            editor.moveCursorToPosition(cursor);
            editor.renderer.scrollCursorIntoView();
          } catch (error) {
            console.error(error);
          }
        }
        editor.focus();
        let saveBeforeUnload = false;
        function saveProgram() {
          if (!saveBeforeUnload) window.addEventListener('beforeunload', saveProgram);
          const content = editor.getValue();
          const cursor = editor.getCursorPosition();
          if (content.length === 0) {
            localStorage.removeItem(cacheName);
          } else {
            localStorage.setItem(cacheName, JSON.stringify({ content, cursor }));
          }
        }
        editor.selection.on('changeCursor', saveProgram);
        editor.on('change', saveProgram);
        document.body.addEventListener('mouseup', (e) => {
          const target = e.target as HTMLElement;
          if (target.textContent?.trim() === 'Save' && !!target.closest('.modal, .dialog, .popup, [role="dialog"]')) {
            window.removeEventListener('beforeunload', saveProgram);
            saveBeforeUnload = false;
            localStorage.removeItem(cacheName);
          }
        });
      }
    });
  },
});
