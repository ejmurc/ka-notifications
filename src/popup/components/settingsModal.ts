export function setupSettingsModal(): void {
  const dropdown = document.getElementById('dropdown');
  const backdrop = document.getElementById('modal-backdrop');
  const settingsDropdown = document.getElementById('settings-dropdown');
  const settingsModal = document.getElementById('settings-modal') as HTMLDialogElement;
  const closeModalButton = document.getElementById('close-modal');

  if (!dropdown || !settingsDropdown || !settingsModal || !closeModalButton || !backdrop) return;

  function openModal(): void {
    settingsModal.classList.remove('hidden');
    settingsModal.show();
    requestAnimationFrame(() => backdrop!.classList.add('open'));
  }

  function closeModal(): void {
    backdrop!.classList.remove('open');
    settingsModal.classList.add('closing');
    settingsModal.addEventListener(
      'animationend',
      () => {
        settingsModal.classList.remove('closing');
        settingsModal.classList.add('hidden');
        setTimeout(() => settingsModal.close(), 0);
      },
      { once: true },
    );
  }

  settingsDropdown.addEventListener('click', () => {
    dropdown.classList.add('hidden');
    openModal();
  });

  closeModalButton.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
}
