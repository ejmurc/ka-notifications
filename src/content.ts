import { waitForId, waitForSelector } from './lib/dom';

const pathSegments = window.location.pathname.split('/');
const isComputerSciencePage = pathSegments[1] === 'computer-programming' || pathSegments[1] === 'cs';
const projectId = pathSegments[3]?.split('?')?.[0];

async function initializeContentScript(): Promise<void> {
  await new Promise<void>((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve();
    } else {
      window.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    }
  });

  function getTabSelectorForExpandType(expandType: string | null): string {
    switch (expandType) {
      case 'question':
      case 'answer':
        return 'button[data-testid=questions]';
      case 'project_help_question':
        return 'button[data-testid=projecthelp]';
      default:
        return 'button[data-testid=comments]';
    }
  }

  function attachEditorSettingsSync(): void {
    const postEditorSettings = (settings: any) => {
      window.postMessage({ type: 'EDITOR_SETTINGS', settings }, '*');
    };

    window.addEventListener('message', (event) => {
      if (event.source === window && event.data.type === 'EDITOR_SETTINGS_REQUEST') {
        chrome.storage.local.get('editorSettings', ({ editorSettings }) => {
          postEditorSettings(editorSettings || {});
        });
      }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes['editorSettings']) {
        postEditorSettings(changes['editorSettings'].newValue);
      }
    });
  }

  function injectScriptFile(filename: string): void {
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL(filename);
    document.body.appendChild(scriptElement);
  }

  if (isComputerSciencePage && /^\d{16}$/.test(projectId || '')) {
    injectScriptFile('fetch-override.js');

    const expandType = new URLSearchParams(location.search).get('qa_expand_type');
    const tabSelector = getTabSelectorForExpandType(expandType);
    const qaTabElement = await waitForSelector(tabSelector);

    if (qaTabElement instanceof HTMLButtonElement) {
      qaTabElement.click();

      const { defaultCommentSort = 'Top Voted' } = await chrome.storage.local.get('defaultCommentSort');
      const sortButton = await waitForId('sortBy');
      if (sortButton instanceof HTMLButtonElement) {
        sortButton.click();
        const dropdown = await waitForSelector("div[data-testid='dropdown-popper']");
        const sortButtons = dropdown.getElementsByTagName('button');

        for (const button of sortButtons) {
          if (button.innerText.includes(defaultCommentSort)) {
            button.click();
            sortButton.blur();
            break;
          }
        }

        for (const element of document.querySelectorAll('div')) {
          const computedStyle = getComputedStyle(element);
          if (
            (computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') &&
            element.scrollHeight > element.clientHeight
          ) {
            element.scrollTo(0, 0);
            break;
          }
        }
      }
    }

    attachEditorSettingsSync();
    injectScriptFile('ace-override.js');
  } else if (isComputerSciencePage && pathSegments[2] === 'new') {
    attachEditorSettingsSync();
    injectScriptFile('ace-override.js');
  }
}

initializeContentScript();
