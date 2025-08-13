export function registerShortcuts(actions) {
  document.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key === 'r') actions.restart?.();
    if (key === 'h') actions.help?.();
    if (key === 's') actions.settings?.();
    if (key === 'm') actions.mute?.();
    if (key === 'f') actions.cycleSpeed?.();
  });
}
