import {
  EthereumProvider,
  RequestArguments,
  JsonRpcResponse,
  Callback
} from './types';
import { createPayload, JsonRpcPayload } from './payload';
import { fetchWeb3 } from '@/utils/fetchWeb3';

class Provider implements EthereumProvider {
  private netVersion?: string;
  private providerChainId?: string;
  private accountAddress?: string;
  private nextId = 1;

  isMetaMask = true;

  constructor() {
    this.init();
  }

  private async init() {
    this.providerChainId = await this.doSend('eth_chainId', []);
    this.netVersion = Number.parseInt(this.providerChainId, 16).toString();
  }

  get chainId() {
    return this.providerChainId;
  }

  get networkVersion() {
    return this.netVersion;
  }

  get selectedAddress() {
    return this.accountAddress;
  }

  isConnected = () => {
    return true;
  };

  request = (payload: RequestArguments): Promise<unknown> => {
    switch (payload.method) {
      case 'net_version': {
        if (this.netVersion) {
          return Promise.resolve(this.netVersion);
        }
        break;
      }
      case 'eth_chainId': {
        if (this.chainId) {
          return Promise.resolve(this.chainId);
        }
        break;
      }
    }
    return this.doSend(payload.method, payload.params as unknown[]);
  };

  private doSend<T>(
    method: string,
    params: readonly unknown[] = []
  ): Promise<T> {
    const payload = createPayload(method, params, this.nextId++);
    return fetchWeb3(payload)
      .then(data => data.json())
      .then(res => res.result as T);
  }

  async send(
    methodOrPayload: string | JsonRpcPayload,
    callbackOrArgs: Callback<JsonRpcResponse> | unknown[]
  ) {
    // Send can be clobbered, proxy sendPromise for backwards compatibility
    if (
      typeof methodOrPayload === 'string' &&
      (!callbackOrArgs || Array.isArray(callbackOrArgs))
    ) {
      const params = callbackOrArgs;
      return this.doSend(methodOrPayload, params);
    }

    if (
      methodOrPayload &&
      typeof methodOrPayload === 'object' &&
      typeof callbackOrArgs === 'function'
    ) {
      // a callback was passed to send(), forward everything to sendAsync()
      const cb = callbackOrArgs as Callback<JsonRpcResponse>;
      return this.sendAsync(methodOrPayload, cb);
    }

    return this.request(methodOrPayload as JsonRpcPayload);
  }

  async sendAsync(
    rawPayload: JsonRpcPayload | JsonRpcPayload[],
    cb: Callback<JsonRpcResponse> | Callback<JsonRpcResponse[]>
  ) {
    // Backwards Compatibility
    if (!cb || typeof cb !== 'function')
      return new Error('Invalid or undefined callback provided to sendAsync');

    if (!rawPayload) return cb(new Error('Invalid Payload'));

    // sendAsync can be called with an array for batch requests used by web3.js 0.x
    // this is not part of EIP-1193's backwards compatibility but we still want to support it
    if (Array.isArray(rawPayload)) {
      const payloads: JsonRpcPayload[] = rawPayload.map(p => ({
        ...p,
        jsonrpc: '2.0'
      }));
      const callback = cb as Callback<JsonRpcResponse[]>;
      return this.sendAsyncBatch(payloads, callback);
    } else {
      const payload: JsonRpcPayload = {
        ...(rawPayload as JsonRpcPayload),
        jsonrpc: '2.0'
      };
      const callback = cb as Callback<JsonRpcResponse>;

      try {
        const result = await this.doSend(payload.method, payload.params);
        callback(null, { id: payload.id, jsonrpc: payload.jsonrpc, result });
      } catch (e) {
        callback(e as Error);
      }
    }
  }

  private sendBatch(requests: JsonRpcPayload[]): Promise<unknown[]> {
    return Promise.all(
      requests.map(payload => {
        return this.doSend(payload.method, payload.params);
      })
    );
  }

  private async sendAsyncBatch(
    payloads: JsonRpcPayload[],
    cb: (err: Error | null, result?: JsonRpcResponse[]) => void
  ) {
    try {
      const results = await this.sendBatch(payloads);

      const result = results.map((entry, index) => {
        return {
          id: payloads[index].id,
          jsonrpc: payloads[index].jsonrpc,
          result: entry
        };
      });

      cb(null, result);
    } catch (e) {
      cb(e as Error);
    }
  }

  enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }

  once() {
    // todo
    return this;
  }

  on() {
    // todo
    return this;
  }

  off() {
    // todo
    return this;
  }

  addListener() {
    // todo
    return this;
  }

  removeListener() {
    // todo
    return this;
  }

  removeAllListeners() {
    // todo
    return this;
  }
}

export default Provider;
