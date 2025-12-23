console.log('[Content Script] Loaded');

window.addEventListener('emailDetected', ((event: CustomEvent) => {
  console.log('[Content Script] Received emailDetected event:', event.detail);
  
  const { emails, timestamp } = event.detail;
  
  try {
    chrome.runtime.sendMessage(
      {
        type: 'EMAIL_DETECTED',
        emails: emails,
        timestamp: timestamp
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[Content Script] Extension context invalidated. Please reload the page after updating the extension.');
          return;
        }
        console.log('[Content Script] Message sent to service worker');
      }
    );
  } catch (error) {
    console.warn('[Content Script] Could not send message. Extension may have been updated.');
  }
}) as EventListener);

console.log('[Content Script] Event listener installed');

function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected-script.js');
  script.onload = function() {
    console.log('[Content Script] Injected script loaded successfully');
    script.remove();
  };
  script.onerror = function() {
    console.error('[Content Script] Error loading injected script');
  };
  
  (document.head || document.documentElement).appendChild(script);
  console.log('[Content Script] Injected script tag into page');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}
