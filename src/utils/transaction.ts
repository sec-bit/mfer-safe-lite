/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber } from 'ethers';
import sushiTokenList from '@sushiswap/default-token-list';
import { Log } from '@/types';

const namedtopics = {
  Approval:
    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
  Transfer:
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ApprovalForAll:
    '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31'
};

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
}
export function loadTokenMapping() {
  const tokenMapping: Record<string, Token> = {};
  sushiTokenList.tokens.forEach(token => {
    tokenMapping[token.address.toLowerCase()] = {
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals
    };
  });
  return tokenMapping;
}

export type Event = Record<string, string>;
export interface ProcessedEvents {
  approvalERC20Events: Event[];
  approvalERC721Events: Event[];
  approvalForAllEvents: Event[];
  transferERC20Events: Event[];
  transferERC721Events: Event[];
  userTokenBalance: Record<string, any>;
}

export function processEventLogs(events: Array<Log>) {
  let eventLog: Event;
  let amount;
  let tokenID;
  const approvalERC20Events: Event[] = [];
  const approvalERC721Events: Event[] = [];
  const approvalForAllEvents: Event[] = [];
  const transferERC20Events: Event[] = [];
  const transferERC721Events: Event[] = [];
  const userTokenBalance: Record<string, any> = {};

  const processedEvents = {
    approvalERC20Events: approvalERC20Events,
    approvalERC721Events: approvalERC721Events,
    approvalForAllEvents: approvalForAllEvents,
    transferERC20Events: transferERC20Events,
    transferERC721Events: transferERC721Events,
    userTokenBalance: userTokenBalance
  };

  events.forEach(event => {
    if (event.topics?.length) {
      switch (event.topics[0]) {
        case namedtopics.Transfer: {
          eventLog = {
            token: event.address,
            from: '0x' + event.topics[1].slice(-40),
            to: '0x' + event.topics[2].slice(-40)
          };
          switch (event.topics.length) {
            // ERC20
            case 3: {
              amount = BigNumber.from(event.data);
              eventLog['amount'] = BigNumber.from(event.data).toString();
              transferERC20Events.push(eventLog);
              userTokenBalance[eventLog.from] =
                userTokenBalance[eventLog.from] || {};
              userTokenBalance[eventLog.to] =
                userTokenBalance[eventLog.to] || {};
              userTokenBalance[eventLog.from][eventLog.token] =
                userTokenBalance[eventLog.from][eventLog.token] ||
                BigNumber.from(0);
              userTokenBalance[eventLog.to][eventLog.token] =
                userTokenBalance[eventLog.to][eventLog.token] ||
                BigNumber.from(0);
              userTokenBalance[eventLog.from][eventLog.token] =
                userTokenBalance[eventLog.from][eventLog.token].sub(amount);
              userTokenBalance[eventLog.to][eventLog.token] =
                userTokenBalance[eventLog.to][eventLog.token].add(amount);
              break;
            }
            // ERC721
            case 4: {
              tokenID = BigNumber.from(event.topics[3]);
              // assume token id is hash, use hex format
              eventLog['tokenID'] = tokenID.shr(128).eq(0)
                ? tokenID.toString()
                : event.topics[3];
              transferERC721Events.push(eventLog);
              break;
            }
          }
          break;
        }
        case namedtopics.Approval: {
          eventLog = {
            token: event.address,
            owner: '0x' + event.topics[1].slice(-40),
            spender: '0x' + event.topics[2].slice(-40)
          };
          switch (event.topics.length) {
            // ERC20
            case 3: {
              amount = BigNumber.from(event.data);
              // assume above 2**254 is infinite
              eventLog['amount'] = amount.shr(254).eq(0)
                ? BigNumber.from(event.data).toString()
                : 'infinite';
              approvalERC20Events.push(eventLog);
              break;
            }
            // ERC721
            case 4: {
              tokenID = BigNumber.from(event.topics[3]);
              // assume token id is hash, use hex format
              eventLog['tokenID'] = tokenID.shr(128).eq(0)
                ? tokenID.toString()
                : event.topics[3];
              approvalERC721Events.push(eventLog);
              break;
            }
          }
          break;
        }
        case namedtopics.ApprovalForAll: {
          eventLog = {
            token: event.address,
            owner: '0x' + event.topics[1].slice(-40),
            operator: '0x' + event.topics[2].slice(-40),
            approved:
              event.data !==
              '0x0000000000000000000000000000000000000000000000000000000000000000'
                ? 'YES'
                : 'NO'
          };
          approvalForAllEvents.push(eventLog);
          break;
        }
      }
    }
  });

  return processedEvents;
}
