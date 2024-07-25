import { requireId } from '../utils/dom-utils';

const split = window.location.pathname.split('/');
const isComputerScience: boolean = split[1] === 'computer-programming' || split[1] === 'cs';

function getTabId(qaExpandType: string | null): string {
  switch (qaExpandType) {
    case 'question':
    case 'answer':
      return 'ka-uid-discussiontabbedpanel-0--tabbedpanel-tab-1';
    case 'comment':
    case 'reply':
    default:
      return 'ka-uid-discussiontabbedpanel-0--tabbedpanel-tab-2';
    case 'project_help_question':
      return 'ka-uid-discussiontabbedpanel-0--tabbedpanel-tab-0';
  }
}

// Project page
if (isComputerScience && /^\d{16}$/.test(split[3].split('?')[0])) {
  const fetchOverrideScript = document.createElement('script');
  fetchOverrideScript.src = chrome.runtime.getURL('fetch-override.js');
  document.body.appendChild(fetchOverrideScript);

  // Set feedback tab based on expand type
  const qaExpandType = new URLSearchParams(window.location.search).get('qa_expand_type');
  requireId(getTabId(qaExpandType)).then((qaTab) => {
    if (!(qaTab instanceof HTMLButtonElement)) return;
    qaTab.click();
    window.scrollTo(0, 0);

    // Sort comments
    chrome.storage.local.get('defaultCommentSort', async ({ defaultCommentSort }) => {
      if (!defaultCommentSort) return;
      const sortDropdownButton = await requireId('sortBy');
      if (!(sortDropdownButton instanceof HTMLButtonElement)) return;
      sortDropdownButton.click();
      const sortButtons = document.querySelectorAll<HTMLButtonElement>(
        "div[data-test-id='dropdown-core-container'] button",
      );
      sortButtons.forEach((sortButton) => {
        if (sortButton.innerText.includes(defaultCommentSort)) {
          sortButton.click();
        }
      });
      window.scrollTo(0, 0);
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  });
}

// New program
if (isComputerScience && split[2] === 'new') {
  const aceOverrideScript = document.createElement('script');
  aceOverrideScript.src = chrome.runtime.getURL('ace-override.js');
  document.body.appendChild(aceOverrideScript);
}
