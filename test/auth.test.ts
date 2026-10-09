import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_PASSWORD = 'correct horse';

const auth = require('../src/api/lowcode-api/framework/auth') as typeof import('../src/api/lowcode-api/framework/auth');

/** Just enough of Express's req/res for the auth helpers. */
function fakeExchange(ip: string, cookie = '') {
  const cookies: Record<string, { value: string, options: any }> = {};
  const req = { ip, headers: { cookie }, secure: false, socket: {} } as any;
  const res = { cookie: (name: string, value: string, options: any) => (cookies[name] = { value, options }) } as any;
  return { req, res, cookies };
}

test('a wrong password is refused and sets no cookie', () => {
  const { req, res, cookies } = fakeExchange('10.0.0.1');
  assert.equal(auth.login(req, res, 'wrong'), false);
  assert.deepEqual(cookies, {});
});

test('the right password issues an httpOnly, SameSite=Lax session that authenticates', () => {
  const { req, res, cookies } = fakeExchange('10.0.0.2');
  assert.equal(auth.login(req, res, 'correct horse'), true);
  const session = cookies.lowcode_session;
  assert.equal(session.options.httpOnly, true);
  assert.equal(session.options.sameSite, 'lax');
  assert.equal(auth.isAuthenticated(fakeExchange('10.0.0.2', `lowcode_session=${session.value}`).req), true);
});

test('a tampered or expired session is rejected', () => {
  const { req, res, cookies } = fakeExchange('10.0.0.3');
  auth.login(req, res, 'correct horse');
  const [payload, signature] = cookies.lowcode_session.value.split('.');
  const later = Buffer.from(String(Date.now() + 1e12)).toString('base64url');
  assert.equal(auth.isAuthenticated(fakeExchange('x', `lowcode_session=${later}.${signature}`).req), false);
  assert.equal(auth.isAuthenticated(fakeExchange('x', `lowcode_session=${payload}.x${signature.slice(1)}`).req), false);
  assert.equal(auth.isAuthenticated(fakeExchange('x', '').req), false);
});

test('ten failures throttle that client only, and success resets it', () => {
  const { req, res } = fakeExchange('10.0.0.4');
  for (let i = 0; i < 10; i++) auth.login(req, res, 'wrong');
  assert.equal(auth.isThrottled(req), true);
  assert.equal(auth.isThrottled(fakeExchange('10.0.0.5').req), false);
  auth.login(req, res, 'correct horse');
  assert.equal(auth.isThrottled(req), false);
});
