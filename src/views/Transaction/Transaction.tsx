import { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { JSONTree } from 'react-json-tree';
import { utils, BigNumberish } from 'ethers';
import {
  processEventLogs,
  ProcessedEvents,
  loadTokenMapping
} from '@/utils/transaction';
import { Table } from '@/components';
import { ReactComponent as Back } from '@/assets/icons/arrow-left.svg';
import styles from './transaction.module.css';

const tokenMapping = loadTokenMapping();

const TransactionView = () => {
  const { transactionId } = useParams();

  const [eventLogs, setEventLogs] = useState<ProcessedEvents>(
    {} as ProcessedEvents
  );
  const [trace, setTrace] = useState({});

  useEffect(() => {
    chrome.storage.local
      .get(['transactionReceipts'])
      .then(({ transactionReceipts }) => {
        if (transactionReceipts) {
          const receipt = transactionReceipts[Number(transactionId)];
          if (receipt) {
            setEventLogs(processEventLogs(receipt.logs));
            const data = receipt.logs.at(-1).data;
            if (data) {
              setTrace(JSON.parse(utils.toUtf8String(data)));
            }
          }
        }
      });
  }, [transactionId]);

  const balanceColumns = useMemo(
    () => [
      {
        name: 'account',
        label: 'Account'
      },
      {
        name: 'token',
        label: 'Token'
      },
      {
        name: 'balance',
        label: 'Balance'
      }
    ],
    []
  );

  const balanceDataSource = useMemo(() => {
    const rows = [];
    if (eventLogs.userTokenBalance) {
      for (const [account, tokenBalance] of Object.entries(
        eventLogs.userTokenBalance
      )) {
        for (const [token, balance] of Object.entries(tokenBalance)) {
          const key = token.toLowerCase();
          if (key in tokenMapping) {
            rows.push({
              account,
              token: tokenMapping[key].symbol,
              balance: utils.formatUnits(
                balance as BigNumberish,
                tokenMapping[key].decimals
              )
            });
          } else {
            rows.push({
              account,
              token: token.toString(),
              balance: (balance as BigNumberish).toString()
            });
          }
        }
      }
    }
    return rows;
  }, [eventLogs.userTokenBalance]);

  const transferColumns = useMemo(
    () => [
      {
        name: 'from',
        label: 'Sender'
      },
      {
        name: 'token',
        label: 'Token'
      },
      {
        name: 'amount',
        label: 'Amount'
      },
      {
        name: 'to',
        label: 'Receiver'
      }
    ],
    []
  );

  const transferDataSource = useMemo(() => {
    if (eventLogs.transferERC20Events) {
      return eventLogs.transferERC20Events.map(event => {
        const key = event.token.toLowerCase();
        if (key in tokenMapping) {
          return {
            from: event.from,
            token: tokenMapping[key].symbol,
            amount: utils.formatUnits(
              event.amount as BigNumberish,
              tokenMapping[key].decimals
            ),
            to: event.to
          };
        } else {
          return event;
        }
      });
    } else {
      return [];
    }
  }, [eventLogs.transferERC20Events]);

  const approvalColumns = useMemo(
    () => [
      {
        name: 'token',
        label: 'Token'
      },
      {
        name: 'owner',
        label: 'Owner'
      },
      {
        name: 'spender',
        label: 'Spender'
      },
      {
        name: 'amount',
        label: 'Amount'
      }
    ],
    []
  );

  const approvalDataSource = useMemo(() => {
    if (eventLogs.approvalERC20Events) {
      return eventLogs.approvalERC20Events.map(event => {
        const key = event.token.toLowerCase();
        if (key in tokenMapping) {
          return {
            token: tokenMapping[key].symbol,
            owner: event.owner,
            spender: event.spender,
            amount:
              event.amount === 'infinite'
                ? event.amount
                : utils.formatUnits(
                    event.amount as BigNumberish,
                    tokenMapping[key].decimals
                  )
          };
        } else {
          return event;
        }
      });
    } else {
      return [];
    }
  }, [eventLogs.approvalERC20Events]);

  const approvalForAllColumns = useMemo(
    () => [
      {
        name: 'token',
        label: 'Token'
      },
      {
        name: 'owner',
        label: 'Owner'
      },
      {
        name: 'operator',
        label: 'Operator'
      },
      {
        name: 'approved',
        label: 'Approved'
      }
    ],
    []
  );

  const approvalForAllDataSource = useMemo(() => {
    if (eventLogs.approvalForAllEvents) {
      return eventLogs.approvalForAllEvents.map(event => {
        const key = event.token.toLowerCase();
        if (key in tokenMapping) {
          return {
            token: tokenMapping[key].symbol,
            owner: event.owner,
            operator: event.operator,
            approved: event.approved
          };
        } else {
          return event;
        }
      });
    } else {
      return [];
    }
  }, [eventLogs.approvalForAllEvents]);

  const transferNFTColumns = useMemo(
    () => [
      {
        name: 'from',
        label: 'Sender'
      },
      {
        name: 'token',
        label: 'Token'
      },
      {
        name: 'tokenID',
        label: 'ID'
      },
      {
        name: 'to',
        label: 'Receiver'
      }
    ],
    []
  );

  const transferNFTDataSource = useMemo(() => {
    if (eventLogs.transferERC721Events) {
      return eventLogs.transferERC721Events.map(event => {
        const key = event.token.toLowerCase();
        if (key in tokenMapping) {
          return {
            from: event.from,
            token: tokenMapping[key].symbol,
            tokenID: event.tokenID,
            to: event.to
          };
        } else {
          return event;
        }
      });
    } else {
      return [];
    }
  }, [eventLogs.transferERC721Events]);

  const approvalNFTColumns = useMemo(
    () => [
      {
        name: 'token',
        label: 'Token'
      },
      {
        name: 'owner',
        label: 'Owner'
      },
      {
        name: 'spender',
        label: 'Spender'
      },
      {
        name: 'tokenID',
        label: 'ID'
      }
    ],
    []
  );

  const approvalNFTDataSource = useMemo(() => {
    if (eventLogs.approvalERC721Events) {
      return eventLogs.approvalERC721Events.map(event => {
        const key = event.token.toLowerCase();
        if (key in tokenMapping) {
          return {
            token: tokenMapping[key].symbol,
            owner: event.owner,
            spender: event.spender,
            tokenID: event.tokenID
          };
        } else {
          return event;
        }
      });
    } else {
      return [];
    }
  }, [eventLogs.approvalERC721Events]);

  return (
    <div className={styles.transaction}>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          <NavLink className={styles.back} to=".." relative="path">
            <Back className={styles.backIcon} />
          </NavLink>
          Transaction
        </h1>
        {eventLogs.userTokenBalance &&
          Object.keys(eventLogs.userTokenBalance).length > 0 && (
            <div className={styles.log}>
              <h2 className={styles.logTitle}>Balance Changes</h2>
              <Table
                columns={balanceColumns}
                dataSource={balanceDataSource}
                className={styles.logTable}
              />
            </div>
          )}
        {eventLogs.transferERC20Events?.length > 0 && (
          <div className={styles.log}>
            <h2 className={styles.logTitle}>Token Transfers</h2>
            <Table
              columns={transferColumns}
              dataSource={transferDataSource}
              className={styles.logTable}
            />
          </div>
        )}
        {eventLogs.approvalERC20Events?.length > 0 && (
          <div className={styles.log}>
            <h2 className={styles.logTitle}>Token Approvals</h2>
            <Table
              columns={approvalColumns}
              dataSource={approvalDataSource}
              className={styles.logTable}
            />
          </div>
        )}
        {eventLogs.approvalForAllEvents?.length > 0 && (
          <div className={styles.log}>
            <h2 className={styles.logTitle}>
              [NFT] Set Approval For All: ⚠️⚠️
            </h2>
            <Table
              columns={approvalForAllColumns}
              dataSource={approvalForAllDataSource}
              className={styles.logTable}
            />
          </div>
        )}
        {eventLogs.transferERC721Events?.length > 0 && (
          <div className={styles.log}>
            <h2 className={styles.logTitle}>[NFT] Transfers</h2>
            <Table
              columns={transferNFTColumns}
              dataSource={transferNFTDataSource}
              className={styles.logTable}
            />
          </div>
        )}
        {eventLogs.approvalERC721Events?.length > 0 && (
          <div className={styles.log}>
            <h2 className={styles.logTitle}>[NFT] Approvals</h2>
            <Table
              columns={approvalNFTColumns}
              dataSource={approvalNFTDataSource}
              className={styles.logTable}
            />
          </div>
        )}
        {Object.keys(trace).length > 0 && (
          <div className={styles.log}>
            <h2 className={styles.logTitle}>Trace</h2>
            <JSONTree data={trace} theme={'bright'} invertTheme={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionView;
