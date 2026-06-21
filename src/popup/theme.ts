export function onThemeChanged({ darkTheme }: Pick<StorageData, 'darkTheme'>): void {
  const root = document.documentElement;
  root.classList.add('no-transition');
  void root.offsetWidth;

  if (darkTheme === true) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  void root.offsetWidth;
  root.classList.remove('no-transition');

  const el = document.getElementById('theme');
  if (el) {
    el.checked = darkTheme === true;
  }
}
