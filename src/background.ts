/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpSend } from '@/utils/http';
import { JsonRpcResponse } from '@/provider/types';
import { SETTINGS } from '@/constants/settings';
import {
  TransactionRequest,
  TransactionResponse,
  TransactionReceipt,
  StateDiff
} from './types';

const settings = SETTINGS;
const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

const randomizedAddress = genRanHex(40);
let stateDiff: StateDiff = {};
let txBundle: TransactionRequest[] = [];
let transactions: TransactionResponse[] = [];
let transactionReceipts: TransactionReceipt[] = [];

(async () => {
  const keys = Object.keys(settings);
  const savedSettings = await chrome.storage.local.get(keys);
  keys.forEach(key => {
    if (key in savedSettings) {
      settings[key] = savedSettings[key];
    }
  });
})();

chrome.storage.onChanged.addListener(changes => {
  for (const [key, { newValue }] of Object.entries(changes)) {
    if (key in settings) {
      settings[key] = newValue;
    }
  }
});

function replaceAddress(
  rawText: Record<string, any>,
  search = randomizedAddress,
  replace = settings.impersonatedAccount
) {
  if (settings.addrRandomize) {
    search = search.toLowerCase().replace(/^0x/, '');
    replace = replace.toLowerCase().replace(/^0x/, '');
    const text = JSON.stringify(rawText);
    const re = new RegExp(search, 'ig');
    const result = text.replace(re, replace);
    return JSON.parse(result);
  } else {
    return rawText;
  }
}

// https://developer.chrome.com/apps/runtime#event-onMessage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request),
    method: 'POST'
  };

  switch (request.method) {
    case 'mfer_clear': {
      stateDiff = {};
      txBundle = [];
      transactions = [];
      transactionReceipts = [];
      chrome.storage.local.set({ txBundle, transactionReceipts });
      sendResponse(true);
      break;
    }
    case 'eth_accounts':
    case 'eth_requestAccounts': {
      const res: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id,
        result: [
          settings.addrRandomize
            ? randomizedAddress
            : settings.impersonatedAccount
        ]
      };
      sendResponse(res);
      break;
    }
    case 'eth_estimateGas': {
      const res: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id,
        result: '0xffffff'
      };
      sendResponse(res);
      break;
    }
    case 'eth_call': {
      if (request.params.length < 3) {
        request.params.push(stateDiff);
      } else {
        request.params[2] = stateDiff;
      }
      request.params[0] = replaceAddress(request.params[0]);
      options.body = JSON.stringify(request);
      httpSend(settings.ETHRPC, options).then(res => {
        sendResponse(res);
      });
      break;
    }
    case 'eth_getBalance': {
      request = replaceAddress(request);
      options.body = JSON.stringify(request);
      const address = settings.impersonatedAccount.toLowerCase();
      if (stateDiff[address]?.balance) {
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: stateDiff[address].balance
        };
        sendResponse(res);
      } else {
        httpSend(settings.ETHRPC, options).then(res => {
          sendResponse(res);
        });
      }
      break;
    }
    case 'eth_getCode': {
      request = replaceAddress(request);
      options.body = JSON.stringify(request);
      const address = settings.impersonatedAccount.toLowerCase();
      if (stateDiff[address]?.code) {
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: stateDiff[address].code
        };
        sendResponse(res);
      } else {
        httpSend(settings.ETHRPC, options).then(res => {
          sendResponse(res);
        });
      }
      break;
    }
    case 'eth_sendTransaction': {
      const txArgs = replaceAddress(request.params[0]);
      txBundle.push(txArgs);
      chrome.storage.local.set({
        txBundle
      });
      request.method = 'mfer_traceTransactionBundle';
      request.params = [txBundle];
      options.body = JSON.stringify(request);
      httpSend(settings.mferRPC, options).then(async response => {
        stateDiff = response.result.stateDiff;
        transactions = response.result.transactions;
        transactionReceipts = response.result.transactionReceipts;
        await chrome.storage.local.set({
          transactionReceipts
        });
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: response.result.lastTxHash
        };
        sendResponse(res);
      });
      break;
    }
    case 'mfer_traceTransactionBundle': {
      txBundle = request.params[0];
      chrome.storage.local.set({
        txBundle
      });
      httpSend(settings.mferRPC, options).then(async response => {
        stateDiff = response.result.stateDiff;
        transactions = response.result.transactions;
        transactionReceipts = response.result.transactionReceipts;
        await chrome.storage.local.set({
          transactionReceipts
        });
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: response.result.lastTxHash
        };
        sendResponse(res);
      });
      break;
    }
    case 'eth_getTransactionByHash': {
      const hash = request.params[0];
      let transaction = transactions.find(trans => trans.hash === hash);
      if (transaction) {
        transaction = replaceAddress(
          transaction,
          settings.impersonatedAccount,
          randomizedAddress
        );
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: transaction
        };
        sendResponse(res);
      } else {
        httpSend(settings.ETHRPC, options).then(res => {
          sendResponse(res);
        });
      }
      break;
    }
    case 'eth_getTransactionReceipt': {
      const hash = request.params[0];
      const transactionReceipt = transactionReceipts.find(
        receipt => receipt.transactionHash === hash
      );
      if (transactionReceipt) {
        // strip the last log (mfersafe's private field) in transactionReceipt
        transactionReceipt.logs = transactionReceipt.logs.slice(0, -1);
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: request.id,
          result: transactionReceipt
        };
        sendResponse(res);
      } else {
        httpSend(settings.ETHRPC, options).then(res => {
          sendResponse(res);
        });
      }
      break;
    }

    default: {
      httpSend(settings.ETHRPC, options).then(res => {
        sendResponse(res);
      });
    }
  }

  return true;
});
