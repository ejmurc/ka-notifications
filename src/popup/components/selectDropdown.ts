export function setupSelectDropdown(
  triggerId: string,
  menuId: string,
  onChange: (value: string) => void,
): (value: string) => void {
  const trigger = document.getElementById(triggerId) as HTMLButtonElement;
  const menu = document.getElementById(menuId);
  if (!trigger || !menu) return () => {};
  const valueEl = trigger.querySelector('.dropdown-select-value');

  function setValue(newValue: string): void {
    if (valueEl) valueEl.textContent = '';
    const items = menu!.querySelectorAll<HTMLButtonElement>('.dropdown-item');
    for (const item of items) {
      const selected = item.dataset.value === newValue;
      item.classList.toggle('selected', selected);
      if (selected && valueEl) valueEl.textContent = item.textContent!.trim();
    }
  }

  if (trigger.dataset.initialized) return setValue;
  trigger.dataset.initialized = 'true';

  function openMenu(): void {
    const triggerRect = trigger.getBoundingClientRect();
    const MARGIN = 8;
    const MAX_HEIGHT = 240;
    const spaceBelow = window.innerHeight - triggerRect.bottom - MARGIN;
    const spaceAbove = triggerRect.top - MARGIN;
    const openUpward = spaceBelow < MAX_HEIGHT && spaceAbove > spaceBelow;
    menu!.style.top = '';
    menu!.style.bottom = '';
    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const menuHeight = Math.min(MAX_HEIGHT, availableSpace);
    menu!.style.maxHeight = `${menuHeight}px`;
    menu!.style.overflowY = 'auto';
    if (openUpward) {
      menu!.style.top = 'auto';
      menu!.style.bottom = `calc(100% + 0.375rem)`;
    } else {
      menu!.style.bottom = 'auto';
      menu!.style.top = `calc(100% + 0.375rem)`;
    }
    menu!.classList.remove('hidden');
    trigger.classList.add('active');
    const selected = menu!.querySelector<HTMLElement>('.dropdown-item.selected');
    if (selected) {
      const menuRect = menu!.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      const offset = selectedRect.top - menuRect.top + menu!.scrollTop;
      menu!.scrollTop = offset - menuHeight / 2 + selected.offsetHeight / 2;
    }
  }

  trigger.addEventListener('click', () => {
    const isOpen = !menu!.classList.contains('hidden');
    if (isOpen) {
      menu!.classList.add('hidden');
      trigger.classList.remove('active');
    } else {
      openMenu();
      const handler = (e: MouseEvent) => {
        if (!menu!.contains(e.target as Node) && !trigger.contains(e.target as Node)) {
          menu!.classList.add('hidden');
          trigger.classList.remove('active');
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }
  });

  menu.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-value]');
    if (!btn) return;
    const newValue = btn.dataset.value!;
    setValue(newValue);
    menu!.classList.add('hidden');
    trigger.classList.remove('active');
    onChange(newValue);
  });

  return setValue;
}
