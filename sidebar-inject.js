(function() {
  // --- Config ---
  const MIN_W = 150, MAX_W = 800;
  const SIDEBAR_VAR = '--sidebar-width'; // fallback: direct DOM

  // --- Create drag handle ---
  const handle = document.createElement('div');
  handle.style.cssText = `
    position: absolute; top: 0; right: 0; width: 6px; height: 100%;
    cursor: ew-resize; z-index: 9999; background: transparent;
  `;
  handle.title = 'Drag to resize';

  const sidebarWrapper = document.querySelector('.w-sideBarWidth');
  sidebarWrapper.style.position = 'relative';
  sidebarWrapper.appendChild(handle);

  // --- Drag logic ---
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWrapper.getBoundingClientRect().width;

    function onMove(e) {
      const newW = Math.min(MAX_W, Math.max(MIN_W, startW + e.clientX - startX));
      applySidebarWidth(newW);
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  function applySidebarWidth(w) {
    // 1. Resize sidebar CSS rule
    [...document.styleSheets].forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule.selectorText === '.w-sideBarWidth')
            rule.style.setProperty('width', w + 'px', 'important');
        });
      } catch(e) {}
    });

    // 2. Fix Recent section container (inline width)
    document.querySelectorAll('nav [class*="-ml-md"][class*="px-"]').forEach(el => {
      if (el.getBoundingClientRect().width < w)
        el.style.setProperty('width', '100%', 'important');
    });

    // 3. Save for persistence
    localStorage.setItem('sidebarWidth', w);
  }

  // --- Restore saved width on load ---
  const saved = localStorage.getItem('sidebarWidth');
  if (saved) applySidebarWidth(parseInt(saved));

})();
