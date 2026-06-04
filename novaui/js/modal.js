/* js/modal.js */
(function (global) {
  const FOCUSABLE_SELECTORS = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
  let previouslyFocusedElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    previouslyFocusedElement = document.activeElement;
    
    modal.classList.add('nl-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nl-modal-locked');

    // Focus the first focusable element or the modal container itself
    const focusable = modal.querySelectorAll(FOCUSABLE_SELECTORS);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      modal.setAttribute('tabindex', '-1');
      modal.focus();
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('novaui-modal-open', { detail: { modalId } }));
  }

  function closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('nl-open');
    modal.setAttribute('aria-hidden', 'true');
    
    // Check if other modals are still open before unlocking body
    const openModals = document.querySelectorAll('.nl-modal.nl-open');
    if (openModals.length === 0) {
      document.body.classList.remove('nl-modal-locked');
    }

    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('novaui-modal-close', { detail: { modalId: modal.id } }));
  }

  function initModals() {
    // Click events delegation
    document.addEventListener('click', (e) => {
      // Trigger click
      const trigger = e.target.closest('[data-modal-trigger]');
      if (trigger) {
        e.preventDefault();
        const targetId = trigger.getAttribute('data-modal-trigger');
        openModal(targetId);
        return;
      }

      // Close click
      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        const modal = closeBtn.closest('.nl-modal');
        closeModal(modal);
      }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      const activeModal = document.querySelector('.nl-modal.nl-open');
      if (!activeModal) return;

      // Escape to close
      if (e.key === 'Escape') {
        closeModal(activeModal);
        return;
      }

      // Focus trap (Tab)
      if (e.key === 'Tab') {
        const focusables = activeModal.querySelectorAll(FOCUSABLE_SELECTORS);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Tab backwards: if active element is the first focusable, wrap to last
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          // Tab forwards: if active element is the last focusable, wrap to first
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
  } else {
    initModals();
  }

  global.NovaModal = {
    open: openModal,
    close: closeModal,
    init: initModals
  };
})(window);
