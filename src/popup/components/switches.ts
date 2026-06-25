export function setupSwitches() {
  document.querySelectorAll('.switch .track').forEach(track => {
    track.addEventListener('click', () => {
      const input = track.previousElementSibling as HTMLInputElement | null;
      if (!input) return;
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change'));
    });
  });
}
