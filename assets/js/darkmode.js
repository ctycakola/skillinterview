const THEME_KEY = 'skillinterview_theme';

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggle');
  const body = document.body;
  
  // Load saved theme
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }

  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    if(themeToggleBtn) {
      if(theme === 'dark') {
        themeToggleBtn.innerHTML = '<i class="bi bi-sun"></i>';
      } else {
        themeToggleBtn.innerHTML = '<i class="bi bi-moon"></i>';
      }
    }
  }
});
