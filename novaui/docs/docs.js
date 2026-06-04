/* docs/docs.js */
(function () {
  // --- UTILITY: Dynamic Page Layout Creator ---
  function getComponentIcon(name) {
    const icons = {
      "button": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m12 14 3-3-3-3M9 11h6"/></svg>`,
      "input fields": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
      "card": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>`,
      "modal & dialog": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2" ry="2"/><rect x="7" y="7" width="14" height="14" rx="2" ry="2" fill="none"/></svg>`,
      "dropdown menu": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/><polyline points="8 12 12 16 16 12"/></svg>`,
      "tooltip": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      "badge": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      "alert": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      "tabs": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 12h20M12 6v6"/></svg>`,
      "accordion": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/><polyline points="16 8 20 12 16 16"/></svg>`,
      "navbar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>`,
      "sidebar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>`,
      "table": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/></svg>`,
      "pagination": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6M4 6h16M4 18h16"/></svg>`,
      "toast": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
      "skeleton loader": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h5" stroke-dasharray="2 2"/></svg>`,
      "progress bar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="4" rx="2"/><path d="M3 12h8"/></svg>`,
      "avatar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      "breadcrumb": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
      "calendar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      "timeline": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><circle cx="12" cy="5" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="19" r="3"/></svg>`,
      "media timeline": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="2" y1="15" x2="22" y2="15"/></svg>`,
      "checkbox": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 12 11 14 15 10"/></svg>`,
      "radio": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>`,
      "toggle / switch": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3" fill="currentColor"/></svg>`,
      "select": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h11"/><polyline points="16 15 19 18 22 15"/></svg>`,
      "textarea": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
      "range / slider": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="10" cy="12" r="3" fill="currentColor"/></svg>`,
      "rating": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      "loading": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
      "stat": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      "countdown": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      "kbd": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>`,
      "steps": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><line x1="7" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="17" y2="12"/></svg>`,
      "menu": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
      "divider": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
      "join": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="8" height="8" rx="1"/><rect x="14" y="8" width="8" height="8" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
      "collapse": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="8 12 12 16 16 12"/></svg>`,
      "chat bubble": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      "stack": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="14" width="16" height="7" rx="2"/><rect x="2" y="9" width="16" height="7" rx="2"/><rect x="0" y="4" width="16" height="7" rx="2"/></svg>`,
      "diff": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
      "ai integration & agentic skills": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
    };

    return icons[name.toLowerCase()] || '';
  }

  window.switchExampleTab = function(button, type) {
    const header = button.closest('.docs-example-header');
    const card = button.closest('.docs-example-card');
    if (!header || !card) return;
    
    // Toggle active tabs
    header.querySelectorAll('.docs-example-tab-btn').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    
    // Toggle content panes
    const previewPane = card.querySelector('.docs-example-preview-pane');
    const codePane = card.querySelector('.docs-example-code-pane');
    
    if (type === 'preview') {
      previewPane.classList.add('active');
      codePane.classList.remove('active');
    } else {
      previewPane.classList.remove('active');
      codePane.classList.add('active');
    }
  };

  function renderComponentPage(title, description, examples, classesArray = [], accessibilityNotes = "", customizationGuide = "") {
    let classesTableHtml = '';
    if (classesArray && classesArray.length > 0) {
      classesTableHtml = `
        <h3 class="docs-subtitle">CSS Utility & Component Classes</h3>
        <div class="nl-table-container docs-table">
          <table class="nl-table nl-table-striped">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${classesArray.map(item => `
                <tr>
                  <td><code>${item.name}</code></td>
                  <td>${item.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    let a11yHtml = '';
    if (accessibilityNotes) {
      a11yHtml = `
        <h3 class="docs-subtitle">Accessibility (ARIA)</h3>
        <div class="nl-alert nl-alert-default">
          <div class="nl-alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div class="nl-alert-content">
            <p class="docs-paragraph">${accessibilityNotes}</p>
          </div>
        </div>
      `;
    }

    let customizationHtml = '';
    if (customizationGuide) {
      customizationHtml = `
        <h3 class="docs-subtitle">Customization Guide</h3>
        <p class="docs-paragraph">${customizationGuide}</p>
      `;
    }

    return `
      <div class="docs-page-container">
        <h1 class="docs-title">${getComponentIcon(title)}${title}</h1>
        <p class="docs-description">${description}</p>
        
        <h3 class="docs-subtitle">Examples</h3>
        <div class="docs-examples-list">
          ${examples.map(ex => `
            <div class="docs-example-item">
              <h4 class="docs-example-title">${ex.title}</h4>
              ${ex.desc ? `<p class="docs-example-desc">${ex.desc}</p>` : ''}
              
              <div class="docs-example-card">
                <div class="docs-example-header">
                  <div class="docs-example-tabs-list">
                    <button class="docs-example-tab-btn active" onclick="switchExampleTab(this, 'preview')">Preview</button>
                    <button class="docs-example-tab-btn" onclick="switchExampleTab(this, 'code')">HTML</button>
                  </div>
                </div>
                <div class="docs-example-content">
                  <div class="docs-example-preview-pane active">
                    ${ex.preview}
                  </div>
                  <div class="docs-example-code-pane">
                    <div class="code-block-wrapper" style="margin: 0;">
                      <div class="code-block-header" style="border-radius: 0; border-top: none; border-left: none; border-right: none;">
                        <span>HTML Markup</span>
                        <button class="copy-btn" onclick="copyCode(this)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre style="border: none; border-radius: 0; margin: 0; max-height: 24rem; overflow: auto;"><code class="html-code">${ex.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${classesTableHtml}
        ${a11yHtml}
        ${customizationHtml}
      </div>
    `;
  }

  // --- PAGES DATABASE ---
  const PAGES = {
    // 1. GETTING STARTED
    introduction: `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Nova UI CSS</h1>
      <p class="docs-description">A complete lightweight CSS framework. Built from scratch with pure HSL CSS variables, utility-first classes, and modern components.</p>
      
      <h3 class="docs-subtitle">Core Philosophy</h3>
      <p class="docs-paragraph">Unlike heavy traditional UI frameworks, Nova UI is designed around <strong>CSS variables theming</strong>. Components are declared as standard, semantically clean HTML elements with classes that hook into your theme parameters. It is highly customizable, lightweight, fast, and does not require compiling step (unless you want to use the CLI).</p>
      
      <div class="nl-grid nl-grid-cols-1 nl-md-grid-cols-2 nl-gap-4 nl-my-6">
        <div class="nl-card">
          <div class="nl-card-header">
            <h4 class="nl-card-title nl-text-base">Pure CSS Variables</h4>
            <p class="nl-card-description">HSL-defined theme properties mean you can change palettes, border radii, shadows, and spacing scales dynamically at runtime using pure CSS or Javascript.</p>
          </div>
        </div>
        <div class="nl-card">
          <div class="nl-card-header">
            <h4 class="nl-card-title nl-text-base">Accessibility Out of Box</h4>
            <p class="nl-card-description">Pre-configured keyboard navigation hooks, ARIA attribute states, and visual focus indicators ensure elements conform to WCAG contrast and behavior regulations.</p>
          </div>
        </div>
      </div>
      
      <h3 class="docs-subtitle">Main Features</h3>
      <ul class="docs-list">
        <li class="docs-list-item"><strong>No Preprocessors Needed:</strong> Just link the compiled CSS, no Sass or Tailwind compiler required.</li>
        <li class="docs-list-item"><strong>Developer Experience:</strong> Simple, self-documenting naming convention standard across both utilities and components.</li>
        <li class="docs-list-item"><strong>Vercel Style Aesthetics:</strong> Crisp borders, minimalist typography, subtle animations, and glassmorphic overlays.</li>
        <li class="docs-list-item"><strong>Interactive Systems:</strong> Expandable list modules, active dropdown toggling, and dialog focus trapping.</li>
      </ul>
    `,

    installation: `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v16M19 11l-7 7-7-7M2 22h20"/></svg>Installation Guide</h1>
      <p class="docs-description">Get up and running with Nova UI in less than a minute. Choose your preferred installation method below.</p>
      
      <h3 class="docs-subtitle">Method 1: CDN (easiest)</h3>
      <p class="docs-paragraph">Include the Nova UI stylesheet in the head, and the scripts bundle right before the closing body tag of your project.</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>HTML</span></div>
        <pre><code>&lt;!-- Include CSS framework --&gt;
&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/novaui/css/main.css"&gt;

&lt;!-- Include JS actions --&gt;
&lt;script src="https://cdn.jsdelivr.net/npm/novaui/js/main.js"&gt;&lt;/script&gt;</code></pre>
      </div>

      <h3 class="docs-subtitle">Method 2: NPM / Local Install</h3>
      <p class="docs-paragraph">If you are working inside a Node.js project, install the package via npm or yarn:</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>Terminal</span></div>
        <pre><code>npm install novaui</code></pre>
      </div>
      <p class="docs-paragraph">Once installed, import the main files into your project entrypoints:</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>JavaScript / CSS Import</span></div>
        <pre><code>// In your CSS/SASS entry file:
@import "novaui/css/main.css";

// In your JavaScript file:
import "novaui/js/main.js";</code></pre>
      </div>
    `,

    customization: `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>Customization</h1>
      <p class="docs-description">Nova UI is designed around CSS Custom Properties. You can customize the look and feel of the entire framework by overriding variables in your local CSS.</p>
      
      <h3 class="docs-subtitle">Overriding Themes</h3>
      <p class="docs-paragraph">Define your custom overrides in your global CSS after loading Nova UI. Colors are declared as space-separated HSL values, giving you maximum flexibility to adjust them at runtime or use transparency.</p>
      
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>CSS Override Example</span></div>
        <pre><code>:root {
  /* Override Primary Accent Color (e.g. Royal Blue) */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;

  /* Adjust border-radius globally */
  --radius-factor: 1.5; /* Makes corners rounder */
  
  /* Change default Font stack */
  --font-sans: 'Cabinet Grotesk', -apple-system, sans-serif;
}</code></pre>
      </div>

      <h3 class="docs-subtitle">Color Variable Reference</h3>
      <p class="docs-paragraph">Here are the main HSL color variables used by the framework:</p>
      <div class="nl-table-container docs-table">
        <table class="nl-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default Value</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--background</code></td>
              <td><code>0 0% 100%</code></td>
              <td>Default app body background</td>
            </tr>
            <tr>
              <td><code>--foreground</code></td>
              <td><code>240 10% 3.9%</code></td>
              <td>Default body text color</td>
            </tr>
            <tr>
              <td><code>--primary</code></td>
              <td><code>240 5.9% 10%</code></td>
              <td>Primary accents and solid button backgrounds</td>
            </tr>
            <tr>
              <td><code>--border</code></td>
              <td><code>240 5.9% 90%</code></td>
              <td>Dividers and light card borders</td>
            </tr>
            <tr>
              <td><code>--ring</code></td>
              <td><code>240 5.9% 10%</code></td>
              <td>Outline focus indicator glow rings</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,

    "cdn-cli": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>CDN & CLI Usage</h1>
      <p class="docs-description">Nova UI supports both quick CDN deployments and local CLI integrations for compiling tailored variants.</p>
      
      <h3 class="docs-subtitle">CDN Links</h3>
      <p class="docs-paragraph">Copy individual style modules if you only need a portion of the framework, rather than importing the entire bundle:</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>Individual CDN Links</span></div>
        <pre><code>&lt;!-- Just the design variables --&gt;
&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/novaui/css/core/variables.css"&gt;

&lt;!-- Just the buttons module --&gt;
&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/novaui/css/components/button.css"&gt;</code></pre>
      </div>

      <h3 class="docs-subtitle">CLI Integration Examples</h3>
      <p class="docs-paragraph">You can run our helper CLI utility script to extract custom configurations or purge unused component styles from your production HTML build.</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>CLI Commands</span></div>
        <pre><code># Extract standard Nova UI structure
npx novaui init ./my-project

# Purge unused Nova UI classes based on HTML files
npx novaui purge --content="./**/*.html" --output="./css/nama-purged.css"</code></pre>
      </div>
    `,

    "ai-integration": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>AI Integration & Agentic Skills</h1>
      <p class="docs-description">Teach your AI coding assistants (Claude Code, Cursor, Copilot, ChatGPT) about Nova UI design patterns, variables, and components.</p>
      
      <h3 class="docs-subtitle">Why Configure AI?</h3>
      <p class="docs-paragraph">AI assistants often default to generating utility classes from mainstream frameworks (like Tailwind) or outputting older code layouts. By providing your AI assistant with a custom instruction rule file or the <code>llms.txt</code> context, it will generate clean, prefix-correct Nova UI code on the first try.</p>

      <h3 class="docs-subtitle">Method 1: llms.txt (AI Documentation Feed)</h3>
      <p class="docs-paragraph">Nova UI publishes a consolidated AI-ready reference file at the project root under <a href="llms.txt" target="_blank"><strong>/llms.txt</strong></a>. Any modern AI tool can read this file directly to learn the spacing scale, color variables, and components of Nova UI.</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>URL to feed your AI</span></div>
        <pre><code>https://[your-hosted-domain]/llms.txt</code></pre>
      </div>

      <h3 class="docs-subtitle">Method 2: Cursor Custom Instructions (.cursorrules)</h3>
      <p class="docs-paragraph">If you are using Cursor, create a file named <code>.cursorrules</code> at the root of your project directory and paste the following configuration:</p>
      <div class="code-block-wrapper">
        <div class="code-block-header"><span>.cursorrules</span></div>
        <pre><code># Custom Instructions for AI in Nova UI (.cursorrules)

You are an expert AI assistant specialized in editing and using the Nova UI CSS framework.

## Key Framework Conventions
- All custom class names MUST be prefixed with \`.nl-\` (e.g., \`.nl-btn\`, \`.nl-input\`, \`.nl-flex\`).
- Styling uses HSL CSS variables (e.g., \`hsl(var(--primary))\`, \`hsl(var(--success))\`).
- Design variables are declared as space-separated HSL values (e.g., \`240 5.9% 10%\`) to support transparency.
- Spacing utilizes the spacing scale (\`--space-1\` to \`--space-10\`) representing multiples of \`0.25rem\` (4px).

## Form Control Styling Rules (CRITICAL)
- Checkboxes, radios, and toggles MUST be styled directly on native \`<input>\` elements using \`appearance: none\`.
- DO NOT generate helper graphic sibling tags (no \`.nl-checkbox-box\` or \`.nl-toggle-track\` spans).
- Custom indicators are drawn using \`::after\` transitions on the input elements directly.

## Code Generation & Editing Guidelines
1. **No Tailwind CSS**: Do not use Tailwind utility classes unless explicitly requested. Use Nova UI's built-in layout/spacing utilities.
2. **No macOS Dots**: Avoid drawing macOS-style window action dots (red, yellow, green) inside headers.</code></pre>
      </div>

      <h3 class="docs-subtitle">Method 3: Claude Code System Prompt (.claudeprompt)</h3>
      <p class="docs-paragraph">For Claude Code users, copy the text block from the <code>.cursorrules</code> section above and add it to your global <code>~/.claudeprompt</code> file or local project rules config to align Claude Code with the Nova UI framework style guidelines.</p>
    `,

    // 2. THEMING: GENERATOR
    "theme-generator": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.34241 19.4838 5.48512 20.2173 5.21532 20.8402C4.94552 21.463 4.31681 21.849 3.63665 21.7828C3.09503 21.7301 2.58045 21.5029 2.15857 21.1414"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>Theme Generator</h1>
      <p class="docs-description">Customize colors, border radii, and variables dynamically, seeing components adapt instantly, then copy the output CSS variables configuration.</p>
      
      <div class="generator-grid">
        <div class="nl-card">
          <div class="nl-card-header">
            <h3 class="nl-card-title">Theme Controls</h3>
            <p class="nl-card-description">Slide controls to build your brand styles.</p>
          </div>
          <div class="nl-card-content generator-panel">
            <div class="generator-slider-group">
              <div class="generator-slider-header">
                <span>Primary Hue</span>
                <span id="val-hue">240</span>
              </div>
              <input type="range" class="generator-slider" id="slide-hue" min="0" max="360" value="240">
            </div>

            <div class="generator-slider-group">
              <div class="generator-slider-header">
                <span>Primary Saturation</span>
                <span id="val-sat">5.9%</span>
              </div>
              <input type="range" class="generator-slider" id="slide-sat" min="0" max="100" value="6">
            </div>

            <div class="generator-slider-group">
              <div class="generator-slider-header">
                <span>Primary Lightness</span>
                <span id="val-light">10%</span>
              </div>
              <input type="range" class="generator-slider" id="slide-light" min="5" max="95" value="10">
            </div>

            <div class="generator-slider-group">
              <div class="generator-slider-header">
                <span>Border Radius Factor</span>
                <span id="val-radius">1.0</span>
              </div>
              <input type="range" class="generator-slider" id="slide-radius" min="0" max="30" value="10" step="1">
            </div>
            
            <div class="nl-flex nl-justify-between nl-items-center nl-mt-2">
              <span class="nl-text-sm nl-font-medium">Themed Component Preview:</span>
              <button class="nl-btn nl-btn-primary nl-btn-sm">Themed Button</button>
            </div>
          </div>
        </div>

        <div class="nl-card">
          <div class="nl-card-header">
            <h3 class="nl-card-title">Output Code</h3>
            <p class="nl-card-description">Copy this \`:root\` block into your local styles file.</p>
          </div>
          <div class="nl-card-content">
            <div class="code-block-wrapper" style="margin: 0; height: 100%;">
              <div class="code-block-header">
                <span>CSS Code</span>
                <button class="copy-btn" id="copy-theme-btn">Copy</button>
              </div>
              <pre style="height: 12rem; margin: 0;"><code id="theme-output-code">Loading theme config...</code></pre>
            </div>
          </div>
        </div>
      </div>
    `,

    // 3. UTILITIES: GENERATOR
    "utility-generator": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.09 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Custom Utility Generator</h1>
      <p class="docs-description">Configure a personalized scale parameters, namespaces, and download the custom-tailored utilities stylesheet block directly.</p>
      
      <div class="nl-grid nl-grid-cols-1 nl-md-grid-cols-2 nl-gap-6 nl-mt-6">
        <div class="util-generator-card nl-card">
          <h3 class="nl-text-lg nl-font-semibold">Utility Options</h3>
          
          <div class="nl-flex nl-flex-col nl-gap-1.5">
            <label class="nl-text-xs nl-font-semibold">Utility Prefix Name</label>
            <input type="text" class="nl-input" id="util-prefix" value="nl">
          </div>

          <div class="nl-flex nl-flex-col nl-gap-1.5">
            <label class="nl-text-xs nl-font-semibold">Max Grid Columns</label>
            <input type="number" class="nl-input" id="util-grid-cols" value="12" min="4" max="24">
          </div>

          <div class="nl-flex nl-flex-col nl-gap-1.5">
            <label class="nl-text-xs nl-font-semibold">Max Spacing Scale</label>
            <input type="number" class="nl-input" id="util-space-scale" value="16" min="4" max="32">
          </div>

          <button class="nl-btn nl-btn-primary" id="btn-generate-util">Generate Custom CSS</button>
        </div>

        <div class="nl-card">
          <div class="nl-card-header">
            <h4 class="nl-card-title">Tailored Styles Output</h4>
            <p class="nl-card-description">Ready-to-use CSS utilities compile instantly.</p>
          </div>
          <div class="nl-card-content">
            <div class="code-block-wrapper" style="margin:0;">
              <div class="code-block-header">
                <span>CSS Stylesheet</span>
                <button class="copy-btn" id="copy-util-btn">Copy</button>
              </div>
              <pre style="height: 18rem; margin:0;"><code id="util-output-code">Click generate...</code></pre>
            </div>
          </div>
        </div>
      </div>
    `,

    // 4. UTILITY DOCUMENTATION PAGES
    "util-layout": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Layout & Grid Utilities</h1>
      <p class="docs-description">Pre-defined styling classes for layout models: Flexbox, Grid grids, display states, element alignment, and viewport limits.</p>
      
      <h3 class="docs-subtitle">Flexbox Alignment Examples</h3>
      <p class="docs-paragraph">Align boxes side-by-side using <code>.nl-flex</code> and alignments:</p>
      <div class="example-preview-box">
        <div class="example-preview-viewport nl-flex nl-justify-between nl-items-center nl-w-full nl-border nl-p-4 nl-rounded-lg">
          <div class="nl-p-3 nl-rounded-md" style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground));">Box 1</div>
          <div class="nl-p-3 nl-rounded-md" style="background: hsl(var(--secondary));">Box 2</div>
          <div class="nl-p-3 nl-rounded-md" style="background: hsl(var(--muted));">Box 3</div>
        </div>
      </div>

      <h3 class="docs-subtitle">Responsive Grid (3 Columns)</h3>
      <p class="docs-paragraph">Grid layouts split elements based on container widths, shifting to single columns on mobile viewports automatically:</p>
      <div class="example-preview-box">
        <div class="example-preview-viewport nl-grid nl-grid-cols-1 nl-md-grid-cols-3 nl-gap-4 nl-w-full">
          <div class="nl-p-6 nl-border nl-rounded-lg nl-text-center">Grid Block 1</div>
          <div class="nl-p-6 nl-border nl-rounded-lg nl-text-center">Grid Block 2</div>
          <div class="nl-p-6 nl-border nl-rounded-lg nl-text-center">Grid Block 3</div>
        </div>
      </div>

      <h3 class="docs-subtitle">Layout Classes Table</h3>
      <div class="nl-table-container docs-table">
        <table class="nl-table nl-table-striped">
          <thead>
            <tr><th>Class</th><th>Rules Applied</th></tr>
          </thead>
          <tbody>
            <tr><td><code>.nl-container</code></td><td><code>width: 100%; margin: 0 auto; responsive max-width. Padding scales automatically (16px to 40px) via <code>--container-padding</code>.</code></td></tr>
            <tr><td><code>.nl-container-[size]</code></td><td><code>Locks max-width to a specific breakpoint (sm, md, lg, xl) regardless of screen size.</code></td></tr>
            <tr><td><code>.nl-container-fluid</code></td><td><code>Fluid width (100%) with responsive padding scales.</code></td></tr>
            <tr><td><code>.nl-flex</code></td><td><code>display: flex;</code></td></tr>
            <tr><td><code>.nl-flex-col</code></td><td><code>flex-direction: column;</code></td></tr>
            <tr><td><code>.nl-justify-between</code></td><td><code>justify-content: space-between;</code></td></tr>
            <tr><td><code>.nl-items-center</code></td><td><code>align-items: center;</code></td></tr>
            <tr><td><code>.nl-grid</code></td><td><code>display: grid;</code></td></tr>
            <tr><td><code>.nl-grid-cols-3</code></td><td><code>grid-template-columns: repeat(3, minmax(0, 1fr));</code></td></tr>
            <tr><td><code>.nl-gap-4</code></td><td><code>gap: var(--space-4); /* 16px */</code></td></tr>
          </tbody>
        </table>
      </div>
    `,

    "util-spacing": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18M19 3v18M2 5h20M2 19h20M2 12h20"/></svg>Spacing Utilities</h1>
      <p class="docs-description">Control margins and paddings using standard sizing scale increments from 0 to 16, representing values from 0px to 64px.</p>
      
      <h3 class="docs-subtitle">Padding & Margin Visualizer</h3>
      <p class="docs-paragraph">The green outer boundaries represent padding offsets (<code>.nl-p-6</code>), while gray blocks are separated by margins (<code>.nl-gap-4</code>).</p>
      <div class="example-preview-box">
        <div class="example-preview-viewport nl-flex nl-flex-col nl-gap-3 nl-w-full">
          <div class="nl-p-6 nl-border nl-rounded-lg" style="background-color: hsla(var(--primary) / 0.05);">
            <div class="nl-p-3 nl-rounded-md" style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); text-align: center;">
              This inner container has .nl-p-6 wrapper padding.
            </div>
          </div>
        </div>
      </div>

      <h3 class="docs-subtitle">Class Naming Formula</h3>
      <p class="docs-paragraph">Spacing classes follow a straightforward prefix formula: <code>nl-[property][side]-[scale]</code></p>
      <ul class="docs-list">
        <li class="docs-list-item"><strong>Property:</strong> <code>p</code> for padding, <code>m</code> for margin</li>
        <li class="docs-list-item"><strong>Side (Optional):</strong> <code>t</code> (top), <code>r</code> (right), <code>b</code> (bottom), <code>l</code> (left), <code>x</code> (left + right), <code>y</code> (top + bottom)</li>
        <li class="docs-list-item"><strong>Scale:</strong> <code>0</code> (0px), <code>1</code> (4px), <code>2</code> (8px), <code>3</code> (12px), <code>4</code> (16px), <code>5</code> (20px), <code>6</code> (24px), <code>8</code> (32px), <code>10</code> (40px), <code>12</code> (48px), <code>16</code> (64px)</li>
      </ul>
    `,

    "util-typography": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>Typography Utilities</h1>
      <p class="docs-description">Scale font sizes, font weights, leading line-heights, alignments, and colors dynamically using utilities.</p>
      
      <h3 class="docs-subtitle">Font Family Stacks</h3>
      <p class="docs-paragraph">Nova UI defines three major font family stacks using CSS custom properties (variables) in <code>variables.css</code>. They are loaded from Google Fonts in the document head:</p>
      
      <table class="nl-table docs-table">
        <thead>
          <tr>
            <th>CSS Variable</th>
            <th>Default Font Family Stack</th>
            <th>Primary Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>--font-sans</code></td>
            <td><code>'Plus Jakarta Sans', 'Inter', system-ui, sans-serif</code></td>
            <td>Body copy, buttons, labels, inputs, dropdown list text.</td>
          </tr>
          <tr>
            <td><code>--font-heading</code></td>
            <td><code>'Outfit', 'Inter', system-ui, sans-serif</code></td>
            <td>All heading levels (<code>h1</code> through <code>h6</code>), main titles, card titles.</td>
          </tr>
          <tr>
            <td><code>--font-mono</code></td>
            <td><code>'Fira Code', ui-monospace, SFMono-Regular, monospace</code></td>
            <td>Inline code snippets, code block pre tags, timecode labels, shortcuts.</td>
          </tr>
        </tbody>
      </table>

      <h3 class="docs-subtitle">Sizing & Weighting Previews</h3>
      <div class="example-preview-box">
        <div class="example-preview-viewport nl-flex nl-flex-col nl-gap-2 nl-items-start nl-w-full">
          <h1 class="nl-text-4xl nl-font-bold">H1 Header Bold (.nl-text-4xl)</h1>
          <h2 class="nl-text-2xl nl-font-semibold">H2 Subheading Semibold (.nl-text-2xl)</h2>
          <p class="nl-text-base nl-font-normal nl-text-muted">Standard description paragraph text styling. (.nl-text-base .nl-text-muted)</p>
          <p class="nl-text-xs nl-uppercase nl-font-medium nl-text-destructive">Small Warning Alert Label (.nl-text-xs .nl-uppercase .nl-text-destructive)</p>
        </div>
      </div>

      <h3 class="docs-subtitle">Font Weights</h3>
      <p class="docs-paragraph">You can adjust the boldness of text using the following utility classes:</p>
      
      <table class="nl-table docs-table">
        <thead>
          <tr>
            <th>Class Modifier</th>
            <th>CSS Variable Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>.nl-font-normal</code></td>
            <td><code>--font-normal</code> (400)</td>
            <td>Default standard body text weight.</td>
          </tr>
          <tr>
            <td><code>.nl-font-medium</code></td>
            <td><code>--font-medium</code> (500)</td>
            <td>Medium emphasis weight used for UI controls and triggers.</td>
          </tr>
          <tr>
            <td><code>.nl-font-semibold</code></td>
            <td><code>--font-semibold</code> (600)</td>
            <td>Semi-bold weight for subheadings, dropdown headers, and small titles.</td>
          </tr>
          <tr>
            <td><code>.nl-font-bold</code></td>
            <td><code>--font-bold</code> (700)</td>
            <td>Extra bold weight for primary headers, alerts, and major titles.</td>
          </tr>
        </tbody>
      </table>
    `,

    "util-borders": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 9H3M21 15H3M12 3v18"/></svg>Borders & Shadows</h1>
      <p class="docs-description">Control border thickness, border colors, rounding corners, and box-shadow heights instantly.</p>
      
      <h3 class="docs-subtitle">Shadow Depth Levels</h3>
      <div class="example-preview-box">
        <div class="example-preview-viewport nl-flex nl-gap-6 nl-justify-center nl-w-full">
          <div class="nl-p-6 nl-rounded-lg nl-border nl-shadow-sm" style="background-color: hsl(var(--card));">Shadow SM</div>
          <div class="nl-p-6 nl-rounded-lg nl-border nl-shadow-md" style="background-color: hsl(var(--card));">Shadow MD</div>
          <div class="nl-p-6 nl-rounded-lg nl-border nl-shadow-lg" style="background-color: hsl(var(--card));">Shadow LG</div>
        </div>
      </div>

      <h3 class="docs-subtitle">Corner Radius Scales</h3>
      <div class="example-preview-box">
        <div class="example-preview-viewport nl-flex nl-gap-4 nl-justify-center nl-w-full">
          <div class="nl-p-4 nl-border nl-rounded-sm">Rounded SM</div>
          <div class="nl-p-4 nl-border nl-rounded-md">Rounded MD</div>
          <div class="nl-p-4 nl-border nl-rounded-lg">Rounded LG</div>
          <div class="nl-p-4 nl-border nl-rounded-xl">Rounded XL</div>
          <div class="nl-p-4 nl-border nl-rounded-full">Rounded Full</div>
        </div>
      </div>
    `,

    "util-animations": `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>Animations Utilities</h1>
      <p class="docs-description">Pre-configured keyframes for dynamic loading indicators, entrance transitions, and pulsing loaders.</p>
      
      <h3 class="docs-subtitle">Entrance Animations</h3>
      <p class="docs-paragraph">Click the buttons below to trigger respective animations in the box below:</p>
      
      <div class="example-preview-box">
        <div class="example-preview-header">
          <div class="nl-flex nl-gap-2">
            <button class="nl-btn nl-btn-outline nl-btn-sm" onclick="triggerAnimationDemo('fade')">Trigger Fade In</button>
            <button class="nl-btn nl-btn-outline nl-btn-sm" onclick="triggerAnimationDemo('slide')">Trigger Slide Up</button>
            <button class="nl-btn nl-btn-outline nl-btn-sm" onclick="triggerAnimationDemo('scale')">Trigger Scale In</button>
          </div>
        </div>
        <div class="example-preview-viewport">
          <div id="animation-demo-target" class="nl-p-8 nl-rounded-xl nl-border nl-text-center nl-font-semibold" style="width: 15rem; background: hsl(var(--card));">
            Animation Target Box
          </div>
        </div>
      </div>
    `,

    // 5. PLAYGROUND
    playground: `
      <h1 class="docs-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="4" x2="12" y2="20"/></svg>Component Playground</h1>
      <p class="docs-description">Write custom Nova UI HTML markup below, combine component classes and utility modifiers, and inspect the rendered composition in real-time.</p>
      
      <div class="nl-flex nl-gap-2 nl-mb-4">
        <button class="nl-btn nl-btn-secondary nl-btn-sm" onclick="loadPlaygroundTemplate('button')">Load Button Variant</button>
        <button class="nl-btn nl-btn-secondary nl-btn-sm" onclick="loadPlaygroundTemplate('card')">Load Login Card</button>
        <button class="nl-btn nl-btn-secondary nl-btn-sm" onclick="loadPlaygroundTemplate('form')">Load Profile Form</button>
      </div>

      <div class="playground-editor-container">
        <textarea class="playground-textarea" id="playground-code-input" placeholder="Type Nova UI classes here..."></textarea>
        <div class="playground-preview-pane">
          <div id="playground-render-mount" style="padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; gap: 1rem;">
            <!-- Rendered Output -->
          </div>
        </div>
      </div>
    `
  };

  // --- POPULATING COMPONENT PAGES VIA META SYSTEM ---
  // Button
  PAGES.button = renderComponentPage(
    "Button",
    "Triggers actions when clicked. Supports multiple variants, sizes, and states.",
    [
      {
        title: "Default & Brand Variants",
        desc: "Solid primary, secondary, and outline buttons for primary action hierarchies.",
        preview: `<button class="nl-btn nl-btn-primary">Primary</button>\n<button class="nl-btn nl-btn-secondary">Secondary</button>\n<button class="nl-btn nl-btn-outline">Outline</button>`,
        code: `<button class="nl-btn nl-btn-primary">Primary</button>\n<button class="nl-btn nl-btn-secondary">Secondary</button>\n<button class="nl-btn nl-btn-outline">Outline</button>`
      },
      {
        title: "Semantic & Link Variants",
        desc: "Success, destructive warning, ghost, and link accent buttons.",
        preview: `<button class="nl-btn nl-btn-success">Success</button>\n<button class="nl-btn nl-btn-destructive">Destructive</button>\n<button class="nl-btn nl-btn-ghost">Ghost</button>\n<button class="nl-btn nl-btn-link">Link Accent</button>`,
        code: `<button class="nl-btn nl-btn-success">Success</button>\n<button class="nl-btn nl-btn-destructive">Destructive</button>\n<button class="nl-btn nl-btn-ghost">Ghost</button>\n<button class="nl-btn nl-btn-link">Link Accent</button>`
      },
      {
        title: "Sizing Modifiers",
        desc: "Sizing presets from tiny to large scale.",
        preview: `<button class="nl-btn nl-btn-primary nl-btn-xs">Tiny Button</button>\n<button class="nl-btn nl-btn-primary nl-btn-sm">Small Button</button>\n<button class="nl-btn nl-btn-primary">Medium (Default)</button>\n<button class="nl-btn nl-btn-primary nl-btn-lg">Large Button</button>`,
        code: `<button class="nl-btn nl-btn-primary nl-btn-xs">Tiny Button</button>\n<button class="nl-btn nl-btn-primary nl-btn-sm">Small Button</button>\n<button class="nl-btn nl-btn-primary">Medium (Default)</button>\n<button class="nl-btn nl-btn-primary nl-btn-lg">Large Button</button>`
      }
    ],
    [
      { name: ".nl-btn", desc: "Base button structure styling padding and alignment." },
      { name: ".nl-btn-primary", desc: "Solid primary theme color variant." },
      { name: ".nl-btn-secondary", desc: "Muted secondary background variant." },
      { name: ".nl-btn-outline", desc: "Border button style with transparent hover background." },
      { name: ".nl-btn-ghost", desc: "Text button with accent background highlight on cursor hover." },
      { name: ".nl-btn-link", desc: "Underlined anchor button style." },
      { name: ".nl-btn-destructive", desc: "Warning destructive red variant." },
      { name: ".nl-btn-success", desc: "Positive success green variant." },
      { name: ".nl-btn-xs / .nl-btn-sm / .nl-btn-lg", desc: "Tiny (26px), Small (32px), and Large (48px) sizing modifiers." }
    ],
    "Buttons should include an <code>aria-label</code> if containing only icon contents to identify the action. Set <code>disabled</code> property to freeze triggers.",
    "Adjust size heights, padding values, and hover transitions in <code>/css/components/button.css</code>."
  );

  // Input
  PAGES.input = renderComponentPage(
    "Input Fields",
    "Cover text entries, textareas, selects, custom checkboxes, radio groups, and iOS-style switch toggles.",
    [
      {
        title: "Text & Select Inputs",
        desc: "Standard form elements for user text and dropdown lists options.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-3 nl-w-full" style="max-width: 20rem;">\n  <div>\n    <label class="nl-text-xs nl-font-semibold nl-mb-1 nl-block">Full Name</label>\n    <input type="text" class="nl-input" placeholder="John Doe">\n  </div>\n  <div>\n    <label class="nl-text-xs nl-font-semibold nl-mb-1 nl-block">City Location</label>\n    <select class="nl-select">\n      <option>Jakarta, Indonesia</option>\n      <option>Tokyo, Japan</option>\n      <option>San Francisco, USA</option>\n    </select>\n  </div>\n</div>`,
        code: `<div class="nl-flex nl-flex-col nl-gap-3 nl-w-full" style="max-width: 20rem;">\n  <div>\n    <label class="nl-text-xs nl-font-semibold nl-mb-1 nl-block">Full Name</label>\n    <input type="text" class="nl-input" placeholder="John Doe">\n  </div>\n  <div>\n    <label class="nl-text-xs nl-font-semibold nl-mb-1 nl-block">City Location</label>\n    <select class="nl-select">\n      <option>Jakarta, Indonesia</option>\n      <option>Tokyo, Japan</option>\n      <option>San Francisco, USA</option>\n    </select>\n  </div>\n</div>`
      },
      {
        title: "Checkbox & iOS Switch",
        desc: "Interactive selectors for Boolean checks and system toggles.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-3 nl-w-full" style="max-width: 20rem;">\n  <label class="nl-checkbox-label">\n    <input type="checkbox" class="nl-checkbox" checked>\n    <span>Accept Terms & Conditions</span>\n  </label>\n  <label class="nl-toggle-label">\n    <input type="checkbox" class="nl-toggle">\n    <span>Enable Notifications</span>\n  </label>\n</div>`,
        code: `<div class="nl-flex nl-flex-col nl-gap-3 nl-w-full" style="max-width: 20rem;">\n  <label class="nl-checkbox-label">\n    <input type="checkbox" class="nl-checkbox" checked>\n    <span>Accept Terms & Conditions</span>\n  </label>\n  <label class="nl-toggle-label">\n    <input type="checkbox" class="nl-toggle">\n    <span>Enable Notifications</span>\n  </label>\n</div>`
      }
    ],
    [
      { name: ".nl-input", desc: "Text input box with customizable border variables." },
      { name: ".nl-textarea", desc: "Textarea input box supporting vertical resizing." },
      { name: ".nl-select", desc: "Select input list containing a built-in clean drop indicator arrow." },
      { name: ".nl-checkbox", desc: "Directly styled native checkbox using CSS pseudo-elements." },
      { name: ".nl-toggle", desc: "Directly styled checkbox rendering as an iOS-style toggle switch." },
      { name: ".nl-checkbox-label", desc: "Flex wrapper layout pairing a checkbox input with label text." },
      { name: ".nl-toggle-label", desc: "Flex wrapper layout pairing a toggle input with label text." }
    ],
    "Input tags must bind to corresponding labels using matching IDs/attributes or wrapped inside label wrappers to expose target selectors to screen readers.",
    "Customize borders, outline focus halos, and checkboxes fills inside <code>/css/components/input.css</code>."
  );

  // Card
  PAGES.card = renderComponentPage(
    "Card",
    "Structures layout flows grouping information, action panels, and features blocks.",
    [
      {
        title: "Standard Content Card",
        desc: "Card grouping with headers, titles, contents, and clear footer boundaries.",
        preview: `<div class="nl-card" style="width: 24rem;">\n  <div class="nl-card-header">\n    <h3 class="nl-card-title">Setup Account</h3>\n    <p class="nl-card-description">Create a password and save credentials below.</p>\n  </div>\n  <div class="nl-card-content">\n    <div class="nl-flex nl-flex-col nl-gap-3">\n      <input type="email" class="nl-input" placeholder="email@example.com">\n      <input type="password" class="nl-input" placeholder="Create password">\n    </div>\n  </div>\n  <div class="nl-card-footer">\n    <button class="nl-btn nl-btn-primary nl-w-full">Create Account</button>\n  </div>\n</div>`,
        code: `<div class="nl-card" style="width: 24rem;">\n  <div class="nl-card-header">\n    <h3 class="nl-card-title">Setup Account</h3>\n    <p class="nl-card-description">Create a password and save credentials below.</p>\n  </div>\n  <div class="nl-card-content">\n    <div class="nl-flex nl-flex-col nl-gap-3">\n      <input type="email" class="nl-input" placeholder="email@example.com">\n      <input type="password" class="nl-input" placeholder="Create password">\n    </div>\n  </div>\n  <div class="nl-card-footer">\n    <button class="nl-btn nl-btn-primary nl-w-full">Create Account</button>\n  </div>\n</div>`
      },
      {
        title: "Hover Lift Card",
        desc: "Card variant that visually lifts and expands its shadow on mouse hover.",
        preview: `<div class="nl-card nl-card-hover" style="width: 20rem; cursor: pointer;">\n  <div class="nl-card-header">\n    <h3 class="nl-card-title nl-text-lg">Hover Card</h3>\n    <p class="nl-card-description">Lifts on mouse hover.</p>\n  </div>\n  <div class="nl-card-content">\n    <p class="docs-paragraph" style="margin:0;">This card lifts upwards and expands its shadow drop on mouse hover to indicate clickability.</p>\n  </div>\n</div>`,
        code: `<div class="nl-card nl-card-hover" style="width: 20rem; cursor: pointer;">\n  <div class="nl-card-header">\n    <h3 class="nl-card-title nl-text-lg">Hover Card</h3>\n    <p class="nl-card-description">Lifts on mouse hover.</p>\n  </div>\n  <div class="nl-card-content">\n    <p class="docs-paragraph" style="margin:0;">This card lifts upwards and expands its shadow drop on mouse hover to indicate clickability.</p>\n  </div>\n</div>`
      },
      {
        title: "Interactive Card",
        desc: "Card utilizing layout controls (progress bar, badge tag, link buttons, and tiny button size variations).",
        preview: `<div class="nl-card" style="width: 20rem;">\n  <div class="nl-card-header">\n    <h3 class="nl-card-title nl-text-lg">Interactive Card</h3>\n    <p class="nl-card-description">With link and badge indicators.</p>\n  </div>\n  <div class="nl-card-content nl-flex nl-flex-col nl-gap-3">\n    <div class="nl-flex nl-justify-between nl-items-center">\n      <span class="nl-text-sm">Milestone Status:</span>\n      <span class="nl-badge nl-badge-success">On Track</span>\n    </div>\n    <div class="nl-progress nl-progress-success">\n      <div class="nl-progress-value" style="width: 65%;"></div>\n    </div>\n  </div>\n  <div class="nl-card-footer nl-justify-between">\n    <a href="#/docs/card" class="nl-btn nl-btn-link">View details</a>\n    <button class="nl-btn nl-btn-primary nl-btn-xs">Join</button>\n  </div>\n</div>`,
        code: `<div class="nl-card" style="width: 20rem;">\n  <div class="nl-card-header">\n    <h3 class="nl-card-title nl-text-lg">Interactive Card</h3>\n    <p class="nl-card-description">With link and badge indicators.</p>\n  </div>\n  <div class="nl-card-content nl-flex nl-flex-col nl-gap-3">\n    <div class="nl-flex nl-justify-between nl-items-center">\n      <span class="nl-text-sm">Milestone Status:</span>\n      <span class="nl-badge nl-badge-success">On Track</span>\n    </div>\n    <div class="nl-progress nl-progress-success">\n      <div class="nl-progress-value" style="width: 65%;"></div>\n    </div>\n  </div>\n  <div class="nl-card-footer nl-justify-between">\n    <a href="#/docs/card" class="nl-btn nl-btn-link">View details</a>\n    <button class="nl-btn nl-btn-primary nl-btn-xs">Join</button>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-card", desc: "Base card background containing shadow depths and border radius." },
      { name: ".nl-card-hover", desc: "Modifying card layout class to animate translation lifts and drop-shadows on hover." },
      { name: ".nl-card-header", desc: "Top header block spacing titles and description tags." },
      { name: ".nl-card-title", desc: "Bold title heading." },
      { name: ".nl-card-description", desc: "Muted small description paragraph." },
      { name: ".nl-card-content", desc: "Main content body spacing margins." },
      { name: ".nl-card-footer", desc: "Footer block styling action triggers alignments." }
    ]
  );

  // Modal
  PAGES.modal = renderComponentPage(
    "Modal & Dialog",
    "Overlays a focused content dialog box over the screen, blocking document scrolling.",
    [
      {
        title: "Dialogue Box Overlay",
        desc: "Pop-up overlay with dynamic triggering controls and focus trapping capabilities.",
        preview: `<button class="nl-btn nl-btn-primary" data-modal-trigger="demo-modal">Open Dialogue Modal</button>\n\n<div id="demo-modal" class="nl-modal" aria-hidden="true" role="dialog">\n  <div class="nl-modal-backdrop" data-modal-close></div>\n  <div class="nl-modal-content">\n    <button class="nl-modal-close" data-modal-close aria-label="Close modal">&times;</button>\n    <div class="nl-modal-header">\n      <h4 class="nl-modal-title">Delete Project</h4>\n      <p class="nl-modal-description">This action is permanent and cannot be undone.</p>\n    </div>\n    <div class="nl-modal-body">\n      <p class="docs-paragraph" style="margin:0;">Are you sure you want to delete this repository? All active builds, environments, and deployments will be disconnected.</p>\n    </div>\n    <div class="nl-modal-footer">\n      <button class="nl-btn nl-btn-outline" data-modal-close>Cancel</button>\n      <button class="nl-btn nl-btn-destructive" onclick="NovaToast.show({title:\'Project Deleted\', variant:\'destructive\'}); NovaModal.close(document.getElementById(\'demo-modal\'))">Delete Repos</button>\n    </div>\n  </div>\n</div>`,
        code: `<button class="nl-btn nl-btn-primary" data-modal-trigger="demo-modal">Open Dialogue Modal</button>\n\n<div id="demo-modal" class="nl-modal" aria-hidden="true" role="dialog">\n  <div class="nl-modal-backdrop" data-modal-close></div>\n  <div class="nl-modal-content">\n    <button class="nl-modal-close" data-modal-close aria-label="Close modal">&times;</button>\n    <div class="nl-modal-header">\n      <h4 class="nl-modal-title">Delete Project</h4>\n      <p class="nl-modal-description">This action is permanent and cannot be undone.</p>\n    </div>\n    <div class="nl-modal-body">\n      <p class="docs-paragraph" style="margin:0;">Are you sure you want to delete this repository? All active builds, environments, and deployments will be disconnected.</p>\n    </div>\n    <div class="nl-modal-footer">\n      <button class="nl-btn nl-btn-outline" data-modal-close>Cancel</button>\n      <button class="nl-btn nl-btn-destructive" onclick="NovaToast.show({title:\'Project Deleted\', variant:\'destructive\'}); NovaModal.close(document.getElementById(\'demo-modal\'))">Delete Repos</button>\n    </div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-modal", desc: "Fixed full-viewport overlay dialog container." },
      { name: ".nl-modal-backdrop", desc: "Glassmorphic overlay backdrop backing clicks to close." },
      { name: ".nl-modal-content", desc: "Centered dialog card containing scale animations." },
      { name: ".nl-modal-close", desc: "Close selector button positioning in the top right." }
    ],
    "When modals are shown, keyboard focus is trapped inside the content. Clicking Esc or clicking backdrops auto-closes. Body scrolling locks via <code>.nl-modal-locked</code>."
  );

  // Dropdown
  PAGES.dropdown = renderComponentPage(
    "Dropdown Menu",
    "Toggles list selectors when clicking triggers, closing automatically when clicking outside.",
    [
      {
        title: "Actions Context Menu",
        desc: "Relative trigger context lists matching layout settings.",
        preview: `<div class="nl-dropdown">\n  <button class="nl-btn nl-btn-outline nl-dropdown-trigger" aria-haspopup="true" aria-expanded="false">\n    <span>Manage Accounts</span>\n    <span style="font-size: 8px; margin-left: 6px;">▼</span>\n  </button>\n  <div class="nl-dropdown-menu" role="menu">\n    <div class="nl-dropdown-header">Actions</div>\n    <button class="nl-dropdown-item" onclick="NovaToast.show({title:\'Profile Clicked\', description:\'User details will load.\'})">Profile Settings</button>\n    <button class="nl-dropdown-item" onclick="NovaToast.show({title:\'Billing Clicked\'})">Billing Info</button>\n    <div class="nl-dropdown-divider"></div>\n    <button class="nl-dropdown-item nl-text-destructive" onclick="NovaToast.show({title:\'Logged out\', variant:\'destructive\'})">Logout Session</button>\n  </div>\n</div>`,
        code: `<div class="nl-dropdown">\n  <button class="nl-btn nl-btn-outline nl-dropdown-trigger" aria-haspopup="true" aria-expanded="false">\n    <span>Manage Accounts</span>\n    <span style="font-size: 8px; margin-left: 6px;">▼</span>\n  </button>\n  <div class="nl-dropdown-menu" role="menu">\n    <div class="nl-dropdown-header">Actions</div>\n    <button class="nl-dropdown-item" onclick="NovaToast.show({title:\'Profile Clicked\', description:\'User details will load.\'})">Profile Settings</button>\n    <button class="nl-dropdown-item" onclick="NovaToast.show({title:\'Billing Clicked\'})">Billing Info</button>\n    <div class="nl-dropdown-divider"></div>\n    <button class="nl-dropdown-item nl-text-destructive" onclick="NovaToast.show({title:\'Logged out\', variant:\'destructive\'})">Logout Session</button>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-dropdown", desc: "Relative wrapper container parent." },
      { name: ".nl-dropdown-trigger", desc: "Trigger button toggling visibility on click." },
      { name: ".nl-dropdown-menu", desc: "Absolute positioned items container with scaling entries." },
      { name: ".nl-dropdown-item", desc: "Selectable items styled with hover colors." },
      { name: ".nl-dropdown-divider", desc: "Horizontal separation border." }
    ]
  );

  // Tooltip
  PAGES.tooltip = renderComponentPage(
    "Tooltip",
    "Hover-activated popups to display contextual descriptions without JS overhead.",
    [
      {
        title: "Tooltip Directions",
        desc: "CSS-only hover alignment options: top, bottom, left, right.",
        preview: `<div class="nl-flex nl-gap-4 nl-justify-center nl-w-full">\n  <button class="nl-btn nl-btn-outline" data-tooltip="Default top tooltip">Hover Top</button>\n  <button class="nl-btn nl-btn-outline" data-tooltip="Bottom alignment tooltip" data-tooltip-position="bottom">Hover Bottom</button>\n  <button class="nl-btn nl-btn-outline" data-tooltip="Left alignment tooltip" data-tooltip-position="left">Hover Left</button>\n  <button class="nl-btn nl-btn-outline" data-tooltip="Right alignment tooltip" data-tooltip-position="right">Hover Right</button>\n</div>`,
        code: `<div class="nl-flex nl-gap-4 nl-justify-center nl-w-full">\n  <button class="nl-btn nl-btn-outline" data-tooltip="Default top tooltip">Hover Top</button>\n  <button class="nl-btn nl-btn-outline" data-tooltip="Bottom alignment tooltip" data-tooltip-position="bottom">Hover Bottom</button>\n  <button class="nl-btn nl-btn-outline" data-tooltip="Left alignment tooltip" data-tooltip-position="left">Hover Left</button>\n  <button class="nl-btn nl-btn-outline" data-tooltip="Right alignment tooltip" data-tooltip-position="right">Hover Right</button>\n</div>`
      }
    ],
    [
      { name: "[data-tooltip]", desc: "Attribute containing text description content." },
      { name: "[data-tooltip-position]", desc: "Sets alignment directions (top, bottom, left, right)." }
    ]
  );

  // Badge
  PAGES.badge = renderComponentPage(
    "Badge",
    "Small label tags to represent category badges, pill tags, and states status.",
    [
      {
        title: "Badge Variants",
        desc: "Fills, borders, and color variants to display labels status.",
        preview: `<div class="nl-flex nl-gap-2">\n  <span class="nl-badge nl-badge-default">Default</span>\n  <span class="nl-badge nl-badge-secondary">Secondary</span>\n  <span class="nl-badge nl-badge-outline">Outline</span>\n  <span class="nl-badge nl-badge-destructive">Destructive</span>\n  <span class="nl-badge nl-badge-success">Success</span>\n</div>`,
        code: `<div class="nl-flex nl-gap-2">\n  <span class="nl-badge nl-badge-default">Default</span>\n  <span class="nl-badge nl-badge-secondary">Secondary</span>\n  <span class="nl-badge nl-badge-outline">Outline</span>\n  <span class="nl-badge nl-badge-destructive">Destructive</span>\n  <span class="nl-badge nl-badge-success">Success</span>\n</div>`
      }
    ],
    [
      { name: ".nl-badge", desc: "Base badge layout structure containing rounded full caps." },
      { name: ".nl-badge-default", desc: "Theme primary background fill." },
      { name: ".nl-badge-secondary", desc: "Secondary gray scale background fill." },
      { name: ".nl-badge-outline", desc: "Border border outline theme variant." }
    ]
  );

  // Indicator
  PAGES.indicator = renderComponentPage(
    "Indicator",
    "Places elements (such as notification dots, badges, or buttons) on the corners/edges/center of another element.",
    [
      {
        title: "Basic Notification Badge",
        desc: "An indicator-item placed at the default top-right corner to show notification counts or alerts on a button.",
        preview: `<div class="nl-flex nl-gap-6 nl-items-center">\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-badge nl-badge-destructive" style="font-size: 9px; padding: 0 var(--space-1.5); height: 1.25rem; min-width: 1.25rem; display: flex; align-items: center; justify-content: center;">99+</span>\n    <button class="nl-btn nl-btn-secondary">Messages</button>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item" style="width: 8px; height: 8px; background-color: hsl(var(--destructive)); border-radius: var(--radius-full); border: 2px solid hsl(var(--card));"></span>\n    <button class="nl-btn nl-btn-outline nl-btn-sm">Inbox</button>\n  </div>\n</div>`,
        code: `<div class="nl-indicator">\n  <span class="nl-indicator-item nl-badge nl-badge-destructive">99+</span>\n  <button class="nl-btn nl-btn-secondary">Messages</button>\n</div>\n\n<div class="nl-indicator">\n  <span class="nl-indicator-item" style="width: 8px; height: 8px; background-color: hsl(var(--destructive)); border-radius: var(--radius-full); border: 2px solid hsl(var(--card));"></span>\n  <button class="nl-btn nl-btn-outline nl-btn-sm">Inbox</button>\n</div>`
      },
      {
        title: "Avatar Status Dots",
        desc: "Using the indicator component to show an online/offline badge or dot at the bottom-right corner of an avatar component.",
        preview: `<div class="nl-flex nl-gap-4">\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-bottom nl-indicator-end" style="width: 10px; height: 10px; background-color: hsl(var(--success)); border-radius: var(--radius-full); border: 2px solid hsl(var(--card));"></span>\n    <div class="nl-avatar">\n      <span class="nl-avatar-initials" style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); width: 2.5rem; height: 2.5rem; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); font-weight: var(--font-bold);">JD</span>\n    </div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-bottom nl-indicator-end" style="width: 10px; height: 10px; background-color: hsl(var(--muted-foreground)); border-radius: var(--radius-full); border: 2px solid hsl(var(--card));"></span>\n    <div class="nl-avatar">\n      <span class="nl-avatar-initials" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); width: 2.5rem; height: 2.5rem; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); font-weight: var(--font-bold);">AS</span>\n    </div>\n  </div>\n</div>`,
        code: `<div class="nl-indicator">\n  <span class="nl-indicator-item nl-indicator-bottom nl-indicator-end" style="width: 10px; height: 10px; background-color: hsl(var(--success)); border-radius: var(--radius-full); border: 2px solid hsl(var(--card));"></span>\n  <div class="nl-avatar">\n    <span class="nl-avatar-initials">JD</span>\n  </div>\n</div>`
      },
      {
        title: "Dismissible Card Button",
        desc: "Place interactive actions (like close buttons) overlapping the corners of custom card blocks.",
        preview: `<div class="nl-indicator">\n  <button class="nl-indicator-item nl-btn nl-btn-destructive" style="width: 1.5rem; height: 1.5rem; border-radius: var(--radius-full); padding: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid hsl(var(--card));" onclick="NovaToast.show({title: 'Removed Item', description: 'Item removed from checklist.'})">&times;</button>\n  <div class="nl-card nl-p-4" style="width: 15rem; background-color: hsla(var(--muted) / 0.1);">\n    <h5 class="nl-text-xs nl-font-bold nl-mb-1">Selected Asset</h5>\n    <p class="nl-text-xxs nl-text-muted nl-mb-0">intro_scene.mp4 (14.2 MB)</p>\n  </div>\n</div>`,
        code: `<div class="nl-indicator">\n  <button class="nl-indicator-item nl-btn nl-btn-destructive" style="width: 1.5rem; height: 1.5rem; border-radius: var(--radius-full); padding: 0; border: 2px solid hsl(var(--card));">&times;</button>\n  <div class="nl-card nl-p-4">\n    <h5 class="nl-text-xs nl-font-bold nl-mb-1">Selected Asset</h5>\n    <p class="nl-text-xxs nl-text-muted nl-mb-0">intro_scene.mp4 (14.2 MB)</p>\n  </div>\n</div>`
      },
      {
        title: "All Alignment Combinations",
        desc: "A grid demonstrating all 9 corner, edge, and center alignment configurations using helper coordinates modifiers.",
        preview: `<div class="nl-grid nl-grid-cols-3 nl-gap-8 nl-p-4 nl-justify-items-center">\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-top nl-indicator-start nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Top Start</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-top nl-indicator-center nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Top Center</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-top nl-indicator-end nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Top End</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-middle nl-indicator-start nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Mid Start</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-middle nl-indicator-center nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Center</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-middle nl-indicator-end nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Mid End</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-bottom nl-indicator-start nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Bot Start</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-bottom nl-indicator-center nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Bot Center</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n  <div class="nl-indicator">\n    <span class="nl-indicator-item nl-indicator-bottom nl-indicator-end nl-badge nl-badge-default" style="font-size: 8px; padding: 2px 4px; line-height: 1;">Bot End</span>\n    <div style="width: 4rem; height: 4rem; background-color: hsla(var(--muted) / 0.15); border-radius: var(--radius-md);"></div>\n  </div>\n</div>`,
        code: `<!-- Top Positions -->\n<div class="nl-indicator">\n  <span class="nl-indicator-item nl-indicator-top nl-indicator-start nl-badge">Top Start</span>\n  <div class="nl-box"></div>\n</div>\n\n<div class="nl-indicator">\n  <span class="nl-indicator-item nl-indicator-top nl-indicator-center nl-badge">Top Center</span>\n  <div class="nl-box"></div>\n</div>\n\n<!-- Bottom Positions -->\n<div class="nl-indicator">\n  <span class="nl-indicator-item nl-indicator-bottom nl-indicator-end nl-badge">Bot End</span>\n  <div class="nl-box"></div>\n</div>`
      }
    ],
    [
      { name: ".nl-indicator", desc: "Base indicator positioning wrapper container." },
      { name: ".nl-indicator-item", desc: "Absolute aligned indicator target component centered on the edge/corner." },
      { name: ".nl-indicator-top", desc: "Vertical alignment mapping top: 0 (default)." },
      { name: ".nl-indicator-middle", desc: "Vertical alignment mapping top: 50% vertical center." },
      { name: ".nl-indicator-bottom", desc: "Vertical alignment mapping bottom: 0." },
      { name: ".nl-indicator-start", desc: "Horizontal alignment mapping left: 0." },
      { name: ".nl-indicator-center", desc: "Horizontal alignment mapping left: 50% center." },
      { name: ".nl-indicator-end", desc: "Horizontal alignment mapping right: 0 (default)." }
    ]
  );

  // Alert
  PAGES.alert = renderComponentPage(
    "Alert",
    "Provides visual callout containers detailing informative statuses.",
    [
      {
        title: "Callout Alerts",
        desc: "Info alerts detailing normal, warning, and fatal errors statuses.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4 nl-w-full">\n  <div class="nl-alert nl-alert-default">\n    <div class="nl-alert-icon">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>\n    </div>\n    <div class="nl-alert-content">\n      <h5 class="nl-alert-title">System Update</h5>\n      <p class="nl-alert-description">We will release Nova UI v2 tomorrow. Plan builds accordingly.</p>\n    </div>\n  </div>\n  \n  <div class="nl-alert nl-alert-destructive">\n    <div class="nl-alert-icon">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>\n    </div>\n    <div class="nl-alert-content">\n      <h5 class="nl-alert-title">Compile Warning</h5>\n      <p class="nl-alert-description">An error halted styling updates. Verify input paths.</p>\n    </div>\n  </div>\n</div>`,
        code: `<div class="nl-flex nl-flex-col nl-gap-4 nl-w-full">\n  <div class="nl-alert nl-alert-default">\n    <div class="nl-alert-icon">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>\n    </div>\n    <div class="nl-alert-content">\n      <h5 class="nl-alert-title">System Update</h5>\n      <p class="nl-alert-description">We will release Nova UI v2 tomorrow. Plan builds accordingly.</p>\n    </div>\n  </div>\n  \n  <div class="nl-alert nl-alert-destructive">\n    <div class="nl-alert-icon">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>\n    </div>\n    <div class="nl-alert-content">\n      <h5 class="nl-alert-title">Compile Warning</h5>\n      <p class="nl-alert-description">An error halted styling updates. Verify input paths.</p>\n    </div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-alert", desc: "Main callout container spacing grid lines." },
      { name: ".nl-alert-title", desc: "Bold alert header title." },
      { name: ".nl-alert-description", desc: "Small explanation label." },
      { name: ".nl-alert-destructive", desc: "Warning error background and font colors." }
    ]
  );

  // Tabs
  PAGES.tabs = renderComponentPage(
    "Tabs",
    "Structures tab list switches, showing or hiding panel siblings dynamically.",
    [
      {
        title: "Tab Switched Panels",
        desc: "Interactive tabs navigating separate contents areas.",
        preview: `<div class="nl-tabs">\n  <div class="nl-tabs-list" role="tablist">\n    <button class="nl-tabs-trigger nl-active" role="tab" aria-selected="true" aria-controls="tab-pane-1">Profile</button>\n    <button class="nl-tabs-trigger" role="tab" aria-selected="false" aria-controls="tab-pane-2">Password</button>\n  </div>\n  <div id="tab-pane-1" class="nl-tabs-content nl-active" role="tabpanel">\n    <div class="nl-p-4 nl-border nl-rounded-xl">This is your profile dashboard contents. Add form elements here.</div>\n  </div>\n  <div id="tab-pane-2" class="nl-tabs-content" role="tabpanel" hidden>\n    <div class="nl-p-4 nl-border nl-rounded-xl">Manage credentials, toggle settings, and update accounts.</div>\n  </div>\n</div>`,
        code: `<div class="nl-tabs">\n  <div class="nl-tabs-list" role="tablist">\n    <button class="nl-tabs-trigger nl-active" role="tab" aria-selected="true" aria-controls="tab-pane-1">Profile</button>\n    <button class="nl-tabs-trigger" role="tab" aria-selected="false" aria-controls="tab-pane-2">Password</button>\n  </div>\n  <div id="tab-pane-1" class="nl-tabs-content nl-active" role="tabpanel">\n    <div class="nl-p-4 nl-border nl-rounded-xl">This is your profile dashboard contents. Add form elements here.</div>\n  </div>\n  <div id="tab-pane-2" class="nl-tabs-content" role="tabpanel" hidden>\n    <div class="nl-p-4 nl-border nl-rounded-xl">Manage credentials, toggle settings, and update accounts.</div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-tabs-list", desc: "Background capsule list containing selectors." },
      { name: ".nl-tabs-trigger", desc: "Selector buttons switching tabs." },
      { name: ".nl-tabs-trigger.nl-active", desc: "Elevated active tab state card." },
      { name: ".nl-tabs-content", desc: "Content panels shown or hidden on selections." }
    ],
    "Tab trigger buttons use <code>aria-controls</code> matching panel IDs. Arrow keys (Left/Right) navigate active focus within list nodes."
  );

  // Accordion
  PAGES.accordion = renderComponentPage(
    "Accordion",
    "Structures collapsible layouts transitioning heights dynamically via modern Grid rows.",
    [
      {
        title: "FAQ Collapsible Panels",
        desc: "Collapsible layouts that animate height open/close cycles.",
        preview: `<div class="nl-accordion" data-accordion-single style="max-width: 30rem; width: 100%;">\n  <div class="nl-accordion-item">\n    <button class="nl-accordion-trigger" aria-expanded="false" aria-controls="acc-1">\n      <span>What is Nova UI?</span>\n      <span class="nl-accordion-icon">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>\n      </span>\n    </button>\n    <div id="acc-1" class="nl-accordion-content" role="region" aria-hidden="true">\n      <div class="nl-accordion-body">\n        Nova UI is a complete vanilla CSS variables framework. It focuses on clean styling, utility modifiers, and ease of customization.\n      </div>\n    </div>\n  </div>\n  <div class="nl-accordion-item">\n    <button class="nl-accordion-trigger" aria-expanded="false" aria-controls="acc-2">\n      <span>How does height transition work?</span>\n      <span class="nl-accordion-icon">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>\n      </span>\n    </button>\n    <div id="acc-2" class="nl-accordion-content" role="region" aria-hidden="true">\n      <div class="nl-accordion-body">\n        It transitions CSS Grid <code>grid-template-rows</code> parameters from 0fr to 1fr. This avoids pixel height calculations in JavaScript.\n      </div>\n    </div>\n  </div>\n</div>`,
        code: `<div class="nl-accordion" data-accordion-single style="max-width: 30rem; width: 100%;">\n  <div class="nl-accordion-item">\n    <button class="nl-accordion-trigger" aria-expanded="false" aria-controls="acc-1">\n      <span>What is Nova UI?</span>\n      <span class="nl-accordion-icon">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>\n      </span>\n    </button>\n    <div id="acc-1" class="nl-accordion-content" role="region" aria-hidden="true">\n      <div class="nl-accordion-body">\n        Nova UI is a complete vanilla CSS variables framework. It focuses on clean styling, utility modifiers, and ease of customization.\n      </div>\n    </div>\n  </div>\n  <div class="nl-accordion-item">\n    <button class="nl-accordion-trigger" aria-expanded="false" aria-controls="acc-2">\n      <span>How does height transition work?</span>\n      <span class="nl-accordion-icon">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>\n      </span>\n    </button>\n    <div id="acc-2" class="nl-accordion-content" role="region" aria-hidden="true">\n      <div class="nl-accordion-body">\n        It transitions CSS Grid <code>grid-template-rows</code> parameters from 0fr to 1fr. This avoids pixel height calculations in JavaScript.\n      </div>\n    </div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-accordion-item", desc: "Accordion item block wrapping headers and panels." },
      { name: ".nl-accordion-trigger", desc: "Toggling trigger header updating expanded states." },
      { name: ".nl-accordion-icon", desc: "Icon container rotating chevron symbols." },
      { name: ".nl-accordion-content", desc: "Animate container transitioning CSS Grid rows." }
    ],
    "Add <code>data-accordion-single</code> attributes on parent nodes to auto-collapse other panes when opening new details."
  );

  // Navbar
  PAGES.navbar = renderComponentPage(
    "Navbar",
    "Defines top navigation headers styling logo brands, link groups, and sticky glass backdrops.",
    [
      {
        title: "Header Navigation Menu",
        desc: "Sticky navigation bar featuring responsive brand blocks.",
        preview: `<div class="nl-navbar" style="position: relative; top: 0; border: 1px solid hsl(var(--border)); border-radius: var(--radius-lg); width: 100%;">\n  <div class="nl-navbar-container">\n    <div class="nl-navbar-brand">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1.25rem; height: 1.25rem;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>\n      <span>BrandLogo</span>\n    </div>\n    <div class="nl-navbar-nav">\n      <a href="#/docs/navbar" class="nl-navbar-link nl-active">Home</a>\n      <a href="#/docs/navbar" class="nl-navbar-link">Products</a>\n      <a href="#/docs/navbar" class="nl-navbar-link">Pricing</a>\n    </div>\n  </div>\n</div>`,
        code: `<header class="nl-navbar">\n  <div class="nl-navbar-container">\n    <div class="nl-navbar-brand">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1.25rem; height: 1.25rem;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>\n      <span>Logo</span>\n    </div>\n    <div class="nl-navbar-nav">\n      <a href="#/docs/navbar" class="nl-navbar-link nl-active">Home</a>\n      <a href="#/docs/navbar" class="nl-navbar-link">Products</a>\n      <a href="#/docs/navbar" class="nl-navbar-link">Pricing</a>\n    </div>\n  </div>\n</header>`
      },
      {
        title: "Navbar with Search & Actions",
        desc: "Sticky navigation bar including an inline search field and action profile avatar.",
        preview: `<div class="nl-navbar" style="position: relative; top: 0; border: 1px solid hsl(var(--border)); border-radius: var(--radius-lg); width: 100%;">\n  <div class="nl-navbar-container">\n    <div class="nl-flex nl-items-center nl-gap-4">\n      <div class="nl-navbar-brand">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1.25rem; height: 1.25rem;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>\n        <span>StackApp</span>\n      </div>\n      <div class="nl-navbar-nav">\n        <a href="#/docs/navbar" class="nl-navbar-link nl-active">Dashboard</a>\n        <a href="#/docs/navbar" class="nl-navbar-link">Projects</a>\n      </div>\n    </div>\n    \n    <div class="nl-flex nl-items-center nl-gap-3">\n      <input type="text" class="nl-input" placeholder="Search projects..." style="height: 2rem; width: 10rem; border-radius: var(--radius-md); font-size: var(--text-xs); padding: 0 var(--space-2.5);">\n      <button class="nl-btn nl-btn-ghost nl-btn-sm" style="padding: 0 var(--space-2); height: 2rem; width: 2rem; border-radius: var(--radius-full);">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1rem; height: 1rem;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>\n      </button>\n      <div class="nl-avatar nl-avatar-circle" style="width: 2rem; height: 2rem; flex-shrink: 0; border: 1px solid hsl(var(--border)); font-size: var(--text-xs); font-weight: var(--font-semibold);">\n        <span>JD</span>\n      </div>\n    </div>\n  </div>\n</div>`,
        code: `<header class="nl-navbar">\n  <div class="nl-navbar-container">\n    <div class="nl-flex nl-items-center nl-gap-4">\n      <div class="nl-navbar-brand">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1.25rem; height: 1.25rem;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>\n        <span>Logo</span>\n      </div>\n      <div class="nl-navbar-nav">\n        <a href="#/docs/navbar" class="nl-navbar-link nl-active">Dashboard</a>\n        <a href="#/docs/navbar" class="nl-navbar-link">Projects</a>\n      </div>\n    </div>\n    \n    <div class="nl-flex nl-items-center nl-gap-3">\n      <input type="text" class="nl-input" placeholder="Search projects..." style="height: 2rem; width: 10rem; border-radius: var(--radius-md); font-size: var(--text-xs); padding: 0 var(--space-2.5);">\n      <button class="nl-btn nl-btn-ghost nl-btn-sm" style="padding: 0 var(--space-2); height: 2rem; width: 2rem; border-radius: var(--radius-full);">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1rem; height: 1rem;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>\n      </button>\n      <div class="nl-avatar nl-avatar-circle" style="width: 2rem; height: 2rem; flex-shrink: 0; border: 1px solid hsl(var(--border)); font-size: var(--text-xs); font-weight: var(--font-semibold);">\n        <span>JD</span>\n      </div>\n    </div>\n  </div>\n</header>`
      }
    ],
    [
      { name: ".nl-navbar", desc: "Sticky top navigation overlay providing blur filters." },
      { name: ".nl-navbar-container", desc: "Main flexbox container sizing heights and margins." },
      { name: ".nl-navbar-brand", desc: "Logo brand section typography sizes." },
      { name: ".nl-navbar-link", desc: "Active and hover menu link modifiers." }
    ]
  );

  // Sidebar
  PAGES.sidebar = renderComponentPage(
    "Sidebar",
    "Navigation sidebar layouts grouping document pages, navigation headers, and sections.",
    [
      {
        title: "Grouped Sidebar Panels",
        desc: "Sticky navigation panel with separate section titles.",
        preview: `<div class="nl-sidebar" style="position: relative; top: 0; height: 16rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius-lg); width: 100%; max-width: 14rem;">\n  <div class="nl-sidebar-section">\n    <h4 class="nl-sidebar-heading">Menu Group</h4>\n    <nav class="nl-sidebar-nav">\n      <a href="#/docs/sidebar" class="nl-sidebar-link nl-active">Overview</a>\n      <a href="#/docs/sidebar" class="nl-sidebar-link">Deployments</a>\n      <a href="#/docs/sidebar" class="nl-sidebar-link">Integrations</a>\n    </nav>\n  </div>\n</div>`,
        code: `<aside class="nl-sidebar">\n  <div class="nl-sidebar-section">\n    <h4 class="nl-sidebar-heading">Menu Group</h4>\n    <nav class="nl-sidebar-nav">\n      <a href="#/docs/sidebar" class="nl-sidebar-link nl-active">Overview</a>\n      <a href="#/docs/sidebar" class="nl-sidebar-link">Deployments</a>\n      <a href="#/docs/sidebar" class="nl-sidebar-link">Integrations</a>\n    </nav>\n  </div>\n</aside>`
      }
    ],
    [
      { name: ".nl-sidebar", desc: "Sidebar container panel defining borders, backgrounds, and width." },
      { name: ".nl-sidebar-heading", desc: "Uppercase label detailing sections." },
      { name: ".nl-sidebar-link", desc: "Menu links styling hover backgrounds and active states." }
    ]
  );

  // Table
  PAGES.table = renderComponentPage(
    "Table",
    "Formats HTML table elements styling border lines, column headings, striped rows, and cell alignments.",
    [
      {
        title: "Data List Table",
        desc: "Clean tabular grid with hover highlight and alternated zebra striping.",
        preview: `<div class="nl-table-container nl-w-full">\n  <table class="nl-table nl-table-hover nl-table-striped">\n    <thead>\n      <tr>\n        <th>Repository</th>\n        <th>Status</th>\n        <th>Commit</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><strong>Nova UI</strong></td>\n        <td><span class="nl-badge nl-badge-success">Active</span></td>\n        <td><code>f9a2b10</code></td>\n      </tr>\n      <tr>\n        <td>docs-engine</td>\n        <td><span class="nl-badge nl-badge-secondary">Pending</span></td>\n        <td><code>52d3a91</code></td>\n      </tr>\n      <tr>\n        <td>purger-cli</td>\n        <td><span class="nl-badge nl-badge-destructive">Halted</span></td>\n        <td><code>e2f3c0b</code></td>\n      </tr>\n    </tbody>\n  </table>\n</div>`,
        code: `<div class="nl-table-container nl-w-full">\n  <table class="nl-table nl-table-hover nl-table-striped">\n    <thead>\n      <tr>\n        <th>Repository</th>\n        <th>Status</th>\n        <th>Commit</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><strong>Nova UI</strong></td>\n        <td><span class="nl-badge nl-badge-success">Active</span></td>\n        <td><code>f9a2b10</code></td>\n      </tr>\n      <tr>\n        <td>docs-engine</td>\n        <td><span class="nl-badge nl-badge-secondary">Pending</span></td>\n        <td><code>52d3a91</code></td>\n      </tr>\n      <tr>\n        <td>purger-cli</td>\n        <td><span class="nl-badge nl-badge-destructive">Halted</span></td>\n        <td><code>e2f3c0b</code></td>\n      </tr>\n    </tbody>\n  </table>\n</div>`
      }
    ],
    [
      { name: ".nl-table-container", desc: "Responsive scroll container containing border radius parameters." },
      { name: ".nl-table", desc: "Main table selectors stripping defaults." },
      { name: ".nl-table-hover", desc: "Highlights row backgrounds on hover." },
      { name: ".nl-table-striped", desc: "Strikes even rows using alternate gray values." }
    ]
  );

  // Pagination
  PAGES.pagination = renderComponentPage(
    "Pagination",
    "Page selectors navigation aligning arrows indicators, link buttons, and separator dots.",
    [
      {
        title: "Standard Navigation controls",
        desc: "Segmented lists of page selectors.",
        preview: `<nav class="nl-pagination" aria-label="Page navigation">\n  <ul class="nl-pagination-list">\n    <li><button class="nl-pagination-link nl-pagination-prev" disabled>Previous</button></li>\n    <li><a class="nl-pagination-link" href="#/docs/pagination">1</a></li>\n    <li><a class="nl-pagination-link nl-active" href="#/docs/pagination">2</a></li>\n    <li><span class="nl-pagination-ellipsis">...</span></li>\n    <li><a class="nl-pagination-link" href="#/docs/pagination">8</a></li>\n    <li><a class="nl-pagination-link nl-pagination-next" href="#/docs/pagination">Next</a></li>\n  </ul>\n</nav>`,
        code: `<nav class="nl-pagination" aria-label="Page navigation">\n  <ul class="nl-pagination-list">\n    <li><button class="nl-pagination-link nl-pagination-prev" disabled>Previous</button></li>\n    <li><a class="nl-pagination-link" href="#/docs/pagination">1</a></li>\n    <li><a class="nl-pagination-link nl-active" href="#/docs/pagination">2</a></li>\n    <li><span class="nl-pagination-ellipsis">...</span></li>\n    <li><a class="nl-pagination-link" href="#/docs/pagination">8</a></li>\n    <li><a class="nl-pagination-link nl-pagination-next" href="#/docs/pagination">Next</a></li>\n  </ul>\n</nav>`
      }
    ],
    [
      { name: ".nl-pagination", desc: "Flexbox centers lists." },
      { name: ".nl-pagination-link", desc: "Action links styling page nodes." },
      { name: ".nl-pagination-ellipsis", desc: "Ellipsis text wrapper indicating skipped sequences." }
    ]
  );

  // Toast
  PAGES.toast = renderComponentPage(
    "Toast",
    "Triggers floating alert cards slide-in actions, dismissing automatically after timeouts.",
    [
      {
        title: "Alert Notifications",
        desc: "Pop-up statuses triggering float alerts stacked at viewports boundaries.",
        preview: `<div class="nl-flex nl-gap-2">\n  <button class="nl-btn nl-btn-outline" onclick="NovaToast.show({title:\'Action Complete\', description:\'Workspace details saved successfully.\'})">Trigger Default</button>\n  <button class="nl-btn nl-btn-success" onclick="NovaToast.show({title:\'Deployment Active\', description:\'Server built successfully.\', variant:\'success\'})">Success Toast</button>\n  <button class="nl-btn nl-btn-destructive" onclick="NovaToast.show({title:\'Compile Error\', description:\'Styling compiler output failed.\', variant:\'destructive\'})">Error Toast</button>\n</div>`,
        code: `<div class="nl-flex nl-gap-2">\n  <button class="nl-btn nl-btn-outline" onclick="NovaToast.show({title:\'Action Complete\', description:\'Workspace details saved successfully.\'})">Trigger Default</button>\n  <button class="nl-btn nl-btn-success" onclick="NovaToast.show({title:\'Deployment Active\', description:\'Server built successfully.\', variant:\'success\'})">Success Toast</button>\n  <button class="nl-btn nl-btn-destructive" onclick="NovaToast.show({title:\'Compile Error\', description:\'Styling compiler output failed.\', variant:\'destructive\'})">Error Toast</button>\n</div>`
      }
    ],
    [
      { name: ".nl-toast-container", desc: "Fixed corner stack layout." },
      { name: ".nl-toast", desc: "Toast card wrapper styling slide-in animations." },
      { name: ".nl-toast-title", desc: "Bold title heading." },
      { name: ".nl-toast-description", desc: "Description label text." }
    ],
    "Toasts use <code>role='status'</code> with <code>aria-live='polite'</code>. Close triggers use click handlers to animate exits before purging elements."
  );

  // Skeleton
  PAGES.skeleton = renderComponentPage(
    "Skeleton Loader",
    "Loading placeholders to represent content layouts while components render.",
    [
      {
        title: "Shimmering Loaders",
        desc: "Animated skeletons structures mimicking lists data components.",
        preview: `<div class="nl-card nl-p-6" style="width: 20rem;">\n  <div class="nl-flex nl-items-center nl-gap-3 nl-mb-4">\n    <div class="nl-skeleton nl-skeleton-circle"></div>\n    <div class="nl-flex-1 nl-flex nl-flex-col nl-gap-1.5">\n      <div class="nl-skeleton nl-skeleton-text" style="width: 50%;"></div>\n      <div class="nl-skeleton nl-skeleton-text" style="width: 30%;"></div>\n    </div>\n  </div>\n  <div class="nl-flex nl-flex-col nl-gap-2">\n    <div class="nl-skeleton nl-skeleton-text"></div>\n    <div class="nl-skeleton nl-skeleton-text" style="width: 80%;"></div>\n  </div>\n</div>`,
        code: `<div class="nl-card nl-p-6" style="width: 20rem;">\n  <div class="nl-flex nl-items-center nl-gap-3 nl-mb-4">\n    <div class="nl-skeleton nl-skeleton-circle"></div>\n    <div class="nl-flex-1 nl-flex nl-flex-col nl-gap-1.5">\n      <div class="nl-skeleton nl-skeleton-text" style="width: 50%;"></div>\n      <div class="nl-skeleton nl-skeleton-text" style="width: 30%;"></div>\n    </div>\n  </div>\n  <div class="nl-flex nl-flex-col nl-gap-2">\n    <div class="nl-skeleton nl-skeleton-text"></div>\n    <div class="nl-skeleton nl-skeleton-text" style="width: 80%;"></div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-skeleton", desc: "Base skeleton container styling widths and infinite pulse selectors." },
      { name: ".nl-skeleton-circle", desc: "Circle layout Avatar modifiers." },
      { name: ".nl-skeleton-text", desc: "Thin lines simulating text lines." }
    ]
  );

  // Progress
  PAGES.progress = renderComponentPage(
    "Progress Bar",
    "Track bar indicators displaying loading values or workflow sequences.",
    [
      {
        title: "Dynamic progress values",
        desc: "Workflow indicators mapping completions ratios.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4 nl-w-full" style="max-width: 24rem;">\n  <div>\n    <div class="nl-flex nl-justify-between nl-text-xs nl-mb-1">\n      <span>Compiling bundles...</span>\n      <span>70%</span>\n    </div>\n    <div class="nl-progress">\n      <div class="nl-progress-value" style="width: 70%;"></div>\n    </div>\n  </div>\n  \n  <div>\n    <div class="nl-flex nl-justify-between nl-text-xs nl-mb-1">\n      <span>Build Success</span>\n      <span>100%</span>\n    </div>\n    <div class="nl-progress nl-progress-success">\n      <div class="nl-progress-value" style="width: 100%;"></div>\n    </div>\n  </div>\n</div>`,
        code: `<div class="nl-flex nl-flex-col nl-gap-4 nl-w-full" style="max-width: 24rem;">\n  <div>\n    <div class="nl-flex nl-justify-between nl-text-xs nl-mb-1">\n      <span>Compiling bundles...</span>\n      <span>70%</span>\n    </div>\n    <div class="nl-progress">\n      <div class="nl-progress-value" style="width: 70%;"></div>\n    </div>\n  </div>\n  \n  <div>\n    <div class="nl-flex nl-justify-between nl-text-xs nl-mb-1">\n      <span>Build Success</span>\n      <span>100%</span>\n    </div>\n    <div class="nl-progress nl-progress-success">\n      <div class="nl-progress-value" style="width: 100%;"></div>\n    </div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-progress", desc: "Track capsule spacing track backgrounds." },
      { name: ".nl-progress-value", desc: "Value indicator bar styling transition sizes." },
      { name: ".nl-progress-success", desc: "Variant color settings shifting fills to success theme colors." }
    ]
  );

  // Avatar
  PAGES.avatar = renderComponentPage(
    "Avatar",
    "Renders crop circle images or initials tag indicators as profiles fallbacks.",
    [
      {
        title: "User Profile crops",
        desc: "Responsive circle crops with broken link text initials fallbacks.",
        preview: `<div class="nl-flex nl-gap-4 nl-items-center">\n  <div class="nl-avatar">\n    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" class="nl-avatar-image">\n    <div class="nl-avatar-fallback">JD</div>\n  </div>\n  <div class="nl-avatar">\n    <img src="broken-link-example" alt="Avatar Fallback" class="nl-avatar-image">\n    <div class="nl-avatar-fallback">GL</div>\n  </div>\n  <div class="nl-avatar nl-avatar-square nl-avatar-lg">\n    <div class="nl-avatar-fallback">NL</div>\n  </div>\n</div>`,
        code: `<div class="nl-flex nl-gap-4 nl-items-center">\n  <div class="nl-avatar">\n    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" class="nl-avatar-image">\n    <div class="nl-avatar-fallback">JD</div>\n  </div>\n  <div class="nl-avatar">\n    <img src="broken-link-example" alt="Avatar Fallback" class="nl-avatar-image">\n    <div class="nl-avatar-fallback">GL</div>\n  </div>\n  <div class="nl-avatar nl-avatar-square nl-avatar-lg">\n    <div class="nl-avatar-fallback">NL</div>\n  </div>\n</div>`
      }
    ],
    [
      { name: ".nl-avatar", desc: "Circle frame masking layouts." },
      { name: ".nl-avatar-image", desc: "Fitted object coverage sizing profiles." },
      { name: ".nl-avatar-fallback", desc: "Flex center block shown if images fail loading." }
    ]
  );

  // Breadcrumb
  PAGES.breadcrumb = renderComponentPage(
    "Breadcrumb",
    "Horizontal path navigation aligning nodes details and separators symbols.",
    [
      {
        title: "Navigation Directories Path",
        desc: "Breadcrumb menu spacing chevron separators.",
        preview: `<nav class="nl-breadcrumb" aria-label="Breadcrumb">\n  <ol class="nl-breadcrumb-list">\n    <li class="nl-breadcrumb-item">\n      <a href="#/docs/introduction" class="nl-breadcrumb-link">Docs</a>\n    </li>\n    <li class="nl-breadcrumb-separator">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>\n    </li>\n    <li class="nl-breadcrumb-item">\n      <a href="#/docs/breadcrumb" class="nl-breadcrumb-link">Components</a>\n    </li>\n    <li class="nl-breadcrumb-separator">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>\n    </li>\n    <li class="nl-breadcrumb-item">\n      <span class="nl-breadcrumb-page">Breadcrumb</span>\n    </li>\n  </ol>\n</nav>`,
        code: `<nav class="nl-breadcrumb" aria-label="Breadcrumb">\n  <ol class="nl-breadcrumb-list">\n    <li class="nl-breadcrumb-item">\n      <a href="#/docs/introduction" class="nl-breadcrumb-link">Docs</a>\n    </li>\n    <li class="nl-breadcrumb-separator">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>\n    </li>\n    <li class="nl-breadcrumb-item">\n      <a href="#/docs/breadcrumb" class="nl-breadcrumb-link">Components</a>\n    </li>\n    <li class="nl-breadcrumb-separator">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>\n    </li>\n    <li class="nl-breadcrumb-item">\n      <span class="nl-breadcrumb-page">Breadcrumb</span>\n    </li>\n  </ol>\n</nav>`
      }
    ],
    [
      { name: ".nl-breadcrumb", desc: "Base nav layout details." },
      { name: ".nl-breadcrumb-link", desc: "Action menu nodes." },
      { name: ".nl-breadcrumb-separator", desc: "Visual divider separator markup." },
      { name: ".nl-breadcrumb-page", desc: "Current page state indicator." }
    ]
  );

  // Calendar
  PAGES.calendar = renderComponentPage(
    "Calendar",
    "A customizable month day grid planner layout featuring event listings.",
    [
      {
        title: "Standard Monthly Calendar",
        desc: "Month calendar day grid highlights active date selections and today.",
        preview: `<div class="nl-calendar">
  <div class="nl-calendar-header">
    <span class="nl-calendar-title">May 2026</span>
    <div class="nl-calendar-nav">
      <button class="nl-calendar-nav-btn" aria-label="Previous Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="nl-calendar-nav-btn" aria-label="Next Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
  <div class="nl-calendar-grid">
    <div class="nl-calendar-day-header">Su</div>
    <div class="nl-calendar-day-header">Mo</div>
    <div class="nl-calendar-day-header">Tu</div>
    <div class="nl-calendar-day-header">We</div>
    <div class="nl-calendar-day-header">Th</div>
    <div class="nl-calendar-day-header">Fr</div>
    <div class="nl-calendar-day-header">Sa</div>
    <button class="nl-calendar-day nl-muted">26</button>
    <button class="nl-calendar-day nl-muted">27</button>
    <button class="nl-calendar-day nl-muted">28</button>
    <button class="nl-calendar-day nl-muted">29</button>
    <button class="nl-calendar-day nl-muted">30</button>
    <button class="nl-calendar-day">1</button>
    <button class="nl-calendar-day">2</button>
    <button class="nl-calendar-day">3</button>
    <button class="nl-calendar-day">4</button>
    <button class="nl-calendar-day">5</button>
    <button class="nl-calendar-day">6</button>
    <button class="nl-calendar-day">7</button>
    <button class="nl-calendar-day">8</button>
    <button class="nl-calendar-day">9</button>
    <button class="nl-calendar-day">10</button>
    <button class="nl-calendar-day">11</button>
    <button class="nl-calendar-day">12</button>
    <button class="nl-calendar-day">13</button>
    <button class="nl-calendar-day">14</button>
    <button class="nl-calendar-day">15</button>
    <button class="nl-calendar-day">16</button>
    <button class="nl-calendar-day">17</button>
    <button class="nl-calendar-day">18</button>
    <button class="nl-calendar-day">19</button>
    <button class="nl-calendar-day">20</button>
    <button class="nl-calendar-day">21</button>
    <button class="nl-calendar-day">22</button>
    <button class="nl-calendar-day">23</button>
    <button class="nl-calendar-day">24</button>
    <button class="nl-calendar-day nl-today nl-active">25</button>
    <button class="nl-calendar-day">26</button>
    <button class="nl-calendar-day">27</button>
    <button class="nl-calendar-day">28</button>
    <button class="nl-calendar-day">29</button>
    <button class="nl-calendar-day">30</button>
    <button class="nl-calendar-day">31</button>
    <button class="nl-calendar-day nl-muted">1</button>
    <button class="nl-calendar-day nl-muted">2</button>
    <button class="nl-calendar-day nl-muted">3</button>
    <button class="nl-calendar-day nl-muted">4</button>
    <button class="nl-calendar-day nl-muted">5</button>
    <button class="nl-calendar-day nl-muted">6</button>
  </div>
</div>`,
        code: `<div class="nl-calendar">
  <div class="nl-calendar-header">
    <span class="nl-calendar-title">May 2026</span>
    <div class="nl-calendar-nav">
      <button class="nl-calendar-nav-btn" aria-label="Previous Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="nl-calendar-nav-btn" aria-label="Next Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
  <div class="nl-calendar-grid">
    <div class="nl-calendar-day-header">Su</div>
    <div class="nl-calendar-day-header">Mo</div>
    <div class="nl-calendar-day-header">Tu</div>
    <div class="nl-calendar-day-header">We</div>
    <div class="nl-calendar-day-header">Th</div>
    <div class="nl-calendar-day-header">Fr</div>
    <div class="nl-calendar-day-header">Sa</div>
    <button class="nl-calendar-day nl-muted">26</button>
    <button class="nl-calendar-day nl-muted">27</button>
    <button class="nl-calendar-day nl-muted">28</button>
    <button class="nl-calendar-day nl-muted">29</button>
    <button class="nl-calendar-day nl-muted">30</button>
    <button class="nl-calendar-day">1</button>
    <button class="nl-calendar-day">2</button>
    <button class="nl-calendar-day">3</button>
    <button class="nl-calendar-day">4</button>
    <button class="nl-calendar-day">5</button>
    <button class="nl-calendar-day">6</button>
    <button class="nl-calendar-day">7</button>
    <button class="nl-calendar-day">8</button>
    <button class="nl-calendar-day">9</button>
    <button class="nl-calendar-day">10</button>
    <button class="nl-calendar-day">11</button>
    <button class="nl-calendar-day">12</button>
    <button class="nl-calendar-day">13</button>
    <button class="nl-calendar-day">14</button>
    <button class="nl-calendar-day">15</button>
    <button class="nl-calendar-day">16</button>
    <button class="nl-calendar-day">17</button>
    <button class="nl-calendar-day">18</button>
    <button class="nl-calendar-day">19</button>
    <button class="nl-calendar-day">20</button>
    <button class="nl-calendar-day">21</button>
    <button class="nl-calendar-day">22</button>
    <button class="nl-calendar-day">23</button>
    <button class="nl-calendar-day">24</button>
    <button class="nl-calendar-day nl-today nl-active">25</button>
    <button class="nl-calendar-day">26</button>
    <button class="nl-calendar-day">27</button>
    <button class="nl-calendar-day">28</button>
    <button class="nl-calendar-day">29</button>
    <button class="nl-calendar-day">30</button>
    <button class="nl-calendar-day">31</button>
    <button class="nl-calendar-day nl-muted">1</button>
    <button class="nl-calendar-day nl-muted">2</button>
    <button class="nl-calendar-day nl-muted">3</button>
    <button class="nl-calendar-day nl-muted">4</button>
    <button class="nl-calendar-day nl-muted">5</button>
    <button class="nl-calendar-day nl-muted">6</button>
  </div>
</div>`
      },
      {
        title: "Calendar with Event Planner",
        desc: "Includes a sub-section for highlight events scheduled for the active date.",
        preview: `<div class="nl-calendar">
  <div class="nl-calendar-header">
    <span class="nl-calendar-title">May 2026</span>
    <div class="nl-calendar-nav">
      <button class="nl-calendar-nav-btn" aria-label="Previous Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="nl-calendar-nav-btn" aria-label="Next Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
  <div class="nl-calendar-grid">
    <div class="nl-calendar-day-header">Su</div>
    <div class="nl-calendar-day-header">Mo</div>
    <div class="nl-calendar-day-header">Tu</div>
    <div class="nl-calendar-day-header">We</div>
    <div class="nl-calendar-day-header">Th</div>
    <div class="nl-calendar-day-header">Fr</div>
    <div class="nl-calendar-day-header">Sa</div>
    <button class="nl-calendar-day nl-muted">26</button>
    <button class="nl-calendar-day nl-muted">27</button>
    <button class="nl-calendar-day nl-muted">28</button>
    <button class="nl-calendar-day nl-muted">29</button>
    <button class="nl-calendar-day nl-muted">30</button>
    <button class="nl-calendar-day">1</button>
    <button class="nl-calendar-day">2</button>
    <button class="nl-calendar-day">3</button>
    <button class="nl-calendar-day">4</button>
    <button class="nl-calendar-day">5</button>
    <button class="nl-calendar-day">6</button>
    <button class="nl-calendar-day">7</button>
    <button class="nl-calendar-day">8</button>
    <button class="nl-calendar-day">9</button>
    <button class="nl-calendar-day">10</button>
    <button class="nl-calendar-day">11</button>
    <button class="nl-calendar-day">12</button>
    <button class="nl-calendar-day">13</button>
    <button class="nl-calendar-day">14</button>
    <button class="nl-calendar-day">15</button>
    <button class="nl-calendar-day">16</button>
    <button class="nl-calendar-day">17</button>
    <button class="nl-calendar-day">18</button>
    <button class="nl-calendar-day">19</button>
    <button class="nl-calendar-day">20</button>
    <button class="nl-calendar-day">21</button>
    <button class="nl-calendar-day">22</button>
    <button class="nl-calendar-day">23</button>
    <button class="nl-calendar-day">24</button>
    <button class="nl-calendar-day nl-today nl-active">25</button>
    <button class="nl-calendar-day">26</button>
    <button class="nl-calendar-day">27</button>
    <button class="nl-calendar-day">28</button>
    <button class="nl-calendar-day">29</button>
    <button class="nl-calendar-day">30</button>
    <button class="nl-calendar-day">31</button>
    <button class="nl-calendar-day nl-muted">1</button>
    <button class="nl-calendar-day nl-muted">2</button>
    <button class="nl-calendar-day nl-muted">3</button>
    <button class="nl-calendar-day nl-muted">4</button>
    <button class="nl-calendar-day nl-muted">5</button>
    <button class="nl-calendar-day nl-muted">6</button>
  </div>
  <div class="nl-calendar-event">
    <span class="nl-calendar-event-title">Events for Today</span>
    <div class="nl-calendar-event-card">
      <div class="nl-calendar-event-time">10:00 AM</div>
      <div class="nl-calendar-event-desc">Nova UI Review with Product Team</div>
    </div>
  </div>
</div>`,
        code: `<div class="nl-calendar">
  <div class="nl-calendar-header">
    <span class="nl-calendar-title">May 2026</span>
    <div class="nl-calendar-nav">
      <button class="nl-calendar-nav-btn" aria-label="Previous Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="nl-calendar-nav-btn" aria-label="Next Month">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
  <div class="nl-calendar-grid">
    <div class="nl-calendar-day-header">Su</div>
    <div class="nl-calendar-day-header">Mo</div>
    <div class="nl-calendar-day-header">Tu</div>
    <div class="nl-calendar-day-header">We</div>
    <div class="nl-calendar-day-header">Th</div>
    <div class="nl-calendar-day-header">Fr</div>
    <div class="nl-calendar-day-header">Sa</div>
    <button class="nl-calendar-day nl-muted">26</button>
    <button class="nl-calendar-day nl-muted">27</button>
    <button class="nl-calendar-day nl-muted">28</button>
    <button class="nl-calendar-day nl-muted">29</button>
    <button class="nl-calendar-day nl-muted">30</button>
    <button class="nl-calendar-day">1</button>
    <button class="nl-calendar-day">2</button>
    <button class="nl-calendar-day">3</button>
    <button class="nl-calendar-day">4</button>
    <button class="nl-calendar-day">5</button>
    <button class="nl-calendar-day">6</button>
    <button class="nl-calendar-day">7</button>
    <button class="nl-calendar-day">8</button>
    <button class="nl-calendar-day">9</button>
    <button class="nl-calendar-day">10</button>
    <button class="nl-calendar-day">11</button>
    <button class="nl-calendar-day">12</button>
    <button class="nl-calendar-day">13</button>
    <button class="nl-calendar-day">14</button>
    <button class="nl-calendar-day">15</button>
    <button class="nl-calendar-day">16</button>
    <button class="nl-calendar-day">17</button>
    <button class="nl-calendar-day">18</button>
    <button class="nl-calendar-day">19</button>
    <button class="nl-calendar-day">20</button>
    <button class="nl-calendar-day">21</button>
    <button class="nl-calendar-day">22</button>
    <button class="nl-calendar-day">23</button>
    <button class="nl-calendar-day">24</button>
    <button class="nl-calendar-day nl-today nl-active">25</button>
    <button class="nl-calendar-day">26</button>
    <button class="nl-calendar-day">27</button>
    <button class="nl-calendar-day">28</button>
    <button class="nl-calendar-day">29</button>
    <button class="nl-calendar-day">30</button>
    <button class="nl-calendar-day">31</button>
    <button class="nl-calendar-day nl-muted">1</button>
    <button class="nl-calendar-day nl-muted">2</button>
    <button class="nl-calendar-day nl-muted">3</button>
    <button class="nl-calendar-day nl-muted">4</button>
    <button class="nl-calendar-day nl-muted">5</button>
    <button class="nl-calendar-day nl-muted">6</button>
  </div>
  <div class="nl-calendar-event">
    <span class="nl-calendar-event-title">Events for Today</span>
    <div class="nl-calendar-event-card">
      <div class="nl-calendar-event-time">10:00 AM</div>
      <div class="nl-calendar-event-desc">Nova UI Review with Product Team</div>
    </div>
  </div>
</div>`
      }
    ],
    [
      { name: ".nl-calendar", desc: "Main calendar card box container." },
      { name: ".nl-calendar-header", desc: "Header block hosting title month and navigation." },
      { name: ".nl-calendar-title", desc: "Visual text label showing active month/year." },
      { name: ".nl-calendar-nav-btn", desc: "Navigation chevron arrow buttons." },
      { name: ".nl-calendar-grid", desc: "7 columns layout displaying days headers and numbers." },
      { name: ".nl-calendar-day", desc: "Date day numbers action grid button." },
      { name: ".nl-muted", desc: "Modifier for date cells outside the active month." },
      { name: ".nl-active", desc: "Selected/active date accent background modifier." },
      { name: ".nl-today", desc: "Ring border highlight for the current date." },
      { name: ".nl-calendar-event", desc: "Event panel lists divider border." },
      { name: ".nl-calendar-event-card", desc: "Sub card container detailing active day events." }
    ],
    "Use standard semantic grid markup. Ensure arrow buttons contain descriptive aria-label items for screen reader compatibility.",
    "Adjust cell hover backgrounds with <code>--secondary</code>, active backgrounds with <code>--primary</code>, and border radii values with <code>--radius-factor</code> parameters."
  );

  // Timeline
  PAGES.timeline = renderComponentPage(
    "Timeline",
    "A vertical chronological progress events chain with nodes, modifiers, and descriptions.",
    [
      {
        title: "Default Action Timeline",
        desc: "Chronological vertical connection lines linking status dot nodes and content lists.",
        preview: `<div class="nl-timeline" style="max-width: 28rem;">
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-primary"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Framework Initialized</h4>
        <span class="nl-timeline-time">10 mins ago</span>
      </div>
      <p class="nl-timeline-desc">Loaded core variables, reset models, and dynamic dark mode parameters.</p>
    </div>
  </div>
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-success"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Component Compile Complete</h4>
        <span class="nl-timeline-time">2 hours ago</span>
      </div>
      <p class="nl-timeline-desc">Successfully Purged unused styles and packaged the standard distribution bundle.</p>
    </div>
  </div>
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-warning"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Contrast Warning Alert</h4>
        <span class="nl-timeline-time">Yesterday</span>
      </div>
      <p class="nl-timeline-desc">Detected contrast ratio below 4.5:1 on customized slider backgrounds. Self-corrected.</p>
    </div>
  </div>
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-destructive"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Build Pipeline Failure</h4>
        <span class="nl-timeline-time">3 days ago</span>
      </div>
      <p class="nl-timeline-desc">Missing direct HSL theme mapping declarations during compiler packaging pass.</p>
    </div>
  </div>
</div>`,
        code: `<div class="nl-timeline" style="max-width: 28rem;">
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-primary"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Framework Initialized</h4>
        <span class="nl-timeline-time">10 mins ago</span>
      </div>
      <p class="nl-timeline-desc">Loaded core variables, reset models, and dynamic dark mode parameters.</p>
    </div>
  </div>
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-success"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Component Compile Complete</h4>
        <span class="nl-timeline-time">2 hours ago</span>
      </div>
      <p class="nl-timeline-desc">Successfully Purged unused styles and packaged the standard distribution bundle.</p>
    </div>
  </div>
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-warning"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Contrast Warning Alert</h4>
        <span class="nl-timeline-time">Yesterday</span>
      </div>
      <p class="nl-timeline-desc">Detected contrast ratio below 4.5:1 on customized slider backgrounds. Self-corrected.</p>
    </div>
  </div>
  <div class="nl-timeline-item">
    <div class="nl-timeline-separator">
      <span class="nl-timeline-dot nl-timeline-dot-destructive"></span>
      <span class="nl-timeline-line"></span>
    </div>
    <div class="nl-timeline-content">
      <div class="nl-timeline-header">
        <h4 class="nl-timeline-title">Build Pipeline Failure</h4>
        <span class="nl-timeline-time">3 days ago</span>
      </div>
      <p class="nl-timeline-desc">Missing direct HSL theme mapping declarations during compiler packaging pass.</p>
    </div>
  </div>
</div>`
      }
    ],
    [
      { name: ".nl-timeline", desc: "Main chronological list container." },
      { name: ".nl-timeline-item", desc: "Wrapper layout containing one separator and content block." },
      { name: ".nl-timeline-separator", desc: "Vertical alignment grid space for nodes and lines." },
      { name: ".nl-timeline-dot", desc: "Individual event node dot circle indicator." },
      { name: ".nl-timeline-dot-primary", desc: "Primary brand border and fill color styling modifier." },
      { name: ".nl-timeline-dot-success", desc: "Success green color node indicator." },
      { name: ".nl-timeline-dot-warning", desc: "Warning amber color node indicator." },
      { name: ".nl-timeline-dot-destructive", desc: "Destructive red color node indicator." },
      { name: ".nl-timeline-line", desc: "Vertical connection line linking item nodes." }
    ],
    "Use semantic headers like h4 for event titles. Set connection lines width to absolute pixels for high-density rendering accuracy.",
    "Tweak connecting lines background color, dot diameters, and spacing scales dynamically using theme parameters."
  );

  // Media Timeline
  PAGES.mediaTimeline = renderComponentPage(
    "Media Timeline",
    "A track-editor view with waveforms, thumbnails, time rulers, and playheads for video editors and media players.",
    [
      {
        title: "Video Editor Workspace",
        desc: "A multi-track timeline block featuring playback buttons, a timecode indicator, lock controls, and visual clip blocks.",
        preview: `<div class="nl-media-timeline">
  <!-- Toolbar -->
  <div class="nl-media-timeline-toolbar">
    <div class="nl-media-timeline-controls">
      <button class="nl-media-timeline-btn" aria-label="Play">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <button class="nl-media-timeline-btn" aria-label="Stop">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
      </button>
      <div class="nl-media-timeline-timecode">00:01:24:15</div>
    </div>
    <div class="nl-media-timeline-tools">
      <button class="nl-media-timeline-tool-btn nl-active">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-7-4-7 4Z"/></svg>
        <span>Select</span>
      </button>
      <button class="nl-media-timeline-tool-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2 2 22"/><path d="M17 2h5v5"/><path d="M7 22H2v-5"/></svg>
        <span>Split</span>
      </button>
    </div>
  </div>

  <!-- Ruler -->
  <div class="nl-media-timeline-ruler">
    <div class="nl-media-timeline-ticks">
      <span class="nl-media-timeline-tick">00:00</span>
      <span class="nl-media-timeline-tick">00:30</span>
      <span class="nl-media-timeline-tick">01:00</span>
      <span class="nl-media-timeline-tick">01:30</span>
      <span class="nl-media-timeline-tick">02:00</span>
      <span class="nl-media-timeline-tick">02:30</span>
      <span class="nl-media-timeline-tick">03:00</span>
    </div>
  </div>

  <!-- Tracks space -->
  <div class="nl-media-timeline-workspace">
    <!-- Playhead line -->
    <div class="nl-media-timeline-playhead">
      <div class="nl-media-timeline-playhead-handle"></div>
    </div>

    <!-- Tracks container -->
    <div class="nl-media-timeline-tracks">
      
      <!-- Video Track 1 -->
      <div class="nl-media-timeline-track">
        <div class="nl-media-timeline-track-header">
          <span class="nl-media-timeline-track-title">Video 1</span>
          <div class="nl-media-timeline-track-controls">
            <button class="nl-media-timeline-track-btn" aria-label="Mute Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 8v8h5l5 5V3L7 8H2Z"/></svg>
            </button>
            <button class="nl-media-timeline-track-btn" aria-label="Lock Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
          </div>
        </div>
        <div class="nl-media-timeline-track-lane">
          <div class="nl-media-timeline-clip nl-media-timeline-clip-video" style="width: 140px; margin-left: 20px;">
            <span class="nl-media-timeline-clip-name">intro_scene.mp4</span>
            <span class="nl-media-timeline-clip-duration">00:30</span>
          </div>
          <div class="nl-media-timeline-clip nl-media-timeline-clip-video" style="width: 220px;">
            <span class="nl-media-timeline-clip-name">main_interview.mp4</span>
            <span class="nl-media-timeline-clip-duration">01:45</span>
          </div>
        </div>
      </div>

      <!-- Audio Track 1 -->
      <div class="nl-media-timeline-track">
        <div class="nl-media-timeline-track-header">
          <span class="nl-media-timeline-track-title">Audio 1</span>
          <div class="nl-media-timeline-track-controls">
            <button class="nl-media-timeline-track-btn nl-active" aria-label="Mute Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/><path d="M11 5 6 9H2v6h4l5 4V5Z"/></svg>
            </button>
            <button class="nl-media-timeline-track-btn" aria-label="Lock Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
          </div>
        </div>
        <div class="nl-media-timeline-track-lane">
          <div class="nl-media-timeline-clip nl-media-timeline-clip-audio" style="width: 140px; margin-left: 20px;">
            <span class="nl-media-timeline-clip-name">bg_music.wav</span>
            <span class="nl-media-timeline-clip-duration">00:30</span>
          </div>
          <div class="nl-media-timeline-clip nl-media-timeline-clip-audio" style="width: 220px;">
            <span class="nl-media-timeline-clip-name">voiceover.wav</span>
            <span class="nl-media-timeline-clip-duration">01:45</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>`,
        code: `<div class="nl-media-timeline">
  <!-- Toolbar -->
  <div class="nl-media-timeline-toolbar">
    <div class="nl-media-timeline-controls">
      <button class="nl-media-timeline-btn" aria-label="Play">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <button class="nl-media-timeline-btn" aria-label="Stop">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
      </button>
      <div class="nl-media-timeline-timecode">00:01:24:15</div>
    </div>
    <div class="nl-media-timeline-tools">
      <button class="nl-media-timeline-tool-btn nl-active">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-7-4-7 4Z"/></svg>
        <span>Select</span>
      </button>
      <button class="nl-media-timeline-tool-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2 2 22"/><path d="M17 2h5v5"/><path d="M7 22H2v-5"/></svg>
        <span>Split</span>
      </button>
    </div>
  </div>

  <!-- Ruler -->
  <div class="nl-media-timeline-ruler">
    <div class="nl-media-timeline-ticks">
      <span class="nl-media-timeline-tick">00:00</span>
      <span class="nl-media-timeline-tick">00:30</span>
      <span class="nl-media-timeline-tick">01:00</span>
      <span class="nl-media-timeline-tick">01:30</span>
      <span class="nl-media-timeline-tick">02:00</span>
      <span class="nl-media-timeline-tick">02:30</span>
      <span class="nl-media-timeline-tick">03:00</span>
    </div>
  </div>

  <!-- Tracks space -->
  <div class="nl-media-timeline-workspace">
    <!-- Playhead line -->
    <div class="nl-media-timeline-playhead">
      <div class="nl-media-timeline-playhead-handle"></div>
    </div>

    <!-- Tracks container -->
    <div class="nl-media-timeline-tracks">
      
      <!-- Video Track 1 -->
      <div class="nl-media-timeline-track">
        <div class="nl-media-timeline-track-header">
          <span class="nl-media-timeline-track-title">Video 1</span>
          <div class="nl-media-timeline-track-controls">
            <button class="nl-media-timeline-track-btn" aria-label="Mute Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 8v8h5l5 5V3L7 8H2Z"/></svg>
            </button>
            <button class="nl-media-timeline-track-btn" aria-label="Lock Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
          </div>
        </div>
        <div class="nl-media-timeline-track-lane">
          <div class="nl-media-timeline-clip nl-media-timeline-clip-video" style="width: 140px; margin-left: 20px;">
            <span class="nl-media-timeline-clip-name">intro_scene.mp4</span>
            <span class="nl-media-timeline-clip-duration">00:30</span>
          </div>
          <div class="nl-media-timeline-clip nl-media-timeline-clip-video" style="width: 220px;">
            <span class="nl-media-timeline-clip-name">main_interview.mp4</span>
            <span class="nl-media-timeline-clip-duration">01:45</span>
          </div>
        </div>
      </div>

      <!-- Audio Track 1 -->
      <div class="nl-media-timeline-track">
        <div class="nl-media-timeline-track-header">
          <span class="nl-media-timeline-track-title">Audio 1</span>
          <div class="nl-media-timeline-track-controls">
            <button class="nl-media-timeline-track-btn nl-active" aria-label="Mute Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/><path d="M11 5 6 9H2v6h4l5 4V5Z"/></svg>
            </button>
            <button class="nl-media-timeline-track-btn" aria-label="Lock Track">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
          </div>
        </div>
        <div class="nl-media-timeline-track-lane">
          <div class="nl-media-timeline-clip nl-media-timeline-clip-audio" style="width: 140px; margin-left: 20px;">
            <span class="nl-media-timeline-clip-name">bg_music.wav</span>
            <span class="nl-media-timeline-clip-duration">00:30</span>
          </div>
          <div class="nl-media-timeline-clip nl-media-timeline-clip-audio" style="width: 220px;">
            <span class="nl-media-timeline-clip-name">voiceover.wav</span>
            <span class="nl-media-timeline-clip-duration">01:45</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>`
      }
    ],
    [
      { name: ".nl-media-timeline", desc: "Main media workspace wrapper box." },
      { name: ".nl-media-timeline-toolbar", desc: "Upper shelf container for editing tools and player buttons." },
      { name: ".nl-media-timeline-timecode", desc: "Monospaced frames position label." },
      { name: ".nl-media-timeline-ruler", desc: "Horizontal duration intervals header bar." },
      { name: ".nl-media-timeline-playhead", desc: "Vertical red/accent pointer indicator bar." },
      { name: ".nl-media-timeline-track", desc: "Full row containing a track title block and clip lane." },
      { name: ".nl-media-timeline-track-header", desc: "Fixed left sidebar panel detailing track name." },
      { name: ".nl-media-timeline-track-lane", desc: "Horizontal flow workspace for cutting media cards." },
      { name: ".nl-media-timeline-clip", desc: "Individual video/audio asset segment blocks." },
      { name: ".nl-media-timeline-clip-video", desc: "Modifier styling dash frame thumbnail lines." },
      { name: ".nl-media-timeline-clip-audio", desc: "Modifier styling vertical wave indicators." }
    ],
    "Keep child clip lanes wrapping dynamic. Offset time rulers spacing to align precisely with clip body starts.",
    "Tweak waveform background colors with <code>--primary</code> and adjustment tracks padding values."
  );

  // --- FORM CONTROLS ---

  // Checkbox
  PAGES.checkbox = renderComponentPage(
    "Checkbox",
    "Styled checkbox inputs for single and multiple selections. Supports size variants and color states.",
    [
      {
        title: "Basic Checkboxes",
        desc: "Default checkbox styles with label support.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-3">
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox" checked>
    <span>Accept terms and conditions</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox">
    <span>Subscribe to newsletter</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox" id="checkbox-indeterminate">
    <span>Indeterminate state</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox" disabled checked>
    <span class="nl-text-muted">Disabled checked option</span>
  </label>
</div>
<script>
  setTimeout(() => {
    const el = document.getElementById('checkbox-indeterminate');
    if (el) el.indeterminate = true;
  }, 100);
</script>`,
        code: `<label class="nl-checkbox-label">
  <input type="checkbox" class="nl-checkbox" checked>
  <span>Accept terms and conditions</span>
</label>

<label class="nl-checkbox-label">
  <input type="checkbox" class="nl-checkbox" id="my-checkbox">
  <span>Indeterminate Checkbox</span>
</label>
<script>
  document.getElementById('my-checkbox').indeterminate = true;
</script>`
      },
      {
        title: "Color Modifiers",
        desc: "Add color modifiers to match your brand style.",
        preview: `<div class="nl-flex nl-flex-wrap nl-gap-4">
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox nl-checkbox-primary" checked>
    <span>Primary</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox nl-checkbox-secondary" checked>
    <span>Secondary</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox nl-checkbox-success" checked>
    <span>Success</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox nl-checkbox-warning" checked>
    <span>Warning</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox nl-checkbox-error" checked>
    <span>Error</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox nl-checkbox-info" checked>
    <span>Info</span>
  </label>
</div>`,
        code: `<input type="checkbox" class="nl-checkbox nl-checkbox-primary" checked>
<input type="checkbox" class="nl-checkbox nl-checkbox-secondary" checked>
<input type="checkbox" class="nl-checkbox nl-checkbox-success" checked>
<input type="checkbox" class="nl-checkbox nl-checkbox-warning" checked>
<input type="checkbox" class="nl-checkbox nl-checkbox-error" checked>
<input type="checkbox" class="nl-checkbox nl-checkbox-info" checked>`
      },
      {
        title: "Size Variants",
        desc: "Small, default, and large checkbox sizes.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <label class="nl-checkbox-label nl-checkbox-sm">
    <input type="checkbox" class="nl-checkbox nl-checkbox-sm" checked>
    <span>Small</span>
  </label>
  <label class="nl-checkbox-label">
    <input type="checkbox" class="nl-checkbox" checked>
    <span>Default</span>
  </label>
  <label class="nl-checkbox-label nl-checkbox-lg">
    <input type="checkbox" class="nl-checkbox nl-checkbox-lg" checked>
    <span>Large</span>
  </label>
</div>`,
        code: `<input type="checkbox" class="nl-checkbox nl-checkbox-sm" checked>
<input type="checkbox" class="nl-checkbox" checked>
<input type="checkbox" class="nl-checkbox nl-checkbox-lg" checked>`
      }
    ],
    [
      { name: ".nl-checkbox", desc: "Base styled checkbox using appearance: none." },
      { name: ".nl-checkbox-primary", desc: "Primary accent color." },
      { name: ".nl-checkbox-secondary", desc: "Secondary accent color." },
      { name: ".nl-checkbox-success", desc: "Green success state." },
      { name: ".nl-checkbox-warning", desc: "Orange/Yellow warning state." },
      { name: ".nl-checkbox-error", desc: "Red destructive/error state." },
      { name: ".nl-checkbox-info", desc: "Dark grey/Blue informative state." },
      { name: ".nl-checkbox-sm", desc: "Small size variant (0.875rem)." },
      { name: ".nl-checkbox-lg", desc: "Large size variant (1.375rem)." },
      { name: ".nl-checkbox-label", desc: "Flex wrapper for alignment of checkbox and text." }
    ]
  );

  // Radio
  PAGES.radio = renderComponentPage(
    "Radio",
    "Styled radio button groups for single-choice selections.",
    [
      {
        title: "Radio Group",
        desc: "Group radio buttons for mutually exclusive selections.",
        preview: `<div class="nl-radio-group">
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio" name="plan" value="free" checked>
    <span>Free Plan</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio" name="plan" value="pro">
    <span>Pro Plan</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio" name="plan" value="enterprise" disabled>
    <span class="nl-text-muted">Enterprise Plan (Disabled)</span>
  </label>
</div>`,
        code: `<div class="nl-radio-group">
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio" name="plan" checked>
    <span>Free Plan</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio" name="plan">
    <span>Pro Plan</span>
  </label>
</div>`
      },
      {
        title: "Color Modifiers",
        desc: "Add color modifiers to match your brand style.",
        preview: `<div class="nl-flex nl-flex-wrap nl-gap-4">
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio nl-radio-primary" name="c-radio" checked>
    <span>Primary</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio nl-radio-secondary" name="c-radio">
    <span>Secondary</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio nl-radio-success" name="c-radio">
    <span>Success</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio nl-radio-warning" name="c-radio">
    <span>Warning</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio nl-radio-error" name="c-radio">
    <span>Error</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio nl-radio-info" name="c-radio">
    <span>Info</span>
  </label>
</div>`,
        code: `<input type="radio" class="nl-radio nl-radio-primary" checked>
<input type="radio" class="nl-radio nl-radio-secondary" checked>
<input type="radio" class="nl-radio nl-radio-success" checked>
<input type="radio" class="nl-radio nl-radio-warning" checked>
<input type="radio" class="nl-radio nl-radio-error" checked>
<input type="radio" class="nl-radio nl-radio-info" checked>`
      },
      {
        title: "Size Variants",
        desc: "Small, default, and large radio sizes.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <label class="nl-radio-label nl-radio-sm">
    <input type="radio" class="nl-radio nl-radio-sm" name="sizes" checked>
    <span>Small</span>
  </label>
  <label class="nl-radio-label">
    <input type="radio" class="nl-radio" name="sizes">
    <span>Default</span>
  </label>
  <label class="nl-radio-label nl-radio-lg">
    <input type="radio" class="nl-radio nl-radio-lg" name="sizes">
    <span>Large</span>
  </label>
</div>`,
        code: `<input type="radio" class="nl-radio nl-radio-sm" checked>
<input type="radio" class="nl-radio" checked>
<input type="radio" class="nl-radio nl-radio-lg" checked>`
      }
    ],
    [
      { name: ".nl-radio", desc: "Styled radio input with circular indicator dot." },
      { name: ".nl-radio-primary", desc: "Primary accent color." },
      { name: ".nl-radio-secondary", desc: "Secondary accent color." },
      { name: ".nl-radio-success", desc: "Green success state." },
      { name: ".nl-radio-warning", desc: "Orange warning state." },
      { name: ".nl-radio-error", desc: "Red destructive/error state." },
      { name: ".nl-radio-info", desc: "Blue/Grey informative state." },
      { name: ".nl-radio-sm", desc: "Small size variant (0.875rem)." },
      { name: ".nl-radio-lg", desc: "Large size variant (1.375rem)." },
      { name: ".nl-radio-label", desc: "Flex wrapper pairing radio input with a label." },
      { name: ".nl-radio-group", desc: "Vertical stack container for radio options." },
      { name: ".nl-radio-group-row", desc: "Horizontal inline row container for radio options." }
    ]
  );

  // Toggle
  PAGES.toggle = renderComponentPage(
    "Toggle / Switch",
    "CSS-only toggle switch for on/off boolean controls.",
    [
      {
        title: "Basic Toggle",
        desc: "A smooth on/off switch using a styled checkbox.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4">
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle" checked>
    <span>Dark Mode</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle">
    <span>Notifications</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle" disabled checked>
    <span class="nl-text-muted">Disabled checked option</span>
  </label>
</div>`,
        code: `<label class="nl-toggle-label">
  <input type="checkbox" class="nl-toggle" checked>
  <span>Dark Mode</span>
</label>`
      },
      {
        title: "Color Modifiers",
        desc: "Add color modifiers to toggle switches.",
        preview: `<div class="nl-flex nl-flex-wrap nl-gap-6">
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle nl-toggle-primary" checked>
    <span>Primary</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle nl-toggle-secondary" checked>
    <span>Secondary</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle nl-toggle-success" checked>
    <span>Success</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle nl-toggle-warning" checked>
    <span>Warning</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle nl-toggle-error" checked>
    <span>Error</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle nl-toggle-info" checked>
    <span>Info</span>
  </label>
</div>`,
        code: `<input type="checkbox" class="nl-toggle nl-toggle-primary" checked>
<input type="checkbox" class="nl-toggle nl-toggle-success" checked>
<input type="checkbox" class="nl-toggle nl-toggle-error" checked>`
      },
      {
        title: "Size Variants",
        desc: "Small, default, and large toggle sizes.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <label class="nl-toggle-label nl-toggle-sm">
    <input type="checkbox" class="nl-toggle nl-toggle-sm" checked>
    <span>Small</span>
  </label>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle" checked>
    <span>Default</span>
  </label>
  <label class="nl-toggle-label nl-toggle-lg">
    <input type="checkbox" class="nl-toggle nl-toggle-lg" checked>
    <span>Large</span>
  </label>
</div>`,
        code: `<input type="checkbox" class="nl-toggle nl-toggle-sm" checked>
<input type="checkbox" class="nl-toggle" checked>
<input type="checkbox" class="nl-toggle nl-toggle-lg" checked>`
      }
    ],
    [
      { name: ".nl-toggle", desc: "The toggle input — styled directly as an oval track with sliding thumb." },
      { name: ".nl-toggle-primary", desc: "Primary track color." },
      { name: ".nl-toggle-secondary", desc: "Secondary track color." },
      { name: ".nl-toggle-success", desc: "Green success track." },
      { name: ".nl-toggle-warning", desc: "Yellow warning track." },
      { name: ".nl-toggle-error", desc: "Red destructive track." },
      { name: ".nl-toggle-info", desc: "Dark informative track." },
      { name: ".nl-toggle-sm", desc: "Compact size variant." },
      { name: ".nl-toggle-lg", desc: "Larger size variant." },
      { name: ".nl-toggle-label", desc: "Flex row wrapper for toggle + label text." }
    ]
  );

  // Select
  PAGES.select = renderComponentPage(
    "Select",
    "Styled native select dropdown — same height and feel as the input field.",
    [
      {
        title: "Basic Select",
        desc: "A native select element with custom styling and chevron.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 20rem;">
  <select class="nl-select">
    <option value="">Choose a framework</option>
    <option value="react">React</option>
    <option value="vue">Vue</option>
    <option value="svelte">Svelte</option>
  </select>
  <select class="nl-select" disabled>
    <option>Disabled select</option>
  </select>
</div>`,
        code: `<select class="nl-select">
  <option value="">Choose an option</option>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>`
      },
      {
        title: "Color Modifiers",
        desc: "Apply color modifiers to the border and focus states.",
        preview: `<div class="nl-grid nl-grid-cols-1 md:nl-grid-cols-2 nl-gap-4" style="max-width: 32rem;">
  <select class="nl-select nl-select-primary">
    <option>Primary border</option>
  </select>
  <select class="nl-select nl-select-secondary">
    <option>Secondary border</option>
  </select>
  <select class="nl-select nl-select-success">
    <option>Success border</option>
  </select>
  <select class="nl-select nl-select-warning">
    <option>Warning border</option>
  </select>
  <select class="nl-select nl-select-error">
    <option>Error border</option>
  </select>
  <select class="nl-select nl-select-info">
    <option>Info border</option>
  </select>
</div>`,
        code: `<select class="nl-select nl-select-primary"><option>Primary</option></select>
<select class="nl-select nl-select-success"><option>Success</option></select>`
      },
      {
        title: "Size Variants",
        desc: "Small, default, and large dropdown sizes.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 20rem;">
  <select class="nl-select nl-select-sm">
    <option>Small select</option>
  </select>
  <select class="nl-select">
    <option>Default select</option>
  </select>
  <select class="nl-select nl-select-lg">
    <option>Large select</option>
  </select>
</div>`,
        code: `<select class="nl-select nl-select-sm">...</select>
<select class="nl-select">...</select>
<select class="nl-select nl-select-lg">...</select>`
      }
    ],
    [
      { name: ".nl-select", desc: "Base styled native select with custom chevron arrow." },
      { name: ".nl-select-primary", desc: "Primary colored focus state." },
      { name: ".nl-select-success", desc: "Success state dropdown." },
      { name: ".nl-select-warning", desc: "Warning state dropdown." },
      { name: ".nl-select-error", desc: "Error/destructive state dropdown." },
      { name: ".nl-select-info", desc: "Informative state dropdown." },
      { name: ".nl-select-sm", desc: "Small height variant (2rem)." },
      { name: ".nl-select-lg", desc: "Large height variant (3rem)." }
    ]
  );

  // Textarea
  PAGES.textarea = renderComponentPage(
    "Textarea",
    "Multi-line text input with consistent styling matching the input field family.",
    [
      {
        title: "Basic Textarea",
        desc: "A resizable multi-line text area.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 28rem;">
  <textarea class="nl-textarea" rows="3" placeholder="Write your message here..."></textarea>
  <textarea class="nl-textarea" rows="2" placeholder="Disabled textarea" disabled></textarea>
</div>`,
        code: `<textarea class="nl-textarea" rows="4" placeholder="Write your message here..."></textarea>`
      },
      {
        title: "Color Modifiers",
        desc: "Apply color modifiers to the border and focus states.",
        preview: `<div class="nl-grid nl-grid-cols-1 md:nl-grid-cols-2 nl-gap-4" style="max-width: 32rem;">
  <textarea class="nl-textarea nl-textarea-primary" rows="2" placeholder="Primary border"></textarea>
  <textarea class="nl-textarea nl-textarea-secondary" rows="2" placeholder="Secondary border"></textarea>
  <textarea class="nl-textarea nl-textarea-success" rows="2" placeholder="Success border"></textarea>
  <textarea class="nl-textarea nl-textarea-warning" rows="2" placeholder="Warning border"></textarea>
  <textarea class="nl-textarea nl-textarea-error" rows="2" placeholder="Error border"></textarea>
  <textarea class="nl-textarea nl-textarea-info" rows="2" placeholder="Info border"></textarea>
</div>`,
        code: `<textarea class="nl-textarea nl-textarea-success" placeholder="Success..."></textarea>
<textarea class="nl-textarea nl-textarea-error" placeholder="Error..."></textarea>`
      },
      {
        title: "Size Variants",
        desc: "Small, default, and large textarea padding/sizes.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 28rem;">
  <textarea class="nl-textarea nl-textarea-sm" rows="2" placeholder="Small textarea"></textarea>
  <textarea class="nl-textarea" rows="2" placeholder="Default textarea"></textarea>
  <textarea class="nl-textarea nl-textarea-lg" rows="2" placeholder="Large textarea"></textarea>
</div>`,
        code: `<textarea class="nl-textarea nl-textarea-sm">...</textarea>
<textarea class="nl-textarea">...</textarea>
<textarea class="nl-textarea nl-textarea-lg">...</textarea>`
      }
    ],
    [
      { name: ".nl-textarea", desc: "Styled textarea with consistent border, radius, and padding matching inputs." },
      { name: ".nl-textarea-primary", desc: "Primary colored focus state." },
      { name: ".nl-textarea-success", desc: "Success state textarea." },
      { name: ".nl-textarea-warning", desc: "Warning state textarea." },
      { name: ".nl-textarea-error", desc: "Error/destructive state textarea." },
      { name: ".nl-textarea-info", desc: "Informative state textarea." },
      { name: ".nl-textarea-sm", desc: "Small padding/text size textarea." },
      { name: ".nl-textarea-lg", desc: "Large padding/text size textarea." }
    ]
  );

  // Range
  PAGES.range = renderComponentPage(
    "Range / Slider",
    "Styled range input slider for selecting numeric values within a range.",
    [
      {
        title: "Basic Range Slider",
        desc: "A smooth range slider with custom track and thumb.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-6" style="max-width: 24rem;">
  <div>
    <label class="nl-text-sm nl-font-medium nl-mb-2 nl-block">Volume</label>
    <input type="range" class="nl-range" min="0" max="100" value="60" style="--nl-range-fill: 60%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  </div>
  <div>
    <label class="nl-text-sm nl-font-medium nl-mb-2 nl-block">Disabled</label>
    <input type="range" class="nl-range" min="0" max="100" value="40" style="--nl-range-fill: 40%;" disabled>
  </div>
</div>`,
        code: `<input type="range" class="nl-range" min="0" max="100" value="60" style="--nl-range-fill: 60%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">`
      },
      {
        title: "Color Modifiers",
        desc: "Style the slider thumb and progress track with color variants.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 24rem;">
  <input type="range" class="nl-range nl-range-primary" min="0" max="100" value="80" style="--nl-range-fill: 80%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range nl-range-secondary" min="0" max="100" value="70" style="--nl-range-fill: 70%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range nl-range-success" min="0" max="100" value="60" style="--nl-range-fill: 60%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range nl-range-warning" min="0" max="100" value="50" style="--nl-range-fill: 50%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range nl-range-error" min="0" max="100" value="40" style="--nl-range-fill: 40%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range nl-range-info" min="0" max="100" value="30" style="--nl-range-fill: 30%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
</div>`,
        code: `<input type="range" class="nl-range nl-range-success" value="60" style="--nl-range-fill: 60%;">
<input type="range" class="nl-range nl-range-error" value="40" style="--nl-range-fill: 40%;">`
      },
      {
        title: "Size Variants",
        desc: "Small, default, and large slider heights.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 24rem;">
  <input type="range" class="nl-range nl-range-sm" min="0" max="100" value="40" style="--nl-range-fill: 40%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range" min="0" max="100" value="50" style="--nl-range-fill: 50%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
  <input type="range" class="nl-range nl-range-lg" min="0" max="100" value="60" style="--nl-range-fill: 60%;" oninput="this.style.setProperty('--nl-range-fill', this.value + '%')">
</div>`,
        code: `<input type="range" class="nl-range nl-range-sm" value="40">
<input type="range" class="nl-range" value="50">
<input type="range" class="nl-range nl-range-lg" value="60">`
      }
    ],
    [
      { name: ".nl-range", desc: "Base styled range input with custom track and thumb." },
      { name: ".nl-range-primary", desc: "Primary colored track and thumb." },
      { name: ".nl-range-success", desc: "Success colored track and thumb." },
      { name: ".nl-range-warning", desc: "Warning colored track and thumb." },
      { name: ".nl-range-error", desc: "Error/destructive colored track and thumb." },
      { name: ".nl-range-info", desc: "Informative colored track and thumb." },
      { name: ".nl-range-sm", desc: "Thinner track and smaller thumb variant." },
      { name: ".nl-range-lg", desc: "Thicker track and larger thumb variant." }
    ]
  );

  // --- DISPLAY COMPONENTS ---

  // Rating
  PAGES.rating = renderComponentPage(
    "Rating",
    "Star rating display widget for product reviews, user feedback, and scoring.",
    [
      {
        title: "Star Rating Display",
        desc: "Non-interactive star rating for displaying scores.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4">
  <div class="nl-rating">
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star">★</span>
  </div>
  <div class="nl-rating nl-rating-sm">
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star">★</span>
    <span class="nl-rating-star">★</span>
  </div>
  <div class="nl-rating nl-rating-lg">
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
    <span class="nl-rating-star nl-rating-star-filled">★</span>
  </div>
</div>`,
        code: `<div class="nl-rating">
  <span class="nl-rating-star nl-rating-star-filled">★</span>
  <span class="nl-rating-star nl-rating-star-filled">★</span>
  <span class="nl-rating-star nl-rating-star-filled">★</span>
  <span class="nl-rating-star nl-rating-star-filled">★</span>
  <span class="nl-rating-star">★</span>
</div>`
      }
    ],
    [
      { name: ".nl-rating", desc: "Flex container for a row of star rating elements." },
      { name: ".nl-rating-star", desc: "Individual star element (empty/unfilled)." },
      { name: ".nl-rating-star-filled", desc: "Modifier for active/filled star color." },
      { name: ".nl-rating-sm", desc: "Small size variant." },
      { name: ".nl-rating-lg", desc: "Large size variant." }
    ]
  );

  // Loading
  PAGES.loading = renderComponentPage(
    "Loading",
    "Various loading indicator animations for async states and content placeholders.",
    [
      {
        title: "Loading Spinners",
        desc: "Circular spinner indicators in multiple sizes.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <span class="nl-loading nl-loading-spinner nl-loading-sm"></span>
  <span class="nl-loading nl-loading-spinner"></span>
  <span class="nl-loading nl-loading-spinner nl-loading-lg"></span>
</div>`,
        code: `<span class="nl-loading nl-loading-spinner"></span>
<span class="nl-loading nl-loading-spinner nl-loading-lg"></span>`
      },
      {
        title: "Loading Dots",
        desc: "Three bouncing dots animation.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <span class="nl-loading nl-loading-dots nl-loading-sm"></span>
  <span class="nl-loading nl-loading-dots"></span>
  <span class="nl-loading nl-loading-dots nl-loading-lg"></span>
</div>`,
        code: `<span class="nl-loading nl-loading-dots"></span>`
      },
      {
        title: "Loading Pulse",
        desc: "Pulsing circle for minimal inline loading states.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <span class="nl-loading nl-loading-pulse nl-loading-sm"></span>
  <span class="nl-loading nl-loading-pulse"></span>
  <span class="nl-loading nl-loading-pulse nl-loading-lg"></span>
</div>`,
        code: `<span class="nl-loading nl-loading-pulse"></span>`
      },
      {
        title: "Loading Bars",
        desc: "Animated vertical bars equalizer effect.",
        preview: `<div class="nl-flex nl-items-center nl-gap-6">
  <span class="nl-loading nl-loading-bars nl-loading-sm"></span>
  <span class="nl-loading nl-loading-bars"></span>
  <span class="nl-loading nl-loading-bars nl-loading-lg"></span>
</div>`,
        code: `<span class="nl-loading nl-loading-bars"></span>`
      }
    ],
    [
      { name: ".nl-loading", desc: "Base loading class — apply alongside a type modifier." },
      { name: ".nl-loading-spinner", desc: "Rotating circular border spinner." },
      { name: ".nl-loading-dots", desc: "Three bouncing dots animation." },
      { name: ".nl-loading-pulse", desc: "Pulsing filled circle." },
      { name: ".nl-loading-bars", desc: "Animated vertical bar equalizer." },
      { name: ".nl-loading-sm", desc: "Small size variant." },
      { name: ".nl-loading-lg", desc: "Large size variant." }
    ]
  );

  // Stat
  PAGES.stat = renderComponentPage(
    "Stat",
    "KPI and statistics display cards for dashboards and data summaries.",
    [
      {
        title: "Basic Stat Cards",
        desc: "Display key metrics with title, value, and description.",
        preview: `<div class="nl-stat-group">
  <div class="nl-stat">
    <div class="nl-stat-title">Total Revenue</div>
    <div class="nl-stat-value">$89,400</div>
    <div class="nl-stat-desc">↑ 12% from last month</div>
  </div>
  <div class="nl-stat">
    <div class="nl-stat-title">Active Users</div>
    <div class="nl-stat-value">24,589</div>
    <div class="nl-stat-desc">↑ 4.2% from last week</div>
  </div>
  <div class="nl-stat">
    <div class="nl-stat-title">Conversion Rate</div>
    <div class="nl-stat-value">3.6%</div>
    <div class="nl-stat-desc">↓ 0.3% below average</div>
  </div>
</div>`,
        code: `<div class="nl-stat-group">
  <div class="nl-stat">
    <div class="nl-stat-title">Total Revenue</div>
    <div class="nl-stat-value">$89,400</div>
    <div class="nl-stat-desc">↑ 12% from last month</div>
  </div>
</div>`
      },
      {
        title: "Stat with Figure",
        desc: "Stat card with an icon or avatar figure.",
        preview: `<div class="nl-stat-group">
  <div class="nl-stat">
    <div class="nl-stat-figure">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    </div>
    <div class="nl-stat-title">Earnings</div>
    <div class="nl-stat-value nl-stat-primary">$4,200</div>
    <div class="nl-stat-desc">January — March</div>
  </div>
</div>`,
        code: `<div class="nl-stat">
  <div class="nl-stat-figure"><!-- icon --></div>
  <div class="nl-stat-title">Earnings</div>
  <div class="nl-stat-value nl-stat-primary">$4,200</div>
  <div class="nl-stat-desc">January — March</div>
</div>`
      }
    ],
    [
      { name: ".nl-stat", desc: "Individual stat card container with card-style background." },
      { name: ".nl-stat-title", desc: "Small muted label above the main value." },
      { name: ".nl-stat-value", desc: "Large bold metric number or value." },
      { name: ".nl-stat-desc", desc: "Small muted context text below the value." },
      { name: ".nl-stat-figure", desc: "Optional icon or image area on the side." },
      { name: ".nl-stat-group", desc: "Flex/grid container for displaying multiple stat cards." },
      { name: ".nl-stat-primary", desc: "Applies primary accent color to the value." }
    ]
  );

  // Countdown
  PAGES.countdown = renderComponentPage(
    "Countdown",
    "Countdown timer display with animated time unit blocks.",
    [
      {
        title: "Countdown Timer Display",
        desc: "Display remaining time split into days, hours, minutes, and seconds.",
        preview: `<div class="nl-countdown">
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">02</span>
    <span class="nl-countdown-label">days</span>
  </div>
  <span class="nl-countdown-sep">:</span>
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">14</span>
    <span class="nl-countdown-label">hrs</span>
  </div>
  <span class="nl-countdown-sep">:</span>
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">37</span>
    <span class="nl-countdown-label">min</span>
  </div>
  <span class="nl-countdown-sep">:</span>
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">09</span>
    <span class="nl-countdown-label">sec</span>
  </div>
</div>`,
        code: `<div class="nl-countdown">
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">14</span>
    <span class="nl-countdown-label">hrs</span>
  </div>
  <span class="nl-countdown-sep">:</span>
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">37</span>
    <span class="nl-countdown-label">min</span>
  </div>
</div>`
      },
      {
        title: "Large Countdown",
        desc: "Larger variant for prominent hero countdowns.",
        preview: `<div class="nl-countdown nl-countdown-lg">
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">00</span>
    <span class="nl-countdown-label">hrs</span>
  </div>
  <span class="nl-countdown-sep">:</span>
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">30</span>
    <span class="nl-countdown-label">min</span>
  </div>
  <span class="nl-countdown-sep">:</span>
  <div class="nl-countdown-item">
    <span class="nl-countdown-value">00</span>
    <span class="nl-countdown-label">sec</span>
  </div>
</div>`,
        code: `<div class="nl-countdown nl-countdown-lg">...</div>`
      }
    ],
    [
      { name: ".nl-countdown", desc: "Flex container holding countdown time unit blocks." },
      { name: ".nl-countdown-item", desc: "Individual time unit block (card-style)." },
      { name: ".nl-countdown-value", desc: "Large monospace number value." },
      { name: ".nl-countdown-label", desc: "Small muted label (days, hrs, min, sec)." },
      { name: ".nl-countdown-sep", desc: "Colon separator between countdown items." },
      { name: ".nl-countdown-sm", desc: "Smaller variant." },
      { name: ".nl-countdown-lg", desc: "Larger hero variant." }
    ]
  );

  // Kbd
  PAGES.kbd = renderComponentPage(
    "Kbd",
    "Keyboard key display for shortcut references and command documentation.",
    [
      {
        title: "Keyboard Keys",
        desc: "Display individual keyboard keys with a 3D pressed appearance.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4">
  <div class="nl-flex nl-gap-2 nl-items-center">
    <kbd class="nl-kbd">Ctrl</kbd>
    <span class="nl-text-muted">+</span>
    <kbd class="nl-kbd">K</kbd>
    <span class="nl-text-sm nl-text-muted nl-ml-2">Open command palette</span>
  </div>
  <div class="nl-flex nl-gap-2 nl-items-center">
    <kbd class="nl-kbd nl-kbd-sm">Alt</kbd>
    <span class="nl-text-muted">+</span>
    <kbd class="nl-kbd nl-kbd-sm">F4</kbd>
    <span class="nl-text-sm nl-text-muted nl-ml-2">Close window (sm)</span>
  </div>
  <div class="nl-flex nl-gap-2 nl-items-center">
    <kbd class="nl-kbd nl-kbd-lg">Esc</kbd>
    <span class="nl-text-sm nl-text-muted nl-ml-2">Dismiss (lg)</span>
  </div>
</div>`,
        code: `<kbd class="nl-kbd">Ctrl</kbd> + <kbd class="nl-kbd">K</kbd>`
      }
    ],
    [
      { name: ".nl-kbd", desc: "Keyboard key display with border, shadow, and monospace font." },
      { name: ".nl-kbd-sm", desc: "Smaller key size." },
      { name: ".nl-kbd-lg", desc: "Larger key size." }
    ]
  );

  // --- LAYOUT COMPONENTS ---

  // Steps
  PAGES.steps = renderComponentPage(
    "Steps",
    "Step wizard indicator for multi-step forms, onboarding flows, and progress tracking.",
    [
      {
        title: "Horizontal Steps",
        desc: "Step indicator with numbered circles and connecting line.",
        preview: `<div class="nl-steps">
  <div class="nl-step nl-step-complete">
    <div class="nl-step-circle">✓</div>
    <span class="nl-step-label">Account</span>
  </div>
  <div class="nl-step nl-step-active">
    <div class="nl-step-circle">2</div>
    <span class="nl-step-label">Profile</span>
  </div>
  <div class="nl-step">
    <div class="nl-step-circle">3</div>
    <span class="nl-step-label">Review</span>
  </div>
  <div class="nl-step">
    <div class="nl-step-circle">4</div>
    <span class="nl-step-label">Done</span>
  </div>
</div>`,
        code: `<div class="nl-steps">
  <div class="nl-step nl-step-complete">
    <div class="nl-step-circle">✓</div>
    <span class="nl-step-label">Account</span>
  </div>
  <div class="nl-step nl-step-active">
    <div class="nl-step-circle">2</div>
    <span class="nl-step-label">Profile</span>
  </div>
  <div class="nl-step">
    <div class="nl-step-circle">3</div>
    <span class="nl-step-label">Review</span>
  </div>
</div>`
      }
    ],
    [
      { name: ".nl-steps", desc: "Horizontal flex container for step indicators." },
      { name: ".nl-step", desc: "Individual step with circle and label." },
      { name: ".nl-step-active", desc: "Current active step — primary color circle." },
      { name: ".nl-step-complete", desc: "Completed step — success color with checkmark." },
      { name: ".nl-step-circle", desc: "The numbered/icon circle element." },
      { name: ".nl-step-label", desc: "Text label below the circle." },
      { name: ".nl-steps-vertical", desc: "Vertical stack variant." }
    ]
  );

  // Menu
  PAGES.menu = renderComponentPage(
    "Menu",
    "Vertical and horizontal navigation menu list for sidebar and dropdown menus.",
    [
      {
        title: "Vertical Menu",
        desc: "Standard vertical navigation menu with sections.",
        preview: `<div class="nl-menu" style="max-width: 14rem;">
  <span class="nl-menu-title">General</span>
  <a href="#" class="nl-menu-item active">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    Dashboard
  </a>
  <a href="#" class="nl-menu-item">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    Profile
  </a>
  <a href="#" class="nl-menu-item">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"/></svg>
    Settings
  </a>
  <div class="nl-menu-divider"></div>
  <span class="nl-menu-title">Support</span>
  <a href="#" class="nl-menu-item">Help Center</a>
  <a href="#" class="nl-menu-item">Documentation</a>
</div>`,
        code: `<div class="nl-menu">
  <span class="nl-menu-title">General</span>
  <a href="#" class="nl-menu-item active">Dashboard</a>
  <a href="#" class="nl-menu-item">Settings</a>
  <div class="nl-menu-divider"></div>
  <a href="#" class="nl-menu-item">Help</a>
</div>`
      },
      {
        title: "Horizontal Menu",
        desc: "Inline horizontal nav menu for toolbars.",
        preview: `<div class="nl-menu nl-menu-horizontal">
  <a href="#" class="nl-menu-item active">Home</a>
  <a href="#" class="nl-menu-item">About</a>
  <a href="#" class="nl-menu-item">Services</a>
  <a href="#" class="nl-menu-item">Contact</a>
</div>`,
        code: `<div class="nl-menu nl-menu-horizontal">
  <a href="#" class="nl-menu-item active">Home</a>
  <a href="#" class="nl-menu-item">About</a>
</div>`
      }
    ],
    [
      { name: ".nl-menu", desc: "Base vertical navigation menu container." },
      { name: ".nl-menu-item", desc: "Individual menu link — full-width with hover state." },
      { name: ".nl-menu-item.active", desc: "Active/selected menu item with primary highlight." },
      { name: ".nl-menu-title", desc: "Section heading label (small, uppercase, muted)." },
      { name: ".nl-menu-divider", desc: "Horizontal separator between menu groups." },
      { name: ".nl-menu-horizontal", desc: "Horizontal inline layout modifier." },
      { name: ".nl-menu-sm", desc: "Compact size variant." }
    ]
  );

  // Divider
  PAGES.divider = renderComponentPage(
    "Divider",
    "Horizontal and vertical dividers with optional text labels.",
    [
      {
        title: "Basic Divider",
        desc: "Simple horizontal line separator.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4">
  <p class="nl-text-sm">Content above</p>
  <div class="nl-divider"></div>
  <p class="nl-text-sm">Content below</p>
</div>`,
        code: `<div class="nl-divider"></div>`
      },
      {
        title: "Divider with Label",
        desc: "Divider with text in the center — useful for auth screens.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4" style="max-width: 24rem;">
  <div class="nl-divider">OR</div>
  <div class="nl-divider">Continue with</div>
  <div class="nl-divider nl-divider-muted">· · ·</div>
</div>`,
        code: `<div class="nl-divider">OR</div>`
      },
      {
        title: "Vertical Divider",
        desc: "Inline vertical separator between flex items.",
        preview: `<div class="nl-flex nl-items-center nl-gap-4" style="height: 2.5rem;">
  <span>Home</span>
  <div class="nl-divider nl-divider-vertical"></div>
  <span>About</span>
  <div class="nl-divider nl-divider-vertical"></div>
  <span>Contact</span>
</div>`,
        code: `<div class="nl-flex nl-items-center nl-gap-4">
  <span>Home</span>
  <div class="nl-divider nl-divider-vertical"></div>
  <span>About</span>
</div>`
      }
    ],
    [
      { name: ".nl-divider", desc: "Horizontal divider line. Accepts text content for center label." },
      { name: ".nl-divider-vertical", desc: "Vertical separator for use inside flex rows." },
      { name: ".nl-divider-primary", desc: "Primary accent color divider." },
      { name: ".nl-divider-muted", desc: "Softer muted color divider." }
    ]
  );

  // Join
  PAGES.join = renderComponentPage(
    "Join",
    "Groups child elements (buttons, inputs) into a seamless joined unit without gaps.",
    [
      {
        title: "Joined Buttons",
        desc: "Buttons joined together as a single unit — useful for toolbars and segmented controls.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-4">
  <div class="nl-join">
    <button class="nl-btn nl-btn-outline nl-join-item">Left</button>
    <button class="nl-btn nl-btn-outline nl-join-item">Center</button>
    <button class="nl-btn nl-btn-outline nl-join-item">Right</button>
  </div>
  <div class="nl-join">
    <button class="nl-btn nl-btn-primary nl-join-item">Bold</button>
    <button class="nl-btn nl-btn-outline nl-join-item">Italic</button>
    <button class="nl-btn nl-btn-outline nl-join-item">Underline</button>
  </div>
</div>`,
        code: `<div class="nl-join">
  <button class="nl-btn nl-btn-outline nl-join-item">Left</button>
  <button class="nl-btn nl-btn-outline nl-join-item">Center</button>
  <button class="nl-btn nl-btn-outline nl-join-item">Right</button>
</div>`
      },
      {
        title: "Joined Input with Button",
        desc: "Input field and button joined as a search bar.",
        preview: `<div class="nl-join" style="max-width: 24rem;">
  <input type="text" class="nl-input nl-join-item" placeholder="Search..." style="flex: 1;">
  <button class="nl-btn nl-btn-primary nl-join-item">Search</button>
</div>`,
        code: `<div class="nl-join">
  <input type="text" class="nl-input nl-join-item" placeholder="Search...">
  <button class="nl-btn nl-btn-primary nl-join-item">Search</button>
</div>`
      },
      {
        title: "Vertical Join",
        desc: "Vertically stacked joined elements.",
        preview: `<div class="nl-join nl-join-vertical" style="max-width: 12rem;">
  <button class="nl-btn nl-btn-outline nl-join-item">Top</button>
  <button class="nl-btn nl-btn-outline nl-join-item">Middle</button>
  <button class="nl-btn nl-btn-outline nl-join-item">Bottom</button>
</div>`,
        code: `<div class="nl-join nl-join-vertical">
  <button class="nl-btn nl-btn-outline nl-join-item">Top</button>
  <button class="nl-btn nl-btn-outline nl-join-item">Bottom</button>
</div>`
      }
    ],
    [
      { name: ".nl-join", desc: "Horizontal join container — removes gaps and merges adjacent borders." },
      { name: ".nl-join-item", desc: "Child element of the join group." },
      { name: ".nl-join-vertical", desc: "Vertical stacking join variant." }
    ]
  );

  // --- INTERACTIVE COMPONENTS ---

  // Collapse
  PAGES.collapse = renderComponentPage(
    "Collapse",
    "CSS-only collapsible panel using a hidden checkbox toggle for show/hide behavior.",
    [
      {
        title: "Basic Collapse",
        desc: "Click the title to expand or collapse content — no JavaScript required.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-2" style="max-width: 28rem;">
  <div class="nl-collapse">
    <input type="checkbox" class="nl-collapse-toggle" id="collapse-1">
    <label for="collapse-1" class="nl-collapse-title nl-collapse-arrow">What is Nova UI?</label>
    <div class="nl-collapse-content">
      <p>Nova UI is a lightweight, CSS-variable-based component library that requires no preprocessors or build steps.</p>
    </div>
  </div>
  <div class="nl-collapse">
    <input type="checkbox" class="nl-collapse-toggle" id="collapse-2" checked>
    <label for="collapse-2" class="nl-collapse-title nl-collapse-arrow">How do I install it?</label>
    <div class="nl-collapse-content">
      <p>Just link the <code>css/main.css</code> file in your HTML head tag. No build step needed.</p>
    </div>
  </div>
  <div class="nl-collapse">
    <input type="checkbox" class="nl-collapse-toggle" id="collapse-3">
    <label for="collapse-3" class="nl-collapse-title nl-collapse-plus">Can I customize it?</label>
    <div class="nl-collapse-content">
      <p>Yes! Override CSS variables in your <code>:root</code> to customize colors, radii, and spacing.</p>
    </div>
  </div>
</div>`,
        code: `<div class="nl-collapse">
  <input type="checkbox" class="nl-collapse-toggle" id="col-1">
  <label for="col-1" class="nl-collapse-title nl-collapse-arrow">Click to expand</label>
  <div class="nl-collapse-content">
    <p>Hidden content goes here.</p>
  </div>
</div>`
      }
    ],
    [
      { name: ".nl-collapse", desc: "Collapsible panel wrapper." },
      { name: ".nl-collapse-toggle", desc: "Hidden checkbox that drives the open/close state." },
      { name: ".nl-collapse-title", desc: "Clickable label/header row." },
      { name: ".nl-collapse-content", desc: "Expandable content area (max-height transition)." },
      { name: ".nl-collapse-arrow", desc: "Adds a rotating chevron arrow indicator." },
      { name: ".nl-collapse-plus", desc: "Uses +/- icon instead of arrow." }
    ]
  );

  // Chat
  PAGES.chat = renderComponentPage(
    "Chat Bubble",
    "Chat message bubble layout for messaging UIs and AI conversation interfaces.",
    [
      {
        title: "Chat Bubbles",
        desc: "Incoming (start) and outgoing (end) message bubbles.",
        preview: `<div class="nl-flex nl-flex-col nl-gap-3" style="max-width: 32rem;">
  <div class="nl-chat nl-chat-start">
    <div class="nl-chat-avatar">
      <div class="nl-avatar nl-avatar-sm" style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground));">A</div>
    </div>
    <div>
      <div class="nl-chat-header">Alice <span class="nl-text-muted" style="font-size:11px;">12:30 PM</span></div>
      <div class="nl-chat-bubble">Hey! Did you check the design docs?</div>
    </div>
  </div>
  <div class="nl-chat nl-chat-end">
    <div>
      <div class="nl-chat-header nl-text-right">You <span class="nl-text-muted" style="font-size:11px;">12:32 PM</span></div>
      <div class="nl-chat-bubble nl-chat-bubble-primary">Yes! Looks amazing. Love the new components 🎉</div>
      <div class="nl-chat-footer nl-text-muted" style="font-size: 11px; text-align: right;">Delivered ✓✓</div>
    </div>
  </div>
  <div class="nl-chat nl-chat-start">
    <div class="nl-chat-avatar">
      <div class="nl-avatar nl-avatar-sm" style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground));">A</div>
    </div>
    <div>
      <div class="nl-chat-bubble">Thanks! I'm still working on the mobile breakpoints though.</div>
    </div>
  </div>
</div>`,
        code: `<div class="nl-chat nl-chat-start">
  <div class="nl-chat-bubble">Hello!</div>
</div>
<div class="nl-chat nl-chat-end">
  <div class="nl-chat-bubble nl-chat-bubble-primary">Hi there! 👋</div>
</div>`
      }
    ],
    [
      { name: ".nl-chat", desc: "Chat message row container." },
      { name: ".nl-chat-start", desc: "Left-aligned (incoming) message layout." },
      { name: ".nl-chat-end", desc: "Right-aligned (outgoing) message layout." },
      { name: ".nl-chat-bubble", desc: "The message bubble with rounded corners." },
      { name: ".nl-chat-bubble-primary", desc: "Primary accent colored bubble for outgoing messages." },
      { name: ".nl-chat-avatar", desc: "Avatar area beside the bubble." },
      { name: ".nl-chat-header", desc: "Name and timestamp row above the bubble." },
      { name: ".nl-chat-footer", desc: "Read receipt / status row below the bubble." }
    ]
  );

  // Stack
  PAGES.stack = renderComponentPage(
    "Stack",
    "Layered card deck effect for showing multiple cards stacked on top of each other.",
    [
      {
        title: "Stacked Cards",
        desc: "Cards layered with slight offset to show depth.",
        preview: `<div class="nl-flex nl-justify-center nl-p-8">
  <div class="nl-stack">
    <div class="nl-card" style="width: 16rem;">
      <div class="nl-card-header">
        <h4 class="nl-card-title">Bottom Card</h4>
      </div>
    </div>
    <div class="nl-card" style="width: 16rem;">
      <div class="nl-card-header">
        <h4 class="nl-card-title">Middle Card</h4>
      </div>
    </div>
    <div class="nl-card nl-stack-top" style="width: 16rem;">
      <div class="nl-card-header">
        <h4 class="nl-card-title">Top Card</h4>
        <p class="nl-card-description">This is the active card on top.</p>
      </div>
    </div>
  </div>
</div>`,
        code: `<div class="nl-stack">
  <div class="nl-card">Bottom</div>
  <div class="nl-card">Middle</div>
  <div class="nl-card nl-stack-top">Top Card</div>
</div>`
      }
    ],
    [
      { name: ".nl-stack", desc: "Container that layers children with offset using nth-child positioning." },
      { name: ".nl-stack-top", desc: "Top-most card — no offset, highest z-index." }
    ]
  );

  // Diff
  PAGES.diff = renderComponentPage(
    "Diff",
    "Side-by-side comparison viewer with a draggable resizer between two content panes.",
    [
      {
        title: "Content Diff Viewer",
        desc: "Compare two versions of content side by side with a sliding divider.",
        preview: `<div class="nl-diff" style="height: 12rem; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid hsl(var(--border));">
  <div class="nl-diff-item-1" style="background: hsl(var(--muted)); display: flex; align-items: center; justify-content: center;">
    <div style="text-align: center; padding: 1rem;">
      <div style="font-size: 2rem;">🌑</div>
      <p style="font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.5rem;">Dark Mode</p>
    </div>
  </div>
  <div class="nl-diff-item-2" style="background: hsl(var(--background)); display: flex; align-items: center; justify-content: center;">
    <div style="text-align: center; padding: 1rem;">
      <div style="font-size: 2rem;">☀️</div>
      <p style="font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.5rem;">Light Mode</p>
    </div>
  </div>
  <div class="nl-diff-resizer" style="--diff-position: 50%;"></div>
</div>`,
        code: `<div class="nl-diff">
  <div class="nl-diff-item-1"><!-- Before content --></div>
  <div class="nl-diff-item-2"><!-- After content --></div>
  <div class="nl-diff-resizer" style="--diff-position: 50%;"></div>
</div>`
      }
    ],
    [
      { name: ".nl-diff", desc: "Side-by-side comparison container (position: relative, overflow: hidden)." },
      { name: ".nl-diff-item-1", desc: "Left/first content pane." },
      { name: ".nl-diff-item-2", desc: "Right/second content pane." },
      { name: ".nl-diff-resizer", desc: "Draggable center divider handle. Position set via --diff-position CSS variable." }
    ]
  );

  // --- ROUTER ENGINE ---

  function router() {
    let hash = window.location.hash || '#/docs/introduction';
    
    // Normalize path
    let path = hash.replace('#/docs/', '');
    if (!PAGES[path]) {
      path = 'introduction';
      window.location.hash = '#/docs/introduction';
    }

    // Mount page content
    const mountPoint = document.getElementById('docs-content-mount');
    if (mountPoint) {
      // Fade out
      mountPoint.classList.remove('nl-animate-fade-in');
      mountPoint.style.opacity = 0;
      
      setTimeout(() => {
        mountPoint.innerHTML = PAGES[path];
        
        // Fade in
        mountPoint.classList.add('nl-animate-fade-in');
        mountPoint.style.opacity = 1;

        // Execute setups hook
        if (path === 'theme-generator') initThemeGeneratorPage();
        if (path === 'utility-generator') initUtilityGeneratorPage();
        if (path === 'playground') initPlaygroundPage();
      }, 100);
    }

    // Update active state on sidebar links
    const sidebarLinks = document.querySelectorAll('.nl-sidebar-link');
    sidebarLinks.forEach((link) => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('nl-active');
      } else {
        link.classList.remove('nl-active');
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);

    // Close mobile sidebar drawer if open
    const sidebar = document.getElementById('docs-sidebar');
    if (sidebar) sidebar.classList.remove('nl-open');
  }

  // --- ACTIONS SYSTEM: CODE COPIER ---
  window.copyCode = function (button) {
    let codeText = "";
    const container = button.closest('.code-block-wrapper, .example-preview-box');
    if (!container) return;

    if (container.classList.contains('code-block-wrapper')) {
      const codeEl = container.querySelector('pre code');
      if (codeEl) codeText = codeEl.textContent;
    } else {
      // Inside example-preview-box, find the sibling code-block-wrapper
      const parent = container.closest('.docs-page-container');
      if (parent) {
        const codeEl = parent.querySelector('.code-block-wrapper pre code');
        if (codeEl) codeText = codeEl.textContent;
      }
    }

    navigator.clipboard.writeText(codeText).then(() => {
      const originalText = button.innerHTML;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Copied!</span>
      `;
      button.classList.add('nl-btn-success');
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('nl-btn-success');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      NovaToast.show({ title: 'Copy failed', description: 'Permission denied.', variant: 'destructive' });
    });
  };

  // --- DYNAMIC ACTIONS: ANIMATION TRIGGERS ---
  window.triggerAnimationDemo = function(type) {
    const target = document.getElementById('animation-demo-target');
    if (!target) return;

    // Reset classes
    target.classList.remove('nl-animate-fade-in', 'nl-animate-slide-up', 'nl-animate-scale-in');
    
    // Force layout reflow to re-trigger transition animation
    void target.offsetWidth;

    if (type === 'fade') target.classList.add('nl-animate-fade-in');
    if (type === 'slide') target.classList.add('nl-animate-slide-up');
    if (type === 'scale') target.classList.add('nl-animate-scale-in');
  };

  // --- DYNAMIC ACTIONS: INTERACTIVE THEME GENERATOR ---
  function initThemeGeneratorPage() {
    const hInput = document.getElementById('slide-hue');
    const sInput = document.getElementById('slide-sat');
    const lInput = document.getElementById('slide-light');
    const rInput = document.getElementById('slide-radius');
    const output = document.getElementById('theme-output-code');
    const copyBtn = document.getElementById('copy-theme-btn');

    if (!hInput) return;

    function updateThemeValues() {
      const h = hInput.value;
      const s = sInput.value;
      const l = lInput.value;
      const r = rInput.value / 10;

      // Update values labels in text
      document.getElementById('val-hue').textContent = h;
      document.getElementById('val-sat').textContent = `${s}%`;
      document.getElementById('val-light').textContent = `${l}%`;
      document.getElementById('val-radius').textContent = r.toFixed(1);

      // Apply to :root dynamically!
      document.documentElement.style.setProperty('--hue', h);
      document.documentElement.style.setProperty('--saturation', `${s}%`);
      
      // We will adjust the primary HSL variables directly
      document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
      
      const isLightAccent = (l > 55);
      const textPrimaryColor = isLightAccent ? `${h} 60% 10%` : `0 0% 98%`;
      document.documentElement.style.setProperty('--primary-foreground', textPrimaryColor);
      document.documentElement.style.setProperty('--radius-factor', r);

      // Generate output text
      const cssString = `:root {
  /* Nova UI Brand Custom Colors */
  --hue: ${h};
  --saturation: ${s}%;
  
  --primary: ${h} ${s}% ${l}%;
  --primary-foreground: ${textPrimaryColor};

  /* Rounded Corner Factor */
  --radius-factor: ${r.toFixed(1)};
}`;
      output.textContent = cssString;

      // Update copy handler
      if (copyBtn) {
        copyBtn.onclick = (e) => copyCode(e.currentTarget, cssString);
      }
    }

    // Attach inputs triggers
    hInput.addEventListener('input', updateThemeValues);
    sInput.addEventListener('input', updateThemeValues);
    lInput.addEventListener('input', updateThemeValues);
    rInput.addEventListener('input', updateThemeValues);

    // Initial run
    updateThemeValues();
  }

  // --- DYNAMIC ACTIONS: UTILITIES GENERATOR ---
  function initUtilityGeneratorPage() {
    const btn = document.getElementById('btn-generate-util');
    const prefixInput = document.getElementById('util-prefix');
    const colsInput = document.getElementById('util-grid-cols');
    const spaceInput = document.getElementById('util-space-scale');
    const output = document.getElementById('util-output-code');
    const copyBtn = document.getElementById('copy-util-btn');

    if (!btn) return;

    function generateCustomCSS() {
      const pfx = prefixInput.value.trim() || 'nl';
      const cols = parseInt(colsInput.value, 10) || 12;
      const scale = parseInt(spaceInput.value, 10) || 16;

      let css = `/* Custom Nova UI Utilities -- Prefix: .${pfx}- */\n`;
      
      // Flex & displays
      css += `.${pfx}-flex { display: flex; }\n`;
      css += `.${pfx}-flex-col { flex-direction: column; }\n`;
      
      // Columns
      css += `\n/* Grid Template Columns (1 to ${cols}) */\n`;
      for (let i = 1; i <= cols; i++) {
        css += `.${pfx}-grid-cols-${i} { grid-template-columns: repeat(${i}, minmax(0, 1fr)); }\n`;
      }

      // Spacing scales
      css += `\n/* Spacing Scale (Padding & Margins 0 to ${scale}) */\n`;
      for (let i = 0; i <= scale; i++) {
        css += `.${pfx}-p-${i} { padding: var(--space-${i}); }\n`;
        css += `.${pfx}-m-${i} { margin: var(--space-${i}); }\n`;
      }

      output.textContent = css;

      if (copyBtn) {
        copyBtn.onclick = (e) => copyCode(e.currentTarget, css);
      }

      NovaToast.show({ title: 'Utilities Compiled', description: 'CSS generated successfully.', variant: 'success' });
    }

    btn.addEventListener('click', generateCustomCSS);
    generateCustomCSS(); // Initial Compile
  }

  // --- DYNAMIC ACTIONS: INTERACTIVE PLAYGROUND ---
  const PLAYGROUND_TEMPLATES = {
    button: `<button class="nl-btn nl-btn-primary">Primary Button</button>
<button class="nl-btn nl-btn-outline">Outline</button>
<button class="nl-btn nl-btn-destructive">Warning</button>`,
    
    card: `<div class="nl-card" style="width: 100%; max-width: 22rem;">
  <div class="nl-card-header">
    <h3 class="nl-card-title">Login Credentials</h3>
    <p class="nl-card-description">Type details below to access.</p>
  </div>
  <div class="nl-card-content nl-flex nl-flex-col nl-gap-3">
    <input type="email" class="nl-input" placeholder="john@example.com">
    <input type="password" class="nl-input" placeholder="Type password">
  </div>
  <div class="nl-card-footer">
    <button class="nl-btn nl-btn-primary nl-w-full">Sign In</button>
  </div>
</div>`,

    form: `<div class="nl-flex nl-flex-col nl-gap-4 nl-w-full">
  <div>
    <label class="nl-text-xs nl-font-semibold nl-mb-1 nl-block">User Name</label>
    <input type="text" class="nl-input" value="antigravity_dev">
  </div>
  <label class="nl-toggle-label">
    <input type="checkbox" class="nl-toggle" checked>
    <span>Auto deployment environment</span>
  </label>
</div>`
  };

  function initPlaygroundPage() {
    const input = document.getElementById('playground-code-input');
    const mount = document.getElementById('playground-render-mount');

    if (!input || !mount) return;

    function renderPlayground() {
      mount.innerHTML = input.value;
    }

    input.addEventListener('input', renderPlayground);
    
    // Load default template
    window.loadPlaygroundTemplate = function (name) {
      if (PLAYGROUND_TEMPLATES[name]) {
        input.value = PLAYGROUND_TEMPLATES[name];
        renderPlayground();
      }
    };

    loadPlaygroundTemplate('card');
  }

  // --- BOOTSTRAP SYSTEM ---
  function initDocs() {
    // Hash Routing Listeners
    window.addEventListener('hashchange', router);
    router();

    // Mobile Sidebar Drawer Toggle Click
    const drawerBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('docs-sidebar');
    if (drawerBtn && sidebar) {
      drawerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('nl-open');
      });
    }

    // Close mobile drawer when clicking document area
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('nl-open') && !sidebar.contains(e.target) && e.target !== drawerBtn) {
        sidebar.classList.remove('nl-open');
      }
    });

    // COMMAND PALETTE SEARCH REGISTRATION
    const searchIndex = [
      { category: 'Getting Started', title: 'Introduction & Features', href: '#/docs/introduction', keywords: ['about', 'philosophy', 'features', 'core'] },
      { category: 'Getting Started', title: 'Installation Guide', href: '#/docs/installation', keywords: ['npm', 'install', 'setup', 'cdn'] },
      { category: 'Getting Started', title: 'Theme Customization', href: '#/docs/customization', keywords: ['colors', 'variables', 'override', 'hsl'] },
      { category: 'Getting Started', title: 'CDN & CLI Commands', href: '#/docs/cdn-cli', keywords: ['npm', 'cdn', 'cli', 'purge'] },
      { category: 'Getting Started', title: 'AI Integration & Skills', href: '#/docs/ai-integration', keywords: ['llms', 'ai', 'skills', 'prompts', 'copilot', 'cursor', 'claude'] },
      { category: 'Theming', title: 'Theme Generator Dashboard', href: '#/docs/theme-generator', keywords: ['custom', 'sliders', 'hue', 'border', 'generator'] },
      { category: 'Utilities', title: 'Utility CSS Generator', href: '#/docs/utility-generator', keywords: ['classes', 'spacing', 'flex', 'custom'] },
      { category: 'Utilities', title: 'Layout & Grid Columns', href: '#/docs/util-layout', keywords: ['flexbox', 'alignments', 'gaps', 'cols'] },
      { category: 'Utilities', title: 'Padding & Margins Scale', href: '#/docs/util-spacing', keywords: ['paddings', 'margins', 'gaps'] },
      { category: 'Utilities', title: 'Typography Sizes & Weight', href: '#/docs/util-typography', keywords: ['fonts', 'weights', 'sizes', 'colors'] },
      { category: 'Utilities', title: 'Borders & Shadows depth', href: '#/docs/util-borders', keywords: ['rounded', 'radii', 'depths', 'outline'] },
      { category: 'Utilities', title: 'Animations entrance keyframes', href: '#/docs/util-animations', keywords: ['pulse', 'fade', 'slide', 'loaders'] },
      
      // Components
      { category: 'Components', title: 'Button Component Actions', href: '#/docs/button', keywords: ['variants', 'sizes', 'ghost', 'primary'] },
      { category: 'Components', title: 'Input Forms (Select, Checkbox, Switch)', href: '#/docs/input', keywords: ['switches', 'radios', 'textareas', 'dropdown'] },
      { category: 'Components', title: 'Card layout panels', href: '#/docs/card', keywords: ['headers', 'footers', 'cards', 'description'] },
      { category: 'Components', title: 'Modal & Dialog overlays', href: '#/docs/modal', keywords: ['backdrops', 'dialogs', 'focus', 'trapping'] },
      { category: 'Components', title: 'Dropdown Menu list options', href: '#/docs/dropdown', keywords: ['items', 'dividers', 'popups'] },
      { category: 'Components', title: 'Tooltip hover bubbles', href: '#/docs/tooltip', keywords: ['directions', 'arrows', 'hover'] },
      { category: 'Components', title: 'Badge tag labels', href: '#/docs/badge', keywords: ['status', 'pill', 'variants'] },
      { category: 'Components', title: 'Alert warning blocks', href: '#/docs/alert', keywords: ['callouts', 'warning', 'success', 'destructive'] },
      { category: 'Components', title: 'Tabs switches lists', href: '#/docs/tabs', keywords: ['role', 'active', 'tablist'] },
      { category: 'Components', title: 'Accordion collapsible panels', href: '#/docs/accordion', keywords: ['details', 'chevrons', 'expand'] },
      { category: 'Components', title: 'Navbar sticky glass headers', href: '#/docs/navbar', keywords: ['blur', 'logo', 'hamburger', 'toggle'] },
      { category: 'Components', title: 'Sidebar drawer navigation', href: '#/docs/sidebar', keywords: ['overview', 'dashboard', 'links'] },
      { category: 'Components', title: 'Table responsive layouts', href: '#/docs/table', keywords: ['hover', 'striped', 'headers', 'cells'] },
      { category: 'Components', title: 'Pagination arrows selectors', href: '#/docs/pagination', keywords: ['previous', 'next', 'ellipsis'] },
      { category: 'Components', title: 'Toast alert overlay triggers', href: '#/docs/toast', keywords: ['notifications', 'timeouts', 'durations'] },
      { category: 'Components', title: 'Skeleton pulse loader screen', href: '#/docs/skeleton', keywords: ['placeholders', 'avatar', 'lines'] },
      { category: 'Components', title: 'Progress indicator bars', href: '#/docs/progress', keywords: ['percentages', 'tracks', 'values'] },
      { category: 'Components', title: 'Avatar fallback initial profiles', href: '#/docs/avatar', keywords: ['initials', 'crops', 'images'] },
      { category: 'Components', title: 'Breadcrumb page path paths', href: '#/docs/breadcrumb', keywords: ['separators', 'links', 'paths'] },
      { category: 'Components', title: 'Media Timeline workspace track', href: '#/docs/mediaTimeline', keywords: ['audio', 'video', 'editor', 'waveforms', 'ruler', 'ticks', 'playhead'] },
      
      // Quick Actions
      { category: 'System Action', title: 'Switch to Dark Mode', action: () => NovaTheme.set('dark'), keywords: ['theme', 'dark', 'black', 'night'] },
      { category: 'System Action', title: 'Switch to Light Mode', action: () => NovaTheme.set('light'), keywords: ['theme', 'light', 'white', 'day'] },
      { category: 'System Action', title: 'Trigger Success Toast Demo', action: () => NovaToast.show({title: 'Command Success', description: 'Triggered from palette.', variant: 'success'}), keywords: ['toast', 'alert', 'success'] }
    ];

    NovaCommandPalette.register(searchIndex);
  }

  // Hook into bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocs);
  } else {
    initDocs();
  }
})();
