/* js/dropdown.js */
(function (global) {
  function closeAllDropdowns(exceptElement) {
    const activeMenus = document.querySelectorAll('.nl-dropdown.nl-open');
    activeMenus.forEach((menu) => {
      if (exceptElement && menu.contains(exceptElement)) return;
      menu.classList.remove('nl-open');
      const trigger = menu.querySelector('.nl-dropdown-trigger');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initDropdowns() {
    // Click listener on document for toggling and closing dropdowns
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.nl-dropdown-trigger');
      
      if (trigger) {
        e.preventDefault();
        const dropdown = trigger.closest('.nl-dropdown');
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('nl-open');
        
        // Close others
        closeAllDropdowns(dropdown);

        // Toggle current
        if (isOpen) {
          dropdown.classList.remove('nl-open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          dropdown.classList.add('nl-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      } else {
        // Clicked outside, close all dropdowns
        closeAllDropdowns();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }

  global.NovaDropdown = {
    closeAll: closeAllDropdowns,
    init: initDropdowns
  };
})(window);
