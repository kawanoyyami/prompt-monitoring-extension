(function() {
  console.log('[Injected Script] Starting in MAIN WORLD');
  
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const originalFetch = window.fetch;
  let fetchCount = 0;
  
  window.fetch = async function(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
    fetchCount++;
    
    let urlString: string;
    if (typeof url === 'string') {
      urlString = url;
    } else if (url instanceof URL) {
      urlString = url.toString();
    } else if ((url as any).url) {
      urlString = (url as any).url;
    } else {
      urlString = String(url);
    }
    
    const isImportant = urlString.includes('backend-api') && urlString.includes('conversation');
    
    if (isImportant) {
      console.log(`[Injected] FETCH #${fetchCount}:`, urlString.substring(0, 150));
    }
    
    if (isImportant) {
      console.log('[Injected] ChatGPT API detected');
      
      let body = options?.body;
      
      if (body && typeof body === 'string') {
        console.log('[Injected] Original body:', body.substring(0, 200));
        
        const emails = body.match(EMAIL_REGEX);
        
        if (emails && emails.length > 0) {
          console.log('[Injected] EMAILS DETECTED:', emails);
          
          const anonymizedBody = body.replace(EMAIL_REGEX, '[EMAIL_ADDRESS]');
          console.log('[Injected] Anonymized body:', anonymizedBody.substring(0, 200));
          
          window.dispatchEvent(new CustomEvent('emailDetected', {
            detail: {
              emails: emails,
              timestamp: Date.now()
            }
          }));
          
          console.log('[Injected] Event dispatched to content script');
          
          return originalFetch.call(this, url, {
            ...options,
            body: anonymizedBody
          });
        }
      }
    }
    
    return originalFetch.call(this, url, options);
  };
  
  console.log('[Injected Script] Fetch override installed in MAIN WORLD!');
})();
