const mode = localStorage.getItem('darkmode');
if (mode === 'active') {
  document.documentElement.classList.add('darkmode');
}
