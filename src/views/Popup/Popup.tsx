import { useCallback, useEffect, useMemo, useState } from 'react';
import cls from 'clsx';
import { Input, Checkbox } from '@/components';
import { useDidUpdate } from '@/hooks/useDidUpdate';
import { useProvider } from '@/hooks/useProvider';
import { eventKey } from '@/constants/keyboard';
import { SETTINGS } from '@/constants/settings';
import { ReactComponent as Search } from '@/assets/icons/search.svg';
import { ReactComponent as Expand } from '@/assets/icons/expand.svg';
import Transactions from './Transactions';
import styles from './popup.module.css';

const Popup = () => {
  const provider = useProvider();
  const updated = useDidUpdate();
  const [impersonatedAccount, setImpersonatedAccount] = useState(
    SETTINGS.impersonatedAccount
  );
  const [addrRandomize, setAddrRandomize] = useState(SETTINGS.addrRandomize);

  const saveImpersonatedAccount = useCallback(
    async (address?: string) => {
      await chrome.storage.local.set({
        impersonatedAccount: address || impersonatedAccount
      });
    },
    [impersonatedAccount]
  );

  const resolveENS = useCallback(() => {
    if (impersonatedAccount.endsWith('.eth')) {
      provider.resolveName(impersonatedAccount).then(address => {
        if (address) {
          setImpersonatedAccount(address);
          saveImpersonatedAccount(address);
        }
      });
    }
  }, [provider, impersonatedAccount, saveImpersonatedAccount]);

  useEffect(() => {
    chrome.storage.local
      .get(['impersonatedAccount', 'addrRandomize'])
      .then(({ impersonatedAccount, addrRandomize }) => {
        if (impersonatedAccount !== undefined) {
          setImpersonatedAccount(impersonatedAccount);
        }
        if (addrRandomize !== undefined) {
          setAddrRandomize(addrRandomize);
        }
      });
  }, []);

  useEffect(() => {
    if (updated) {
      chrome.storage.local.set({
        addrRandomize
      });
    }
  }, [addrRandomize, updated]);

  const keyDownHandler = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case eventKey.Enter: {
          resolveENS();
          break;
        }
      }
    },
    [resolveENS]
  );

  const searchButton = useMemo(() => {
    return (
      <button
        type="button"
        className={styles.settingsItemButton}
        onClick={resolveENS}
      >
        <Search className={styles.settingsItemIcon} />
      </button>
    );
  }, [resolveENS]);

  return (
    <div className={styles.popup}>
      <div className={styles.inner}>
        <div className={styles.settings}>
          <h1 className={styles.settingsTitle}>Settings</h1>
          <a
            className={cls(styles.expand)}
            target="_blank"
            rel="noreferrer"
            href={location.href}
          >
            <Expand className={styles.expandIcon} />
            <span>Expand View</span>
          </a>
          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>
              Impersonated Account
            </label>
            <Input
              value={impersonatedAccount}
              onChange={e => setImpersonatedAccount(e.target.value)}
              onBlur={() => saveImpersonatedAccount()}
              onKeyDown={keyDownHandler}
              suffix={searchButton}
            />
          </div>
          <div className={styles.settingsItem}>
            <Checkbox
              checked={addrRandomize}
              onChange={event => setAddrRandomize(event.target.checked)}
              label={'Fake Account Address'}
            />
          </div>
        </div>
        <Transactions />
      </div>
    </div>
  );
};

export default Popup;
