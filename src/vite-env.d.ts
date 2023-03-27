/// <reference types="vite/client" />

interface MetaMaskEthereumProvider {
  isMetaMask?: boolean;
  once(event: string, cb: (data: unknown) => void): this;
  on(event: string, cb: (data: unknown) => void): this;
  off(event: string, cb: (data: unknown) => void): this;
  addListener(event: string, handler: (data: unknown) => void): this;
  removeListener(event: string, handler: (data: unknown) => void): this;
  removeAllListeners(event?: string): this;
}

interface Window {
  ethereum?: MetaMaskEthereumProvider;
}

declare module '*?script' {
  const src: string;
  export default src;
}

declare module '*?script&module' {
  const src: string;
  export default src;
}
