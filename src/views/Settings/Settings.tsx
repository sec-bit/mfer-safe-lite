import { useEffect, useState, useCallback } from 'react';
import { Button, Input, message } from '@/components';
import { MFER_RPC, ETH_RPC } from '@/constants/address';

import styles from './settings.module.css';

const Settings = () => {
  const [mferRPC, setMferRPC] = useState(MFER_RPC);
  const [ETHRPC, setETHRPC] = useState(ETH_RPC);

  useEffect(() => {
    chrome.storage.local
      .get(['mferRPC', 'ETHRPC'])
      .then(({ mferRPC, ETHRPC }) => {
        if (mferRPC !== undefined) {
          setMferRPC(mferRPC);
        }
        if (ETHRPC !== undefined) {
          setETHRPC(ETHRPC);
        }
      });
  }, []);

  const saveRPC = useCallback(async () => {
    await chrome.storage.local.set({
      mferRPC,
      ETHRPC
    });
    message.success('Saved');
  }, [mferRPC, ETHRPC]);

  return (
    <main className={styles.settings}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Settings</h1>
        <div className={styles.body}>
          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>Mfer RPC</label>
            <Input value={mferRPC} onChange={e => setMferRPC(e.target.value)} />
          </div>
          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>ETH RPC</label>
            <Input value={ETHRPC} onChange={e => setETHRPC(e.target.value)} />
          </div>
          <div className={styles.footer}>
            <Button color="primary" onClick={saveRPC}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
