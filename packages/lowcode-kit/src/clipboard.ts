import { toast } from './toast';

/**
 * Copy text and confirm with a toast. Uses the async Clipboard API, falling
 * back to a hidden textarea — never a blocking `prompt()`.
 */
export async function copyText(text: string, successMessage = 'Copied to clipboard') {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      if (!ok) throw new Error('copy failed');
    }
    toast.success(successMessage);
    return true;
  } catch {
    toast.error('Couldn’t copy', text);
    return false;
  }
}
