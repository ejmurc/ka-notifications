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
let settings: EditorSettings;

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

function isNewProgramURL(url: string): boolean {
  return /^https:\/\/www\.khanacademy\.org\/(computer-programming|cs)\/new\/[^/]+$/.test(url);
}

async function fetchExtensionSettings(): Promise<void> {
  return new Promise(resolve => {
    const listener = () => {
      document.removeEventListener('EDITOR_SETTINGS', listener);
      clearInterval(interval);
      clearTimeout(timeout);
      resolve();
    };

    document.addEventListener('EDITOR_SETTINGS', listener);

    const interval = setInterval(() => {
      document.dispatchEvent(new CustomEvent('EDITOR_SETTINGS_REQUEST'));
    }, SETTINGS_REQUEST_INTERVAL);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      document.removeEventListener('EDITOR_SETTINGS', listener);
      console.warn('[fetchExtensionSettings] Timed out waiting for editor settings');
      resolve();
    }, SETTINGS_REQUEST_TIMEOUT);

    document.dispatchEvent(new CustomEvent('EDITOR_SETTINGS_REQUEST'));
  });
}

document.addEventListener('EDITOR_SETTINGS', (event: Event) => {
  const customEvent = event as CustomEvent;
  if (customEvent.detail && customEvent.detail.settings) {
    settings = customEvent.detail.settings;
    updateEditorSettings();
  }
});

async function updateEditorSettings(): Promise<void> {
  if (!editor || !settings) return;

  await loadEditorFont(settings.fontFamily ?? 'default', settings.fontKey ?? '');

  editor.container.style.fontSize = `${parseInt(settings.fontSize ?? '14', 10)}px`;

  editor.setOptions({
    fontFamily:
      settings.fontFamily && settings.fontFamily !== 'default'
        ? `'${settings.fontFamily}', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`
        : `'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`,
    theme: `ace/theme/${settings.theme ?? 'textmate'}`,
    wrap: settings.wrap ?? true,
    showLineNumbers: settings.showLineNumbers ?? true,
    showGutter: settings.showGutter ?? true,
    behavioursEnabled: settings.behavioursEnabled ?? false,
    enableLiveAutocompletion: settings.autocompletion ?? false,
    enableBasicAutocompletion: settings.autocompletion ?? false,
    displayIndentGuides: settings.displayIndentGuides ?? false,
  });

  if (settings.slimCursor) {
    if (!slimCursorStyle?.isConnected) {
      document.head.appendChild(slimCursorStyle!);
    }
  } else {
    slimCursorStyle?.remove();
  }

  const session = editor.getSession();
  session.setOptions({
    useSoftTabs: settings.softTabs ?? true,
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

function waitForEditor(): Promise<void> {
  return new Promise(resolve => {
    function patchEdit(editFn: typeof _ace.edit): void {
      const originalEdit = editFn.bind(_ace);
      _ace.edit = function (el) {
        _ace.edit = originalEdit;
        editor =
          typeof el === 'string' ? originalEdit(el as string) : originalEdit(el as HTMLElement);
        resolve();
        return editor;
      };
    }

    if (_ace.edit) {
      patchEdit(_ace.edit);
    } else {
      Object.defineProperty(_ace, 'edit', {
        configurable: true,
        enumerable: true,
        set(fn: typeof _ace.edit) {
          Object.defineProperty(_ace, 'edit', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: fn,
          });
          patchEdit(fn);
        },
      });
    }

    queueMicrotask(() => {
      const el = document.querySelector('.ace_editor');
      const existing = (el as (HTMLElement & { env?: { editor?: AceAjax.Editor } }) | null)?.env
        ?.editor;
      if (existing && !editor) {
        editor = existing;
        resolve();
      }
    });
  });
}

async function onAceSet(): Promise<void> {
  const currentHref = window.location.href;

  const editorPromise = waitForEditor();
  const settingsPromise = fetchExtensionSettings();
  await Promise.all([cacheDOMReferences(), settingsPromise, editorPromise]);

  (_ace as unknown as AceConfig).config.set(
    'themePath',
    'https://cdn.jsdelivr.net/npm/ace-builds@latest/src-min-noconflict/',
  );

  await updateEditorSettings();

  if (isNewProgramURL(currentHref)) {
    const programType = currentHref?.split('/')?.[5]?.toLowerCase();
    if (!programType) {
      console.warn('[onAceSet] could not parse programType from href, bailing');
      return;
    }
    const cacheName = `__khanacademy_new_${programType}_cache__`;
    const cache = localStorage.getItem(cacheName);
    if (cache) {
      try {
        const { content, cursor } = JSON.parse(cache);
        editor.session.setValue(content);
        editor.moveCursorToPosition(cursor);
        editor.renderer.scrollCursorIntoView();
      } catch (error) {
        console.error('[onAceSet] failed to restore cache:', error);
      }
    }
    editor.focus();

    let saveBeforeUnload = false;

    function saveProgram() {
      if (!isNewProgramURL(window.location.href)) {
        editor.selection.off('changeCursor', saveProgram);
        editor.off('change', saveProgram);
        window.removeEventListener('beforeunload', saveProgram);
        document.body.removeEventListener('mouseup', handleSaveClick);
        return;
      }

      if (!saveBeforeUnload) {
        window.addEventListener('beforeunload', saveProgram);
        saveBeforeUnload = true;
      }

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

    function handleSaveClick(e: MouseEvent) {
      if (!isNewProgramURL(window.location.href)) {
        document.body.removeEventListener('mouseup', handleSaveClick);
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.textContent?.trim() === 'Save' &&
        !!target.closest('.modal, .dialog, .popup, [role="dialog"]')
      ) {
        window.removeEventListener('beforeunload', saveProgram);
        document.body.removeEventListener('mouseup', handleSaveClick);
        saveBeforeUnload = false;
        localStorage.removeItem(cacheName);
      }
    }

    document.body.addEventListener('mouseup', handleSaveClick);
  }
}

const existingAce = (window as WindowWithAce).ace;

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
