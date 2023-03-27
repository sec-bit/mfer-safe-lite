import { JsonRpcPayload } from '@/provider/payload';
import { fetchWeb3 } from './fetchWeb3';
let once = false;

export function interceptFetch() {
  if (!once) {
    const { fetch: originFetch } = window;

    window.fetch = (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      if (init) {
        try {
          if (init.body instanceof Uint8Array) {
            const payload = new TextDecoder().decode(init.body);
            const jsonRpcPayload: JsonRpcPayload = JSON.parse(payload);
            if (
              jsonRpcPayload?.method === 'eth_call' ||
              jsonRpcPayload?.method === 'eth_estimateGas'
            ) {
              return fetchWeb3(jsonRpcPayload);
            }
          }
        } catch (e) {
          return originFetch(input, init);
        }
      }
      return originFetch(input, init);
    };
    once = true;
  }
}
