/**
 * @module rate-limit
 * @description
 *   Fixed-window counters per client IP, kept in memory (per process). Behind
 *   a load balancer set TRUST_PROXY so `req.ip` is the client, not the balancer.
 */
import type { Request } from 'lowcode-server';

// Past this many tracked clients, expired windows are swept on the next new one.
const SWEEP_AT = 10000;

export class RateLimiter {
  private windows = new Map<string, { count: number, resetAt: number }>();

  /** At most `max` events per client in each `windowMs`. */
  constructor(private max: number, private windowMs: number) {}

  private key(req: Request) {
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  private current(req: Request) {
    const entry = this.windows.get(this.key(req));
    if (entry && entry.resetAt <= Date.now()) {
      this.windows.delete(this.key(req));
      return undefined;
    }
    return entry;
  }

  /** Whether the client has used up its events for the current window. */
  isBlocked(req: Request) {
    return (this.current(req)?.count || 0) >= this.max;
  }

  /** Counts one event for the client. */
  record(req: Request) {
    const entry = this.current(req);
    if (entry) {
      entry.count++;
      return;
    }
    if (this.windows.size >= SWEEP_AT) {
      const now = Date.now();
      this.windows.forEach((value, key) => value.resetAt <= now && this.windows.delete(key));
    }
    this.windows.set(this.key(req), { count: 1, resetAt: Date.now() + this.windowMs });
  }

  /** Counts one event; false when the client was already over the limit. */
  hit(req: Request) {
    if (this.isBlocked(req)) return false;
    this.record(req);
    return true;
  }

  /** Forgets the client, e.g. after a successful login. */
  reset(req: Request) {
    this.windows.delete(this.key(req));
  }
}
