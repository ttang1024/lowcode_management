/**
 * @module auth
 * @description
 *   Admin authentication: a single admin password (`ADMIN_PASSWORD`) exchanged
 *   at `/auth/login` for a signed, httpOnly session cookie. The session is
 *   stateless (expiry + HMAC), so it survives restarts and works across
 *   instances that share the same secret.
 *
 *   `SESSION_SECRET` signs the cookie; without it the key is derived from the
 *   password, so changing the password also signs everyone out.
 *
 *   In development with no password set, authentication is disabled (with a
 *   warning) so `npm start` keeps working out of the box. In production a
 *   missing password is a startup error.
 */
import crypto from 'crypto';
import type { Request, Response } from 'lowcode-server';
import { RateLimiter } from './rate-limit';

const COOKIE = 'lowcode_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// Login throttling: at most 10 failed attempts per client per 15 minutes.
const failures = new RateLimiter(10, 15 * 60 * 1000);

const password = process.env.ADMIN_PASSWORD || '';
const secret = process.env.SESSION_SECRET || (password && sha256(`lowcode-session:${password}`));

/** Whether admin routes require a session. */
export const authEnabled = !!password;

/** Throws when the server would start with admin routes open to everyone in production. */
export function assertAuthConfigured() {
  if (authEnabled) return;
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('ADMIN_PASSWORD must be set: the admin API would otherwise be open to anyone.');
  }
  console.warn('Lowcode: ADMIN_PASSWORD is not set; the admin API is unauthenticated (development only).');
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sign(payload: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Compares in constant time; hashing first makes the lengths equal. */
function safeEqual(a: string, b: string) {
  return crypto.timingSafeEqual(Buffer.from(sha256(a)), Buffer.from(sha256(b)));
}

function readCookie(req: Request, name: string) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=');
    if (index > -1 && part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return '';
}

function isHttps(req: Request) {
  return req.secure || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function setSessionCookie(req: Request, res: Response, value: string, maxAgeMs: number) {
  res.cookie(COOKIE, value, {
    httpOnly: true,
    // Lax keeps the cookie off cross-site POSTs (CSRF) while still sending it
    // to sibling environments on the same site (cross-environment sync).
    sameSite: 'lax',
    secure: isHttps(req),
    path: '/',
    maxAge: maxAgeMs,
  });
}

/** True when the request carries a valid, unexpired session (or auth is disabled). */
export function isAuthenticated(req: Request) {
  if (!authEnabled) return true;
  const [payload, signature] = readCookie(req, COOKIE).split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  const expiresAt = Number(Buffer.from(payload, 'base64url').toString());
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/** Whether this client has used up its failed login attempts for the current window. */
export function isThrottled(req: Request) {
  return failures.isBlocked(req);
}

/**
 * Checks the password and, when it matches, starts a session.
 * Returns false (and counts the failure) otherwise.
 */
export function login(req: Request, res: Response, attempt: unknown) {
  if (!authEnabled) return true;
  if (typeof attempt !== 'string' || !safeEqual(attempt, password)) {
    failures.record(req);
    return false;
  }
  failures.reset(req);
  const payload = Buffer.from(String(Date.now() + SESSION_TTL_MS)).toString('base64url');
  setSessionCookie(req, res, `${payload}.${sign(payload)}`, SESSION_TTL_MS);
  return true;
}

export function logout(req: Request, res: Response) {
  setSessionCookie(req, res, '', 0);
}
