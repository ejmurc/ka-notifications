import { waitForClass } from './lib/dom';
import { EditorSettings } from './types/extension';
import {
  FONTS_CACHE_NAME,
  SETTINGS_REQUEST_INTERVAL,
  SETTINGS_REQUEST_TIMEOUT,
  ACE_THEME_PATH,
  ACE_THEME_PREFIX,
  KA_NEW_PROGRAM_CACHE_PREFIX,
  KA_NEW_PROGRAM_URL_RE,
} from './lib/constants';

interface WindowWithAce extends Window {
  ace?: Ace;
}

interface AceConfig {
  config: {
    set: (key: string, value: string) => void;
  };
}

type Ace = typeof ace;

interface EditorState {
  editor: AceAjax.Editor | null;
  mainContent: HTMLDivElement | null;
  mainContentChild: HTMLDivElement | null;
  scratchpadWrapOuter: HTMLDivElement | null;
  scratchpadWrapOuterChild: HTMLDivElement | null;
  scratchpadWrap: HTMLDivElement | null;
  slimCursorStyle: HTMLStyleElement | null;
  initialized: boolean;
}

function createEditorState(): EditorState {
  return {
    editor: null,
    mainContent: null,
    mainContentChild: null,
    scratchpadWrapOuter: null,
    scratchpadWrapOuterChild: null,
    scratchpadWrap: null,
    slimCursorStyle: null,
    initialized: false,
  };
}

let _ace: Ace;
let settings: EditorSettings;
let state = createEditorState();
let currentURL = window.location.href;

let boundSaveProgram: (() => void) | null = null;
let boundHandleSaveClick: ((e: MouseEvent) => void) | null = null;
let saveBeforeUnload = false;

function teardown(): void {
  if (state.editor && boundSaveProgram) {
    state.editor.selection.off('changeCursor', boundSaveProgram);
    state.editor.off('change', boundSaveProgram);
  }
  if (boundSaveProgram && saveBeforeUnload) {
    window.removeEventListener('beforeunload', boundSaveProgram);
    saveBeforeUnload = false;
  }
  if (boundHandleSaveClick) {
    document.body.removeEventListener('mouseup', boundHandleSaveClick);
  }
  state.slimCursorStyle?.remove();
  boundSaveProgram = null;
  boundHandleSaveClick = null;
  state = createEditorState();
}

function onURLChange(): void {
  const newURL = window.location.href;
  if (newURL !== currentURL) {
    currentURL = newURL;
    teardown();
  }
}

const _pushState = history.pushState.bind(history);
history.pushState = function (...args: Parameters<typeof history.pushState>) {
  _pushState(...args);
  onURLChange();
};

const _replaceState = history.replaceState.bind(history);
history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
  _replaceState(...args);
  onURLChange();
};

window.addEventListener('popstate', onURLChange);

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

async function cacheDOMReferences(): Promise<void> {
  state.mainContent = document.getElementById('main-content') as HTMLDivElement;
  state.mainContentChild = state.mainContent?.children[0] as HTMLDivElement;
  const [wrapOuterEls, wrapEls] = await Promise.all([
    waitForClass('scratchpad-wrap-outer'),
    waitForClass('scratchpad-wrap'),
  ]);
  state.scratchpadWrapOuter = wrapOuterEls[0] as HTMLDivElement;
  state.scratchpadWrapOuterChild = state.scratchpadWrapOuter?.children[0] as HTMLDivElement;
  state.scratchpadWrap = wrapEls[0] as HTMLDivElement;
  state.slimCursorStyle = document.createElement('style');
  state.slimCursorStyle.setAttribute('data-slim-cursor', 'true');
  state.slimCursorStyle.textContent = `
    .ace_cursor {
      border-left-width: 1px !important;
      margin-left: -0.5px !important;
    }
  `;
}

function isNewProgramURL(url: string): boolean {
  return KA_NEW_PROGRAM_URL_RE.test(url);
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
  if (customEvent.detail?.settings) {
    settings = customEvent.detail.settings;
    updateEditorSettings();
  }
});

