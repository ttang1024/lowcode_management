import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type http from 'http';
import { AddressInfo } from 'net';
import { Body, Controller, Get, Param, Post, Public, Req, Res, createServer, type Request, type Response } from 'lowcode-server';

class BadRequest extends Error {
  status = 400;
}

@Controller('/things')
class ThingsController {
  @Get('/private')
  privateRoute() {
    return { ok: true };
  }

  @Public()
  @Get('/open')
  openRoute(@Param('n') n: number) {
    return { n, type: typeof n };
  }

  @Public()
  @Post('/echo')
  echo(@Body body: unknown, @Req req: Request, @Res res: Response) {
    res.setHeader('x-seen', req.method);
    return body;
  }

  @Public()
  @Get('/fail')
  fail() {
    throw new BadRequest('nope');
  }
}

@Public()
@Controller('/open-controller')
class OpenController {
  @Get('/ping')
  ping() {
    return 'pong';
  }
}

let listener: http.Server;
let base: string;

before(async() => {
  const server = createServer({
    port: 0,
    controllers: [ThingsController, OpenController],
    authenticate: (req) => req.headers.authorization === 'yes',
    unauthorized: () => ({ error: 'AUTH_REQUIRED' }),
    onError: (error: any) => ({ status: error?.status || 500, body: { error: error?.message } }),
  });
  listener = await server.listen();
  base = `http://localhost:${(listener.address() as AddressInfo).port}`;
});

after(() => listener.close());

test('private routes answer 401 without running the handler', async() => {
  const res = await fetch(`${base}/things/private`);
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'AUTH_REQUIRED' });
});

test('private routes run once authenticated', async() => {
  const res = await fetch(`${base}/things/private`, { headers: { authorization: 'yes' } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('@Public on a method or a controller skips authentication', async() => {
  assert.equal((await fetch(`${base}/things/open?n=5`)).status, 200);
  assert.equal(await (await fetch(`${base}/open-controller/ping`)).json(), 'pong');
});

test('@Param coerces to the declared type', async() => {
  assert.deepEqual(await (await fetch(`${base}/things/open?n=5`)).json(), { n: 5, type: 'number' });
});

test('@Body, @Req and @Res are bound', async() => {
  const res = await fetch(`${base}/things/echo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ a: 1 }),
  });
  assert.equal(res.headers.get('x-seen'), 'POST');
  assert.deepEqual(await res.json(), { a: 1 });
});

test('onError picks the status and body of a thrown error', async() => {
  const res = await fetch(`${base}/things/fail`);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'nope' });
});

test('a malformed JSON body goes through onError too', async() => {
  const res = await fetch(`${base}/things/echo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{bad',
  });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});
