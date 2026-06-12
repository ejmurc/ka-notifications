export function setupSelectDropdown(
  triggerId: string,
  menuId: string,
  onChange: (value: string) => void,
): (value: string) => void {
  const trigger = document.getElementById(triggerId) as HTMLButtonElement;
  const menu = document.getElementById(menuId);
  if (!trigger || !menu) return () => {};

  const valueEl = trigger.querySelector('.dropdown-select-value');
  const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('.dropdown-item'));

  function setValue(newValue: string): void {
    if (valueEl) valueEl.textContent = '';
    for (const item of items) {
      const selected = item.dataset.value === newValue;
      item.classList.toggle('selected', selected);
      if (selected && valueEl) valueEl.textContent = item.textContent!.trim();
    }
  }

  trigger.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    trigger.classList.toggle('active', !isOpen);
  });

  for (const item of items) {
    item.addEventListener('click', () => {
      const newValue = item.dataset.value!;
      setValue(newValue);
      menu.classList.add('hidden');
      trigger.classList.remove('active');
      onChange(newValue);
    });
  }

  document.addEventListener('mousedown', e => {
    if (!menu.contains(e.target as Node) && !trigger.contains(e.target as Node)) {
      menu.classList.add('hidden');
      trigger.classList.remove('active');
    }
  });

  return setValue;
}