async function updateEditorSettings(): Promise<void> {
  if (!state.editor || !settings) return;

  const {
    editor,
    mainContent,
    mainContentChild,
    scratchpadWrapOuter,
    scratchpadWrapOuterChild,
    scratchpadWrap,
  } = state;

  const hasDOMRefs =
    mainContent &&
    mainContentChild &&
    scratchpadWrapOuter &&
    scratchpadWrapOuterChild &&
    scratchpadWrap;

  await loadEditorFont(settings.fontFamily ?? 'default', settings.fontKey ?? '');

  editor.container.style.fontSize = `${parseInt(settings.fontSize ?? '14', 10)}px`;
  editor.setOptions({
    fontFamily:
      settings.fontFamily && settings.fontFamily !== 'default'
        ? `'${settings.fontFamily}', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`
        : `'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace`,
    theme: `${ACE_THEME_PREFIX}${settings.theme ?? 'textmate'}`,
    wrap: settings.wrap ?? true,
    showLineNumbers: settings.showLineNumbers ?? true,
    showGutter: settings.showGutter ?? true,
    behavioursEnabled: settings.behavioursEnabled ?? false,
    enableLiveAutocompletion: settings.autocompletion ?? false,
    enableBasicAutocompletion: settings.autocompletion ?? false,
    displayIndentGuides: settings.displayIndentGuides ?? false,
  });

  if (settings.slimCursor) {
    if (!state.slimCursorStyle?.isConnected) {
      document.head.appendChild(state.slimCursorStyle!);
    }
  } else {
    state.slimCursorStyle?.remove();
  }

  editor.getSession().setOptions({
    useSoftTabs: settings.softTabs ?? true,
    tabSize: parseInt(settings.tabSize ?? '2', 10),
  });

  editor.container.style.lineHeight = settings.lineHeight || 'normal';

  if (hasDOMRefs) {
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

function waitForEditor(): Promise<void> {
  return new Promise(resolve => {
    function patchEdit(editFn: typeof _ace.edit): void {
      const originalEdit = editFn.bind(_ace);
      _ace.edit = function (el: string | HTMLElement, ...rest: unknown[]) {
        _ace.edit = originalEdit;
        (_ace as unknown as AceConfig).config.set('themePath', ACE_THEME_PATH);
        const invokeEdit = originalEdit as (
          target: string | HTMLElement,
          ...args: unknown[]
        ) => AceAjax.Editor;
        state.editor = invokeEdit(el, ...rest);
        resolve();
        return state.editor;
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
      if (existing && !state.editor) {
        state.editor = existing;
        resolve();
      }
    });
  });
}

function restoreNewProgramCache(cacheName: string): void {
  const cached = localStorage.getItem(cacheName);
  if (!cached || !state.editor) return;
  try {
    const { content, cursor } = JSON.parse(cached);
    state.editor.session.setValue(content);
    state.editor.moveCursorToPosition(cursor);
    state.editor.renderer.scrollCursorIntoView();
  } catch (error) {
    console.error('[restoreNewProgramCache] Failed to restore cache:', error);
  }
}

function makeSaveProgram(cacheName: string): () => void {
  return function saveProgram() {
    if (!isNewProgramURL(window.location.href)) {
      if (state.editor) {
        state.editor.selection.off('changeCursor', boundSaveProgram!);
        state.editor.off('change', boundSaveProgram!);
      }
      window.removeEventListener('beforeunload', boundSaveProgram!);
      document.body.removeEventListener('mouseup', boundHandleSaveClick!);
      saveBeforeUnload = false;
      return;
    }
    if (!saveBeforeUnload) {
      window.addEventListener('beforeunload', boundSaveProgram!);
      saveBeforeUnload = true;
    }
    const content = state.editor?.getValue() ?? '';
    const cursor = state.editor?.getCursorPosition();
    if (content.length === 0) {
      localStorage.removeItem(cacheName);
    } else {
      localStorage.setItem(cacheName, JSON.stringify({ content, cursor }));
    }
  };
}

function makeHandleSaveClick(cacheName: string): (e: MouseEvent) => void {
  return function handleSaveClick(e: MouseEvent) {
    if (!isNewProgramURL(window.location.href)) {
      document.body.removeEventListener('mouseup', boundHandleSaveClick!);
      return;
    }
    const target = e.target as HTMLElement;
    const inDialog = !!target.closest(
      '[role="dialog"], [role="alertdialog"], [aria-modal="true"], .modal, .dialog, .popup',
    );
    const isSaveButton =
      target.textContent?.trim().toLowerCase() === 'save' ||
      !!target.closest('[data-test-id*="save"]');
    if (isSaveButton && inDialog) {
      window.removeEventListener('beforeunload', boundSaveProgram!);
      document.body.removeEventListener('mouseup', boundHandleSaveClick!);
      if (state.editor) {
        state.editor.selection.off('changeCursor', boundSaveProgram!);
        state.editor.off('change', boundSaveProgram!);
      }
      saveBeforeUnload = false;
      localStorage.removeItem(cacheName);
    }
  };
}

function attachNewProgramListeners(cacheName: string): void {
  boundSaveProgram = makeSaveProgram(cacheName);
  boundHandleSaveClick = makeHandleSaveClick(cacheName);
  state.editor!.selection.on('changeCursor', boundSaveProgram);
  state.editor!.on('change', boundSaveProgram);
  document.body.addEventListener('mouseup', boundHandleSaveClick);
}

async function initializeEditor(currentHref: string): Promise<void> {
  await waitForEditor();
  (_ace as unknown as AceConfig).config.set('themePath', ACE_THEME_PATH);
  await Promise.all([cacheDOMReferences(), fetchExtensionSettings()]);
  await updateEditorSettings();

  if (!isNewProgramURL(currentHref)) return;

  const programType = currentHref.split('/')?.[5]?.toLowerCase();
  if (!programType) {
    console.warn('[initializeEditor] Could not parse programType from href, bailing');
    return;
  }

  const cacheName = `${KA_NEW_PROGRAM_CACHE_PREFIX}${programType}_cache__`;
  restoreNewProgramCache(cacheName);
  state.editor!.focus();
  attachNewProgramListeners(cacheName);
}

async function onAceSet(): Promise<void> {
  if (state.initialized) return;
  state.initialized = true;
  await initializeEditor(window.location.href);
}

const existingAce = (window as WindowWithAce).ace;
const descriptor = Object.getOwnPropertyDescriptor(window, 'ace');
if (!descriptor || descriptor.configurable) {
  delete (window as WindowWithAce).ace;
}

Object.defineProperty(window, 'ace', {
  configurable: true,
  get() {
    return _ace;
  },
  set(value: Ace) {
    if (!value) return;
    _ace = value;
    onAceSet();
  },
});

if (existingAce) {
  _ace = existingAce;
  onAceSet();
}
