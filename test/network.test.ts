import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { type BizError, Network, RESEND } from '../packages/lowcode-common/src/network';

type Reply = { status: number, body: unknown };
const realFetch = globalThis.fetch;
let replies: Reply[];
let calls: number;

beforeEach(() => {
  calls = 0;
  globalThis.fetch = (async() => {
    const reply = replies[Math.min(calls++, replies.length - 1)];
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

// Handlers are global to Network, so each test registers what it needs once.
let resendOnce: (() => boolean) | null = null;
Network.on('response', async(payload: any) => {
  if (payload?.errorCode === 'AUTH_REQUIRED' && resendOnce?.()) return RESEND;
  return payload;
});

test('a 2xx JSON response resolves with its body', async() => {
  replies = [{ status: 200, body: { ok: 1 } }];
  assert.deepEqual(await new Network({ base: 'http://x' }).get('/a').json(), { ok: 1 });
});

test('a non-2xx response rejects with a BizError carrying status and body', async() => {
  replies = [{ status: 500, body: { errorMsg: 'Internal server error' } }];
  await assert.rejects(new Network({ base: 'http://x' }).get('/a').json().silent(), (error: BizError) => {
    assert.equal(error.code, 500);
    assert.equal(error.message, 'Internal server error');
    assert.deepEqual(error.data, { errorMsg: 'Internal server error' });
    return true;
  });
});

test('a handler returning RESEND sends the request again', async() => {
  let resent = false;
  resendOnce = () => (resent ? false : (resent = true));
  replies = [{ status: 401, body: { errorCode: 'AUTH_REQUIRED' } }, { status: 200, body: { done: true } }];
  assert.deepEqual(await new Network({ base: 'http://x' }).post('/publish', {}).json(), { done: true });
  assert.equal(calls, 2);
  resendOnce = null;
});

test('resends are bounded', async() => {
  resendOnce = () => true;
  replies = [{ status: 401, body: { errorCode: 'AUTH_REQUIRED' } }];
  await assert.rejects(new Network({ base: 'http://x' }).post('/publish', {}).json().silent(), /not accepted/);
  assert.equal(calls, 3);
  resendOnce = null;
});
