import { useEffect, useMemo, useState } from 'react';
import { ETH_RPC } from '@/constants/address';
import { providers } from 'ethers';

export function useProvider() {
  const [ETHRPC, setETHRPC] = useState(ETH_RPC);

  const provider = useMemo(
    () => new providers.JsonRpcProvider(ETHRPC),
    [ETHRPC]
  );

  useEffect(() => {
    chrome.storage.local.get(['ETHRPC']).then(({ ETHRPC }) => {
      if (ETHRPC) {
        setETHRPC(ETHRPC);
      }
    });
  }, []);

  return provider;
}
