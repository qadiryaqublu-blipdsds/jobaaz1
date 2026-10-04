/**
 * Dialog Helper to prevent window.alert / window.confirm / window.open crashes
 * in iframe sandboxes (e.g. Google AI Studio preview environment).
 * Instead of crashing with DOMException or sandbox blocks, it uses
 * the custom toast system or safely catches exceptions.
 */

export function safeAlert(message: string): void {
  if (typeof window === 'undefined') return;
  
  // Try to dispatch custom toast event so App.tsx displays it in the UI
  try {
    window.dispatchEvent(
      new CustomEvent('jobia-toast', {
        detail: { message },
      })
    );
  } catch {}

  // Fallback to window.alert only if not blocked by iframe sandbox
  try {
    if (typeof window.alert === 'function') {
      window.alert(message);
    }
  } catch (err) {
    console.info('[Jobia Notice]:', message);
  }
}

export function safeConfirm(message: string, fallbackDefault = true): boolean {
  if (typeof window === 'undefined') return fallbackDefault;
  
  try {
    if (typeof window.confirm === 'function') {
      return window.confirm(message);
    }
  } catch (err) {
    console.warn('[Jobia Sandbox Alert]: window.confirm blocked by iframe sandbox, defaulting to:', fallbackDefault);
  }
  return fallbackDefault;
}

export function safeOpenLink(url: string, target = '_blank'): void {
  if (typeof window === 'undefined') return;

  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = target;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    try {
      window.open(url, target);
    } catch (e) {
      console.warn('[Jobia Notice] Link navigation blocked:', e);
    }
  }
}
