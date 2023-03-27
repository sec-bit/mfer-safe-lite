import type { Payload } from './types';

export type JsonRpcPayload = Payload & {
  readonly params: readonly unknown[];
  readonly jsonrpc: '2.0';
  readonly id: number;
};

export function createPayload(
  method: string,
  params: readonly unknown[] = [],
  id = 0
): JsonRpcPayload {
  const payload: JsonRpcPayload = {
    id,
    method,
    params,
    jsonrpc: '2.0'
  };

  return payload;
}
