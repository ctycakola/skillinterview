const THEME_KEY = 'skillinterview.theme';

export function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  updateToggle(theme);
}

export function toggleDarkMode() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  updateToggle(theme);
}

function updateToggle(theme) {
  const button = document.querySelector('#theme-toggle');
  if (!button) return;
  const dark = theme === 'dark';
  button.innerHTML = `<i class="bi bi-${dark ? 'sun' : 'moon-stars'}"></i>`;
  button.setAttribute('aria-label', dark ? 'Use light mode' : 'Use dark mode');
  button.title = dark ? 'Use light mode' : 'Use dark mode';
}
