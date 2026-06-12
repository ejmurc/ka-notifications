async function logout(): Promise<void> {
  await chrome.tabs.create({ url: 'https://www.khanacademy.org/logout' });
  window.close();
}

export function setupSignoutDropdown() {
  const el = document.getElementById('signout-dropdown');
  const dropdown = document.getElementById('dropdown');
  if (el && dropdown) {
    el.addEventListener('click', async () => {
      logout();
      dropdown.classList.add('hidden');
    });
  }
}
