import { BigNumber, BigNumberish } from 'ethers';

export type TransactionRequest = {
  data?: string;
  from: string;
  to?: string;
  gas: BigNumberish;
  value?: BigNumberish;
};

export interface Transaction {
  hash?: string;
  to?: string;
  from?: string;
  nonce: number;
  gas: BigNumber;
  gasPrice?: BigNumber;
  input: string;
  value: BigNumber;
  r?: string;
  s?: string;
  v?: number;
  type?: number | null;
}

export interface TransactionResponse extends Transaction {
  hash: string;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex: number;
  from: string;
}

export interface Log {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: Array<string>;
  transactionHash: string;
  logIndex: number;
}

export interface TransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  root?: string;
  gasUsed: BigNumber;
  logsBloom: string;
  blockHash: string;
  transactionHash: string;
  logs: Array<Log>;
  blockNumber: number;
  cumulativeGasUsed: BigNumber;
  type: number;
  status?: number;
}

export interface Diff {
  balance?: BigNumber;
  code?: string;
  nonce?: number;
  stateDiff?: Record<string, string>;
}

export interface StateDiff {
  [key: string]: Diff;
}
