/* js/theme.js */
(function (global) {
  const THEME_KEY = 'novaui-theme';
  
  function getTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Dispatch custom event so other components can react if necessary
    window.dispatchEvent(new CustomEvent('novaui-theme-change', { detail: { theme } }));
  }

  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
  }

  // Initialize theme on load
  function initTheme() {
    const initialTheme = getTheme();
    setTheme(initialTheme);

    // Watch system theme change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Delegate theme toggle click
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-theme-toggle]');
      if (toggleBtn) {
        toggleTheme();
      }
    });
  }

  // Run immediately to prevent flash of light theme
  initTheme();

  // Export to global namespace
  global.NovaTheme = {
    get: getTheme,
    set: setTheme,
    toggle: toggleTheme,
    init: initTheme
  };
})(window);
