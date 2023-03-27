import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { utils } from 'ethers';
import { TransactionRequest } from '@/types';
import styles from './safe.module.css';

const TransactionView = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState<TransactionRequest>(
    {} as TransactionRequest
  );

  useEffect(() => {
    chrome.storage.local.get(['txBundle']).then(({ txBundle }) => {
      if (txBundle) {
        const transaction = txBundle[Number(transactionId)];
        setTransaction(transaction);
      }
    });
  }, [transactionId]);

  return (
    <div className={styles.transaction}>
      <h1>Transaction</h1>
      <p>{transaction.data}</p>
      <p>{transaction.to}</p>
      <p>{utils.formatEther(transaction.value ? transaction.value : '0')}</p>

      <NavLink to={'..'}>back list</NavLink>
    </div>
  );
};

export default TransactionView;
