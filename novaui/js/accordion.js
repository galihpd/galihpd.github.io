/* js/accordion.js */
(function (global) {
  function toggleAccordion(trigger) {
    if (!trigger) return;
    const item = trigger.closest('.nl-accordion-item');
    const accordion = trigger.closest('.nl-accordion');
    if (!item || !accordion) return;

    const isOpen = item.classList.contains('nl-open');
    const isSingle = accordion.hasAttribute('data-accordion-single');

    if (isSingle && !isOpen) {
      // Close other items in the same accordion container
      const siblingItems = accordion.querySelectorAll('.nl-accordion-item');
      siblingItems.forEach((sibling) => {
        if (sibling !== item) {
          sibling.classList.remove('nl-open');
          const sibTrigger = sibling.querySelector('.nl-accordion-trigger');
          if (sibTrigger) {
            sibTrigger.setAttribute('aria-expanded', 'false');
            const content = sibling.querySelector('.nl-accordion-content');
            if (content) content.setAttribute('aria-hidden', 'true');
          }
        }
      });
    }

    // Toggle current item
    if (isOpen) {
      item.classList.remove('nl-open');
      trigger.setAttribute('aria-expanded', 'false');
      const content = item.querySelector('.nl-accordion-content');
      if (content) content.setAttribute('aria-hidden', 'true');
    } else {
      item.classList.add('nl-open');
      trigger.setAttribute('aria-expanded', 'true');
      const content = item.querySelector('.nl-accordion-content');
      if (content) content.setAttribute('aria-hidden', 'false');
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('novaui-accordion-toggle', { detail: { item, trigger, open: !isOpen } }));
  }

  function initAccordions() {
    // Click delegation for accordion triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.nl-accordion-trigger');
      if (trigger) {
        e.preventDefault();
        toggleAccordion(trigger);
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordions);
  } else {
    initAccordions();
  }

  global.NovaAccordion = {
    toggle: toggleAccordion,
    init: initAccordions
  };
})(window);
