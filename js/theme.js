// ─── THEME MANAGER ───────────────────────────────────────────────────────────
(function () {
  const STORAGE_KEY = 'timonia-theme';

  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  }

  function savedTheme() {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  }

  // Apply on load
  applyTheme(savedTheme());

  // Wire toggle button
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem(STORAGE_KEY, isDark ? 'light' : 'dark');
        applyTheme(!isDark);
      });
    }

    // Mobile menu
    const burger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('navMobile');
    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }

    // Close modal on overlay click
    document.querySelectorAll('.modal-bg').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.hidden = true;
      });
    });

    // ESC key closes modals
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-bg').forEach(function (m) {
          m.hidden = true;
        });
      }
    });
  });
})();
