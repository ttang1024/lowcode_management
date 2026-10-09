/**
 * @module errors
 * @description Maps errors thrown by handlers to an HTTP status and a safe message.
 */
import { BaseError, UniqueConstraintError, ValidationError } from 'sequelize';
import { ModelNotInitializedError } from 'sequelize-typescript/dist/model/shared/model-not-initialized-error';
import GeneralResult from './entity/GeneralResult';
import Logger from './logger';

const logger = new Logger();

/** An error whose message is meant for the client, e.g. a bad request. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Throws a 400 unless `id` is a positive integer; returns it as a number. */
export function requireId(id: unknown) {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 1) throw new HttpError(400, 'A valid id is required');
  return value;
}

/**
 * Client errors keep their message (validation failures such as "Duplicate
 * app code" are meant for the user). Anything else is logged in full and
 * answered with a generic 500, so SQL and stack details never reach clients.
 */
export function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return { status: error.status, body: GeneralResult.fail(error.status, error.message) };
  }
  if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
    const message = error.errors?.map((e) => e.message).join('; ') || error.message;
    return { status: 400, body: GeneralResult.fail(400, message) };
  }
  if (error instanceof ModelNotInitializedError) {
    // No database connection, e.g. under `npm run dev:web` (frontend only).
    return { status: 503, body: GeneralResult.fail(503, 'The database is not available') };
  }
  if (error instanceof SyntaxError && 'body' in error) {
    // Malformed JSON body (from express.json).
    return { status: 400, body: GeneralResult.fail(400, 'Malformed request body') };
  }
  logger.log('Unhandled error', error instanceof BaseError ? `${error.name}: ${error.message}` : error);
  return { status: 500, body: GeneralResult.fail(500, 'Internal server error') };
}
