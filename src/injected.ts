import Provider from '@/provider';
import { interceptFetch } from '@/utils/interceptFetch';

const provider = new Provider();

const ethProvider = new Proxy(provider, {
  get(target: typeof provider, prop: keyof typeof provider) {
    interceptFetch();
    return target[prop];
  },
  deleteProperty: () => true
});

window.ethereum = ethProvider;

window.dispatchEvent(new Event('ethereum#initialized'));
