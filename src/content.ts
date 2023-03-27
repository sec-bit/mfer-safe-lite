import injected from './injected?script&module';

const script = document.createElement('script');
script.src = chrome.runtime.getURL(injected);
script.type = 'module';
(document.head || document.documentElement).appendChild(script);

window.addEventListener(
  'message',
  async event => {
    // We only accept messages from ourselves
    if (event.source != window) {
      return;
    }

    if (event.data?.type == 'request') {
      const request = event.data.request;

      chrome.runtime.sendMessage(request, response => {
        window.postMessage(
          {
            type: 'response',
            request: request,
            response: response
          },
          location.origin
        );
      });
    }
  },
  false
);
