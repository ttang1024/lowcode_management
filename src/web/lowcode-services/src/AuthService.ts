/**
 * @name AuthService
 * @description Admin sign-in against the lowcode API (see AuthController)
 */
import type { GeneralResult } from 'lowcode-api/framework';
import ApiService from './ApiService';

export interface AuthState {
  authenticated: boolean
  /** False when the server runs without ADMIN_PASSWORD (development). */
  required: boolean
}

type Listener = () => void;

// Only service instances are exported from this package: the build rewrites
// `import { X } from 'lowcode-services'` to `lowcode-services/src/X`.
class AuthService extends ApiService {
  /** Error code the API answers with when a route needs a session. */
  readonly AUTH_REQUIRED = 'AUTH_REQUIRED';

  private listeners = new Set<Listener>();

  me() {
    return this.get<GeneralResult<AuthState>>('/auth/me').json().silent();
  }

  login(password: string) {
    return this.post<GeneralResult<AuthState>>('/auth/login', { password }).json().silent();
  }

  logout() {
    return this.post<GeneralResult<AuthState>>('/auth/logout', {}).json();
  }

  private waiting: Array<() => void> = [];

  /** Called by the network layer when an API call was rejected for lack of a session. */
  notifyUnauthorized() {
    this.listeners.forEach((listener) => listener());
  }

  /** Whether a sign-in screen is listening (the studio), so a rejected call can wait for it. */
  get canPromptSignIn() {
    return this.listeners.size > 0;
  }

  /** Resolves once the user has signed in again. */
  waitForSignIn() {
    return new Promise<void>((resolve) => this.waiting.push(resolve));
  }

  /** Called by the sign-in screen after a successful sign-in; releases the waiting calls. */
  notifySignedIn() {
    const waiting = this.waiting;
    this.waiting = [];
    waiting.forEach((resolve) => resolve());
  }

  /** Subscribe to session loss; returns the unsubscribe function. */
  onUnauthorized(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export default new AuthService();
