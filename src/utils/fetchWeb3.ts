import { JsonRpcPayload } from '@/provider/payload';

const resolveMap = new Map();

window.addEventListener('message', event => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (event.data?.type === 'response') {
    const key = event.data.request.id;
    if (resolveMap.has(key)) {
      const blob = new Blob([JSON.stringify(event.data.response)], {
        type: 'application/json'
      });
      const res = new Response(blob);
      resolveMap.get(key).call(null, res);
      resolveMap.delete(key);
    }
  }
});

export const fetchWeb3 = (payload: JsonRpcPayload): Promise<Response> => {
  window.postMessage({ type: 'request', request: payload }, location.origin);
  return new Promise(resolve => {
    resolveMap.set(payload.id, resolve);
  });
};
