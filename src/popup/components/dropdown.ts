export function setupDropdown(): void {
  const dropdown = document.getElementById('dropdown');
  const dropdownTrigger = document.getElementById('dropdown-trigger');
  if (!dropdown || !dropdownTrigger) return;
  function close(): void {
    dropdown!.classList.add('hidden');
    dropdownTrigger!.classList.remove('active');
  }
  function open(): void {
    dropdown!.classList.remove('hidden');
    dropdownTrigger!.classList.add('active');
  }
  dropdownTrigger.addEventListener('click', () => {
    dropdown.classList.contains('hidden') ? open() : close();
  });
  document.addEventListener('mousedown', e => {
    if (!dropdown.contains(e.target as Node) && !dropdownTrigger.contains(e.target as Node)) {
      close();
    }
  });
}
