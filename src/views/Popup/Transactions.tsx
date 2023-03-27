import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useImmer } from 'use-immer';
import { utils } from 'ethers';
import { Button, Table, message, Modal, Textarea } from '@/components';
import { RecordType } from '@/components/Table';
import { createPayload } from '@/provider/payload';
import { TransactionReceipt, TransactionRequest } from '@/types';
import { ReactComponent as Clear } from '@/assets/icons/eraser.svg';
import { ReactComponent as Replay } from '@/assets/icons/repeat.svg';
import { ReactComponent as Delete } from '@/assets/icons/delete.svg';
import { ReactComponent as Edit } from '@/assets/icons/edit.svg';
import { ReactComponent as Add } from '@/assets/icons/plus.svg';
import { ReactComponent as Copy } from '@/assets/icons/copy.svg';
import styles from './transactions.module.css';

const defaultTransaction: TransactionRequest = {
  from: '',
  to: '',
  data: '',
  value: '',
  gas: '0x1333332'
};

const TransactionsView = () => {
  const [txBundle, setTxBundle] = useState<TransactionRequest[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<
    TransactionReceipt[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedBundle, updateBundle] = useImmer<TransactionRequest>({
    ...defaultTransaction
  });
  const txBundleString = useMemo(
    () => JSON.stringify(txBundle, null, 2),
    [txBundle]
  );
  const [confirm, setConfirm] = useState(false);
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);
  const [copy, setCopy] = useState(false);

  const loadData = useCallback(() => {
    chrome.storage.local
      .get(['txBundle', 'transactionReceipts'])
      .then(({ txBundle, transactionReceipts }) => {
        if (txBundle) {
          setTxBundle(txBundle);
        }
        if (transactionReceipts) {
          setTransactionReceipts(transactionReceipts);
        }
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const replayTransaction = useCallback(
    (txBundle: TransactionRequest[], showMessage = false) => {
      chrome.runtime.sendMessage(
        createPayload('mfer_traceTransactionBundle', [txBundle]),
        response => {
          if (response) {
            loadData();
            if (showMessage) {
              message.success('Transactions replayed.');
            }
          }
        }
      );
    },
    [loadData]
  );

  const clearTransaction = useCallback(() => {
    chrome.runtime.sendMessage(createPayload('mfer_clear'), response => {
      if (response) {
        loadData();
        message.success('Transactions cleared.');
      }
    });
  }, [loadData]);

  const confirmDelete = useCallback((index: number) => {
    setSelectedIndex(index);
    setConfirm(true);
  }, []);

  const deleteTransaction = useCallback(() => {
    setConfirm(false);
    const newTxBundle = [...txBundle];
    newTxBundle.splice(selectedIndex, 1);
    replayTransaction(newTxBundle);
    message.success('Transactions deleted.');
  }, [selectedIndex, txBundle, replayTransaction]);

  const showEditModal = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      updateBundle(txBundle[index]);
      setEdit(true);
    },
    [txBundle, updateBundle]
  );

  const editTrancation = useCallback(() => {
    setEdit(false);
    const newTxBundle = [...txBundle];
    newTxBundle.splice(selectedIndex, 1, {
      ...newTxBundle[selectedIndex],
      ...selectedBundle
    });
    replayTransaction(newTxBundle);
    message.success('Transactions updated.');
  }, [selectedIndex, selectedBundle, txBundle, replayTransaction]);

  const showAddModal = useCallback(() => {
    updateBundle({ ...defaultTransaction });
    setAdd(true);
  }, [updateBundle]);

  const showCopyModal = useCallback(() => {
    setCopy(true);
  }, []);

  const copyTxBundle = useCallback(() => {
    navigator.clipboard.writeText(txBundleString);
    setCopy(false);
    message.success('TxBundle copied.');
  }, [txBundleString]);

  const addTransaction = useCallback(() => {
    setAdd(false);
    const newTxBundle = [...txBundle, selectedBundle];
    replayTransaction(newTxBundle);
    message.success('Transactions added.');
  }, [txBundle, selectedBundle, replayTransaction]);

  const sortTransaction = useCallback(
    (newTxBundle: TransactionRequest[]) => {
      replayTransaction(newTxBundle);
      message.success('Transactions resorted.');
    },
    [replayTransaction]
  );

  const changeHandler = useCallback(
    (
      event: React.ChangeEvent<HTMLTextAreaElement>,
      key: keyof Partial<TransactionRequest>
    ) => {
      updateBundle(bundle => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bundle[key] = event.target.value as any;
      });
    },
    [updateBundle]
  );

  const columns = useMemo(
    () => [
      {
        name: 'id',
        label: 'Index',
        render: (text: string) => {
          return (
            <NavLink to={text.toString()} className={styles.link}>
              {text}
            </NavLink>
          );
        }
      },
      {
        name: 'to',
        label: 'To'
      },
      {
        name: 'data',
        label: 'Data'
      },
      {
        name: 'value',
        label: 'Value'
      },
      {
        name: 'Action',
        label: 'Action',
        render: (text: string, record: RecordType, index: number) => {
          return (
            <div className={styles.tableAction}>
              <button
                type="button"
                title={'Edit transaction'}
                onClick={() => showEditModal(index)}
                className={styles.tableButton}
              >
                <Edit className={styles.tableIcon} />
              </button>
              <button
                type="button"
                title={'Delete transaction'}
                onClick={() => confirmDelete(index)}
                className={styles.tableButton}
              >
                <Delete className={styles.tableIcon} />
              </button>
            </div>
          );
        }
      }
    ],
    [confirmDelete, showEditModal]
  );

  const dataSource = useMemo(
    () =>
      txBundle.map((tx, index) => ({
        id: index,
        to: tx.to
          ? utils.getAddress(tx.to)
          : utils.getAddress(transactionReceipts[index].contractAddress),
        data: tx.data || '0x',
        value: utils.formatEther(tx.value ? tx.value : '0')
      })),
    [txBundle, transactionReceipts]
  );

  return (
    <div className={styles.transactions}>
      <h1 className={styles.transactionsTitle}>Transactions</h1>
      <div className={styles.action}>
        <button
          className={styles.actionButton}
          title={'Clear transaction'}
          onClick={clearTransaction}
        >
          <Clear className={styles.actionIcon} />
        </button>
        <button
          className={styles.actionButton}
          title={'Replay transaction'}
          onClick={() => replayTransaction(txBundle, true)}
        >
          <Replay className={styles.actionIcon} />
        </button>
        <button
          className={styles.actionButton}
          title={'Add transaction'}
          onClick={showAddModal}
        >
          <Add className={styles.actionIcon} />
        </button>
        <button
          className={styles.actionButton}
          title={'Copy txBundle'}
          onClick={showCopyModal}
        >
          <Copy className={styles.actionIcon} />
        </button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        draggable={true}
        tableData={txBundle}
        setTable={sortTransaction}
        className={styles.table}
      />
      <Modal
        visible={confirm}
        className={styles.confirm}
        title={'Confirm Delete'}
        onClose={setConfirm}
      >
        <div className={styles.confirmBody}>
          {`Would you like to delete transaction ${selectedIndex} ?`}
        </div>
        <div className={styles.confirmFooter}>
          <Button color="standard" onClick={() => setConfirm(false)}>
            {'Close'}
          </Button>
          <Button color="primary" onClick={deleteTransaction}>
            {'Delete'}
          </Button>
        </div>
      </Modal>
      <Modal
        visible={edit}
        className={styles.edit}
        title={'Edit Transaction'}
        onClose={setEdit}
      >
        <div className={styles.editBody}>
          <div className={styles.editItem}>
            <label className={styles.editLabel}>Index {selectedIndex}</label>
          </div>
          <div className={styles.editItem}>
            <label className={styles.editLabel}>From</label>
            <Textarea
              value={selectedBundle.from}
              disabled={true}
              onChange={event => changeHandler(event, 'from')}
            />
          </div>
          <div className={styles.editItem}>
            <label className={styles.editLabel}>To</label>
            <Textarea
              value={selectedBundle.to}
              onChange={event => changeHandler(event, 'to')}
            />
          </div>
          <div className={styles.editItem}>
            <label className={styles.editLabel}>Data</label>
            <Textarea
              rows={6}
              value={selectedBundle.data}
              onChange={event => changeHandler(event, 'data')}
            />
          </div>
          <div className={styles.editItem}>
            <label className={styles.editLabel}>Value</label>
            <Textarea
              value={selectedBundle.value as string}
              onChange={event => changeHandler(event, 'value')}
            />
          </div>
        </div>
        <div className={styles.editFooter}>
          <Button color="standard" onClick={() => setEdit(false)}>
            {'Close'}
          </Button>
          <Button color="primary" onClick={editTrancation}>
            {'Save'}
          </Button>
        </div>
      </Modal>
      <Modal
        visible={add}
        className={styles.add}
        title={'Add Transaction'}
        onClose={setAdd}
      >
        <div className={styles.addBody}>
          <div className={styles.addItem}>
            <label className={styles.addLabel}>From</label>
            <Textarea
              value={selectedBundle.from}
              onChange={event => changeHandler(event, 'from')}
            />
          </div>
          <div className={styles.addItem}>
            <label className={styles.addLabel}>To</label>
            <Textarea
              value={selectedBundle.to}
              onChange={event => changeHandler(event, 'to')}
            />
          </div>
          <div className={styles.addItem}>
            <label className={styles.addLabel}>Data</label>
            <Textarea
              rows={6}
              value={selectedBundle.data}
              onChange={event => changeHandler(event, 'data')}
            />
          </div>
          <div className={styles.addItem}>
            <label className={styles.addLabel}>Value</label>
            <Textarea
              value={selectedBundle.value as string}
              onChange={event => changeHandler(event, 'value')}
            />
          </div>
        </div>
        <div className={styles.addFooter}>
          <Button color="standard" onClick={() => setAdd(false)}>
            {'Close'}
          </Button>
          <Button color="primary" onClick={addTransaction}>
            {'Add'}
          </Button>
        </div>
      </Modal>
      <Modal
        visible={copy}
        className={styles.copy}
        title={'Copy txBundle'}
        onClose={setCopy}
      >
        <div className={styles.addBody}>
          <Textarea rows={12} defaultValue={txBundleString} />
        </div>
        <div className={styles.addFooter}>
          <Button color="standard" onClick={() => setCopy(false)}>
            {'Close'}
          </Button>
          <Button color="primary" onClick={copyTxBundle}>
            {'Copy'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default memo(TransactionsView);
