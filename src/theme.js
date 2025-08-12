export function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
}

export function toggleTheme(current) {
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
