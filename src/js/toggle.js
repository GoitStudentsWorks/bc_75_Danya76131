(function () {
  const KEY = 'darkmode';
  const btn = document.getElementById('theme-switch');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // переключаем класс на <html>
    const isDark = document.documentElement.classList.toggle('darkmode');
    // сохраняем в localStorage
    if (isDark) {
      localStorage.setItem(KEY, 'active');
    } else {
      localStorage.removeItem(KEY);
    }
  });
})();
