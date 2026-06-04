/* js/command-palette.js */
(function (global) {
  let commandsList = [];
  let selectedIndex = 0;

  function registerCommands(newCommands) {
    commandsList = [...commandsList, ...newCommands];
  }

  function toggleCommandPalette() {
    const modal = document.getElementById('nl-command-palette');
    if (!modal) return;

    const isOpen = modal.classList.contains('nl-open');
    if (isOpen) {
      NovaModal.close(modal);
    } else {
      NovaModal.open('nl-command-palette');
      const input = modal.querySelector('.nl-command-input');
      if (input) {
        input.value = '';
        input.focus();
        renderFilteredResults('');
      }
    }
  }

  function renderFilteredResults(query) {
    const listContainer = document.querySelector('.nl-command-results');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const filtered = commandsList.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        (cmd.category && cmd.category.toLowerCase().includes(query.toLowerCase())) ||
        (cmd.keywords && cmd.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase())))
      );
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="nl-command-empty">No results found.</div>';
      selectedIndex = -1;
      return;
    }

    selectedIndex = 0;
    filtered.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `nl-command-item ${idx === 0 ? 'nl-active' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      item.dataset.index = idx;
      
      let html = '';
      if (cmd.category) {
        html += `<span class="nl-command-category">${cmd.category}</span>`;
      }
      html += `<span class="nl-command-title">${cmd.title}</span>`;
      if (cmd.shortcut) {
        html += `<kbd class="nl-command-shortcut">${cmd.shortcut}</kbd>`;
      }
      
      item.innerHTML = html;

      // Click behavior
      item.addEventListener('click', () => {
        executeCommand(cmd);
      });

      listContainer.appendChild(item);
    });
  }

  function executeCommand(cmd) {
    if (!cmd) return;
    
    // Close palette
    const modal = document.getElementById('nl-command-palette');
    if (modal) {
      NovaModal.close(modal);
    }

    if (typeof cmd.action === 'function') {
      cmd.action();
    } else if (cmd.href) {
      window.location.hash = cmd.href;
    }
  }

  function handleKeydown(e) {
    const modal = document.getElementById('nl-command-palette');
    if (!modal || !modal.classList.contains('nl-open')) return;

    const listContainer = modal.querySelector('.nl-command-results');
    if (!listContainer) return;

    const items = listContainer.querySelectorAll('.nl-command-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[selectedIndex].classList.remove('nl-active');
      items[selectedIndex].setAttribute('aria-selected', 'false');
      selectedIndex = (selectedIndex + 1) % items.length;
      items[selectedIndex].classList.add('nl-active');
      items[selectedIndex].setAttribute('aria-selected', 'true');
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[selectedIndex].classList.remove('nl-active');
      items[selectedIndex].setAttribute('aria-selected', 'false');
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      items[selectedIndex].classList.add('nl-active');
      items[selectedIndex].setAttribute('aria-selected', 'true');
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeItem = items[selectedIndex];
      if (activeItem) {
        // Find corresponding command in search results
        const query = modal.querySelector('.nl-command-input').value;
        const filtered = commandsList.filter((cmd) => {
          return (
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            (cmd.category && cmd.category.toLowerCase().includes(query.toLowerCase())) ||
            (cmd.keywords && cmd.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase())))
          );
        });
        const targetCommand = filtered[selectedIndex];
        executeCommand(targetCommand);
      }
    }
  }

  function initCommandPalette() {
    // Listen for Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    });

    // Delegate inputs
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('nl-command-input')) {
        renderFilteredResults(e.target.value);
      }
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPalette);
  } else {
    initCommandPalette();
  }

  global.NovaCommandPalette = {
    register: registerCommands,
    toggle: toggleCommandPalette,
    init: initCommandPalette
  };
})(window);
