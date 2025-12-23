(function () {
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // Runs in page's main world to intercept fetch requests
  // See README.md "Implementation Details" section for why this approach is necessary
  const originalFetch = window.fetch;

  window.fetch = async function (url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
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

    const isChatGPTAPI =
      (urlString.includes('backend-api') || urlString.includes('backend-anon')) &&
      urlString.includes('conversation');

    if (isChatGPTAPI && options?.body && typeof options.body === 'string') {
      const emails = options.body.match(EMAIL_REGEX);

      if (emails && emails.length > 0) {
        console.log('[Prompt Monitor] Email(s) detected:', emails);

        const anonymizedBody = options.body.replace(EMAIL_REGEX, '[EMAIL_ADDRESS]');

        window.dispatchEvent(
          new CustomEvent('emailDetected', {
            detail: {
              emails,
              timestamp: Date.now(),
            },
          })
        );

        return originalFetch.call(this, url, {
          ...options,
          body: anonymizedBody,
        });
      }
    }

    return originalFetch.call(this, url, options);
  };
})();
