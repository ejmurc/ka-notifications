import { requireClassName } from '../utils/dom-utils';
import { EditorSettings } from '../@types/extension-types';

const link = document.createElement('link');
link.rel = 'preconnect';
link.href = 'https://cdn.jsdelivr.net';
link.crossOrigin = 'anonymous';
document.head.appendChild(link);

(async () => {
  const manifestUrl = 'https://cdn.jsdelivr.net/gh/eliasmurcray/cdn@mainline/fonts.json?update=' + Date.now();
  try {
    const response = await fetch(manifestUrl);
    const fontNames: string[] = await response.json();
    const style = document.createElement('style');
    style.textContent = fontNames
      .map(
        (name) => `
        @font-face {
          font-family: '${name}';
          src: url('https://cdn.jsdelivr.net/gh/eliasmurcray/cdn@mainline/${name}.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      `,
      )
      .join('\n');
    document.head.appendChild(style);
  } catch (error) {
    console.error('Failed to load font manifest or fonts:', error);
  }
})();

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
    fontFamily:
      settings.fontFamily && settings.fontFamily !== 'default'
        ? `${settings.fontFamily}, 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`
        : `'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`,
    theme: `ace/theme/${settings.theme ?? 'textmate'}`,
    wrap: settings.wrap ?? true,
    showLineNumbers: settings.showLineNumbers ?? true,
    showGutter: settings.showGutter ?? true,
    behavioursEnabled: settings.behavioursEnabled ?? false,
    enableLiveAutocompletion: settings.enableBasicAutocompletion ?? false,
    enableBasicAutocompletion: settings.enableBasicAutocompletion ?? false,
    displayIndentGuides: settings.displayIndentGuides ?? false,
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
    useSoftTabs: settings.useSoftTabs ?? true,
    tabSize: parseInt(settings.tabSize ?? '2'),
  });

  editor.container.style.lineHeight = settings.lineHeight || 'normal';

  if (settings.wideEditor) {
    const main = document.getElementById('main-content') as HTMLDivElement;
    const child = main.children[0] as HTMLDivElement;
    child.style.margin = '0';
    const scratchpadWrapOuter = document.getElementsByClassName('scratchpad-wrap-outer')[0] as HTMLDivElement;
    scratchpadWrapOuter.style.margin = '0';
    const wrapOuterChild = scratchpadWrapOuter.children[0] as HTMLDivElement;
    wrapOuterChild.style.margin = '0';
    const scratchpadWrap = document.getElementsByClassName('scratchpad-wrap')[0] as HTMLDivElement;
    scratchpadWrap.style.width = '100vw';
  } else {
    const main = document.getElementById('main-content') as HTMLDivElement;
    const child = main.children[0] as HTMLDivElement;
    child.style.margin = '';

    const scratchpadWrapOuter = document.getElementsByClassName('scratchpad-wrap-outer')[0] as HTMLDivElement;
    scratchpadWrapOuter.style.margin = '';

    const wrapOuterChild = scratchpadWrapOuter.children[0] as HTMLDivElement;
    wrapOuterChild.style.margin = '';

    const scratchpadWrap = document.getElementsByClassName('scratchpad-wrap')[0] as HTMLDivElement;
    scratchpadWrap.style.width = '';
  }

  editor.renderer.updateFontSize();
  editor.renderer.updateCursor();
}

interface AceConfig {
  config: {
    set: (key: string, value: string) => void;
  };
}

Object.defineProperty(window, 'ace', {
  get() {
    return _ace;
  },
  set(value: Ace) {
    _ace = value;
    requireClassName('ace_editor').then((elements) => {
      (_ace as unknown as AceConfig).config.set(
        'themePath',
        'https://cdn.jsdelivr.net/npm/ace-builds@latest/src-min-noconflict/',
      );
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
