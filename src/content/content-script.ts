import browser from 'webextension-polyfill';
import { MESSAGE_TYPES } from '../constants';

window.addEventListener('emailDetected', ((event: CustomEvent) => {
  const { emails, timestamp } = event.detail;

  browser.runtime
    .sendMessage({
      type: MESSAGE_TYPES.EMAIL_DETECTED,
      emails,
      timestamp,
    })
    .catch(() => {
      console.warn('[Extension] Context invalidated. Please reload the page after updating the extension.');
    });
}) as EventListener);

function injectScript() {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('injected-script.js');
  script.onload = () => script.remove();
  script.onerror = () => console.error('[Extension] Failed to load monitoring script');

  (document.head || document.documentElement).appendChild(script);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}
