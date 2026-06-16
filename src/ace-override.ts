import { waitForClass } from './lib/dom';
import { EditorSettings } from './types/extension';
import {
  FONTS_CACHE_NAME,
  SETTINGS_REQUEST_INTERVAL,
  SETTINGS_REQUEST_TIMEOUT,
} from './lib/constants';

interface WindowWithAce extends Window {
  ace?: Ace;
}

async function loadEditorFont(fontFamily: string, fontKey: string): Promise<void> {
  if (!fontFamily || fontFamily === 'default' || !fontKey) return;

  const id = `bunny-font-${fontKey}`;
  if (document.getElementById(id)) return;

  const url = `https://fonts.bunny.net/css?family=${fontKey}`;
  let css: string;
  try {
    const cache = await caches.open(FONTS_CACHE_NAME);
    let response = await cache.match(url);
    if (!response || !response.ok) {
      const fresh = await fetch(url);
      if (!fresh.ok) throw new Error(`Bunny Fonts returned ${fresh.status}`);
      cache.put(url, fresh.clone());
      response = fresh;
    }
    css = await response.text();
  } catch (error) {
    console.warn('[loadEditorFont] Failed to load font, falling back to system monospace:', error);
    return;
  }

  css = css.trim();
  if (!css) {
    console.warn('[loadEditorFont] Empty CSS response for font:', fontFamily);
    return;
  }

  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

type Ace = typeof ace;
let _ace: Ace;
let editor: AceAjax.Editor;
let settings: EditorSettings = {};

let mainContent: HTMLDivElement | null = null;
let mainContentChild: HTMLDivElement | null = null;
let scratchpadWrapOuter: HTMLDivElement | null = null;
let scratchpadWrapOuterChild: HTMLDivElement | null = null;
let scratchpadWrap: HTMLDivElement | null = null;
let slimCursorStyle: HTMLStyleElement | null = null;

async function cacheDOMReferences(): Promise<void> {
  mainContent = document.getElementById('main-content') as HTMLDivElement;
  mainContentChild = mainContent?.children[0] as HTMLDivElement;

  const [wrapOuterEls, wrapEls] = await Promise.all([
    waitForClass('scratchpad-wrap-outer'),
    waitForClass('scratchpad-wrap'),
  ]);

  scratchpadWrapOuter = wrapOuterEls[0] as HTMLDivElement;
  scratchpadWrapOuterChild = scratchpadWrapOuter?.children[0] as HTMLDivElement;
  scratchpadWrap = wrapEls[0] as HTMLDivElement;

  slimCursorStyle = document.createElement('style');
  slimCursorStyle.setAttribute('data-slim-cursor', 'true');
  slimCursorStyle.textContent = `
    .ace_cursor {
      border-left-width: 1px !important;
      margin-left: -0.5px !important;
    }
  `;
}

function isNewProgramURL(url: string) {
  return /^https:\/\/www\.khanacademy\.org\/(computer-programming|cs)\/new\/[^/]+$/.test(url);
}

async function fetchExtensionSettings(): Promise<void> {
  return new Promise(resolve => {
    const listener = (event: MessageEvent) => {
      if (event.data.type === 'EDITOR_SETTINGS') {
        window.removeEventListener('message', listener);
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    };

    window.addEventListener('message', listener);

    const interval = setInterval(() => {
      window.postMessage({ type: 'EDITOR_SETTINGS_REQUEST' }, '*');
    }, SETTINGS_REQUEST_INTERVAL);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      window.removeEventListener('message', listener);
      console.warn('[fetchExtensionSettings] Timed out waiting for editor settings');
      resolve();
    }, SETTINGS_REQUEST_TIMEOUT);

    window.postMessage({ type: 'EDITOR_SETTINGS_REQUEST' }, '*');
  });
}

window.addEventListener('message', event => {
  if (event.source !== window) return;
  if (event.data.type === 'EDITOR_SETTINGS') {
    settings = event.data.settings;
    updateEditorSettings();
  }
});

let allowEditorSettingsOverride = false;

async function updateEditorSettings(): Promise<void> {
  if (!editor || !settings) return;

  await loadEditorFont(settings.fontFamily ?? 'default', settings.fontKey ?? '');

  allowEditorSettingsOverride = true;
  editor.setOptions({
    fontSize: `${parseInt(settings.fontSize ?? '14', 10)}px`,
    fontFamily:
      settings.fontFamily && settings.fontFamily !== 'default'
        ? `'${settings.fontFamily}', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`
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

  if (settings.slimCursor) {
    if (!slimCursorStyle?.isConnected) {
      document.head.appendChild(slimCursorStyle!);
    }
  } else {
    slimCursorStyle?.remove();
  }

  const session = editor.getSession();
  session.setOptions({
    useSoftTabs: settings.useSoftTabs ?? true,
    tabSize: parseInt(settings.tabSize ?? '2', 10),
  });

  editor.container.style.lineHeight = settings.lineHeight || 'normal';

  if (
    mainContent &&
    mainContentChild &&
    scratchpadWrapOuter &&
    scratchpadWrapOuterChild &&
    scratchpadWrap
  ) {
    if (settings.wideEditor) {
      mainContentChild.style.margin = '0';
      scratchpadWrapOuter.style.margin = '0';
      scratchpadWrapOuterChild.style.margin = '0';
      scratchpadWrap.style.width = '100vw';
    } else {
      mainContentChild.style.margin = '';
      scratchpadWrapOuter.style.margin = '';
      scratchpadWrapOuterChild.style.margin = '';
      scratchpadWrap.style.width = '';
    }
    editor.resize();
  }

  editor.renderer.updateCursor();
}

interface AceConfig {
  config: {
    set: (key: string, value: string) => void;
  };
}

async function onAceSet(): Promise<void> {
  const elements = await waitForClass('scratchpad-ace-editor');
  (_ace as unknown as AceConfig).config.set(
    'themePath',
    'https://cdn.jsdelivr.net/npm/ace-builds@latest/src-min-noconflict/',
  );

  const editorElement = elements[0] as HTMLDivElement;
  editor = _ace.edit(editorElement);
  await cacheDOMReferences();

  const originalSetFontSize = editor.setFontSize.bind(editor);
  editor.setFontSize = function (size) {
    if (!allowEditorSettingsOverride) return;
    return originalSetFontSize(size);
  };

  await fetchExtensionSettings();

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
    document.body.addEventListener('mouseup', e => {
      const target = e.target as HTMLElement;
      if (
        target.textContent?.trim() === 'Save' &&
        !!target.closest('.modal, .dialog, .popup, [role="dialog"]')
      ) {
        window.removeEventListener('beforeunload', saveProgram);
        saveBeforeUnload = false;
        localStorage.removeItem(cacheName);
      }
    });
  }
}

const descriptor = Object.getOwnPropertyDescriptor(window, 'ace');
if (!descriptor || descriptor.configurable) {
  delete (window as WindowWithAce).ace;
}

Object.defineProperty(window, 'ace', {
  get() {
    return _ace;
  },
  set(value: Ace) {
    _ace = value;
    onAceSet();
  },
});

if (existingAce) {
  _ace = existingAce;
  onAceSet();
}
