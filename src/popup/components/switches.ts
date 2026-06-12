export function setupSwitches() {
  document.querySelectorAll('.switch .track').forEach(track => {
    track.addEventListener('click', () => {
      const input = track.previousElementSibling;
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change'));
    });
  });
}
