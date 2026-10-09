import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UniqueConstraintError, ValidationError, type ValidationErrorItem } from 'sequelize';
import { isAllowedOrigin } from '../src/api/lowcode-api/framework/middleware/cors';
import { ModelNotInitializedError } from 'sequelize-typescript/dist/model/shared/model-not-initialized-error';
import { HttpError, requireId, toErrorResponse } from '../src/api/lowcode-api/framework/errors';

test('CORS allows the configured domain and its subdomains only', () => {
  assert.equal(isAllowedOrigin('https://example.com', 'example.com'), true);
  assert.equal(isAllowedOrigin('https://lowcode-in.test.example.com', 'example.com'), true);
  assert.equal(isAllowedOrigin('https://evilexample.com', 'example.com'), false);
  assert.equal(isAllowedOrigin('https://example.com.evil.io', 'example.com'), false);
  assert.equal(isAllowedOrigin('null', 'example.com'), false);
});

test('CORS allows only localhost when no domain is configured', () => {
  assert.equal(isAllowedOrigin('http://localhost:8080', ''), true);
  assert.equal(isAllowedOrigin('https://example.com', ''), false);
});

test('client errors keep their message; others become a generic 500', () => {
  assert.deepEqual(toErrorResponse(new HttpError(404, 'Page not found')).status, 404);
  const noDatabase = toErrorResponse(new ModelNotInitializedError(class AppModel {} as any, 'Member "findAll" cannot be called.'));
  assert.equal(noDatabase.status, 503);
  const validation = toErrorResponse(new ValidationError('x', [{ message: 'Duplicate app code' } as ValidationErrorItem]));
  assert.equal(validation.status, 400);
  assert.equal(validation.body.errorMsg, 'Duplicate app code');
  assert.equal(toErrorResponse(new UniqueConstraintError({ errors: [{ message: 'dup' } as ValidationErrorItem] })).status, 400);
  const original = console.log;
  console.log = () => undefined;
  try {
    const internal = toErrorResponse(new Error('ER_ACCESS_DENIED for user root@10.0.0.1'));
    assert.equal(internal.status, 500);
    assert.equal(internal.body.errorMsg, 'Internal server error');
  } finally {
    console.log = original;
  }
});

test('requireId accepts positive integers only', () => {
  assert.equal(requireId('42'), 42);
  for (const bad of [undefined, '', '0', '-1', '1.5', 'abc']) assert.throws(() => requireId(bad), /valid id/, String(bad));
});
