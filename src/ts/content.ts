import { requireId, requireSelector } from '../utils/dom-utils';

const split = window.location.pathname.split('/');
const isComputerScience: boolean = split[1] === 'computer-programming' || split[1] === 'cs';

function getTabSelector(qaExpandType: string | null): string {
  switch (qaExpandType) {
    case 'question':
    case 'answer':
      return 'button[data-testid=questions]';
    case 'comment':
    case 'reply':
    default:
      return 'button[data-testid=comments]';
    case 'project_help_question':
      return 'button[data-testid=projecthelp]';
  }
}

// Project page
const projectId = split[3]?.split('?')?.[0];
if (isComputerScience && projectId != null && /^\d{16}$/.test(projectId)) {
  const fetchOverrideScript = document.createElement('script');
  fetchOverrideScript.src = chrome.runtime.getURL('fetch-override.js');
  document.body.appendChild(fetchOverrideScript);

  // Set feedback tab based on expand type
  const qaExpandType = new URLSearchParams(window.location.search).get('qa_expand_type');
  requireSelector(getTabSelector(qaExpandType)).then((qaTab) => {
    if (!(qaTab instanceof HTMLButtonElement)) return;
    qaTab.click();

    // Sort comments
    chrome.storage.local.get('defaultCommentSort', async ({ defaultCommentSort }) => {
      if (!defaultCommentSort) defaultCommentSort = 'Top Voted';
      const sortDropdownButton = await requireId('sortBy');
      if (!(sortDropdownButton instanceof HTMLButtonElement)) return;
      sortDropdownButton.click();
      const dropdown = await requireSelector("div[data-testid='dropdown-popper']");
      if (!dropdown) return;
      const sortButtons = dropdown.getElementsByTagName('button');
      for (const btn of sortButtons) {
        if (btn.innerText.includes(defaultCommentSort)) {
          btn.click();
          sortDropdownButton.blur();
          break;
        }
      }
      for (const el of document.querySelectorAll('div')) {
        const style = getComputedStyle(el);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          el.scrollTo(0, 0);
          break;
        }
      }
    });
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.type !== 'EDITOR_SETTINGS_REQUEST') return;
    chrome.storage.local.get('editorSettings', ({ editorSettings }) => {
      window.postMessage(
        {
          type: 'EDITOR_SETTINGS',
          settings: editorSettings || {},
        },
        '*',
      );
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['editorSettings']) {
      window.postMessage(
        {
          type: 'EDITOR_SETTINGS',
          settings: changes['editorSettings'].newValue,
        },
        '*',
      );
    }
  });

  const aceOverrideScript = document.createElement('script');
  aceOverrideScript.src = chrome.runtime.getURL('ace-override.js');
  document.body.appendChild(aceOverrideScript);
}

// New program
if (isComputerScience && split[2] === 'new') {
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.type !== 'EDITOR_SETTINGS_REQUEST') return;
    chrome.storage.local.get('editorSettings', ({ editorSettings }) => {
      window.postMessage(
        {
          type: 'EDITOR_SETTINGS',
          settings: editorSettings || {},
        },
        '*',
      );
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['editorSettings']) {
      window.postMessage(
        {
          type: 'EDITOR_SETTINGS',
          settings: changes['editorSettings'].newValue,
        },
        '*',
      );
    }
  });

  const aceOverrideScript = document.createElement('script');
  aceOverrideScript.src = chrome.runtime.getURL('ace-override.js');
  document.body.appendChild(aceOverrideScript);
}
