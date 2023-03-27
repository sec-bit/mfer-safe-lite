import { MFER_RPC, ETH_RPC } from './address';

export interface ISettings {
  addrRandomize: boolean;
  impersonatedAccount: string;
  mferRPC: string;
  ETHRPC: string;
  [key: string]: boolean | string;
}

export const SETTINGS: ISettings = {
  addrRandomize: false,
  impersonatedAccount: '0x0000000000000000000000000000000000000000',
  mferRPC: MFER_RPC,
  ETHRPC: ETH_RPC
};
