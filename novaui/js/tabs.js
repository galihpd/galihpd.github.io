/* js/tabs.js */
(function (global) {
  function switchTab(trigger) {
    if (!trigger) return;
    const tabList = trigger.closest('[role="tablist"]');
    const tabsContainer = trigger.closest('.nl-tabs');
    if (!tabList || !tabsContainer) return;

    // Reset all triggers in this list
    const triggers = tabList.querySelectorAll('[role="tab"]');
    triggers.forEach((btn) => {
      btn.classList.remove('nl-active');
      btn.setAttribute('aria-selected', 'false');
    });

    // Set current trigger active
    trigger.classList.add('nl-active');
    trigger.setAttribute('aria-selected', 'true');

    // Get the panel target ID
    const targetId = trigger.getAttribute('aria-controls');
    
    // Hide all panel siblings under the tabs container
    const panels = tabsContainer.querySelectorAll('[role="tabpanel"]');
    panels.forEach((panel) => {
      panel.classList.remove('nl-active');
      panel.setAttribute('hidden', '');
    });

    // Show the target panel
    const targetPanel = tabsContainer.querySelector(`#${targetId}`);
    if (targetPanel) {
      targetPanel.classList.add('nl-active');
      targetPanel.removeAttribute('hidden');
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('novaui-tab-change', { detail: { trigger, targetId } }));
  }

  function initTabs() {
    // Click delegation for tabs triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[role="tab"]');
      if (trigger) {
        e.preventDefault();
        switchTab(trigger);
      }
    });

    // Keyboard navigation (left/right arrow keys) inside tab list
    document.addEventListener('keydown', (e) => {
      const activeTrigger = document.activeElement;
      if (!activeTrigger || activeTrigger.getAttribute('role') !== 'tab') return;

      const tabList = activeTrigger.closest('[role="tablist"]');
      if (!tabList) return;

      const triggers = Array.from(tabList.querySelectorAll('[role="tab"]'));
      const index = triggers.indexOf(activeTrigger);

      let nextIndex = null;
      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % triggers.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + triggers.length) % triggers.length;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        triggers[nextIndex].focus();
        switchTab(triggers[nextIndex]);
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }

  global.NovaTabs = {
    switch: switchTab,
    init: initTabs
  };
})(window);
