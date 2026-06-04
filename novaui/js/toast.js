/* js/toast.js */
(function (global) {
  function getOrCreateContainer() {
    let container = document.querySelector('.nl-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'nl-toast-container nl-z-toast';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(options = {}) {
    const container = getOrCreateContainer();
    const {
      title,
      description,
      variant = 'default', // default, success, warning, destructive, info
      duration = 4000
    } = options;

    const toast = document.createElement('div');
    toast.className = `nl-toast nl-toast-${variant}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    let html = '';
    html += '<div class="nl-toast-body">';
    if (title) {
      html += `<div class="nl-toast-title">${title}</div>`;
    }
    if (description) {
      html += `<div class="nl-toast-description">${description}</div>`;
    }
    html += '</div>';
    html += '<button class="nl-toast-close" aria-label="Close toast" data-toast-close>&times;</button>';

    toast.innerHTML = html;

    // Attach close listener
    const closeBtn = toast.querySelector('[data-toast-close]');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    container.appendChild(toast);

    // Auto dismiss after duration
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        dismissToast(toast);
      }, duration);
      toast.dataset.timeoutId = timeoutId;
    }

    return toast;
  }

  function dismissToast(toast) {
    if (!toast) return;
    
    // Clear timeout if it exists
    if (toast.dataset.timeoutId) {
      clearTimeout(parseInt(toast.dataset.timeoutId, 10));
    }

    toast.classList.add('nl-toast-closing');
    
    // Remove element after transition ends
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
    
    // Fallback if transition event doesn't fire
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }

  global.NovaToast = {
    show: showToast,
    dismiss: dismissToast
  };
})(window);
