import React, { useContext, useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button, Input, LoadingBlock } from 'lowcode-kit';
import { AuthService } from 'lowcode-services';
import { BrandMark } from './Sidebar';

interface AuthContextValue {
  /** False when the server runs without ADMIN_PASSWORD (development), so there is nothing to sign out of. */
  required: boolean
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue>({ required: false, logout: () => undefined });

export const useAuth = () => useContext(AuthContext);

function SignIn({ onSignedIn, overlay }: { onSignedIn: () => void, overlay?: boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await AuthService.login(password);
      setPassword('');
      onSignedIn();
      AuthService.notifySignedIn();
    } catch (ex: any) {
      setError(ex?.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/10">
      <BrandMark className="size-10" />
      <h1 className="m-0 mt-5 text-xl font-bold text-slate-900">{overlay ? 'Session expired' : 'Sign in to Lowcode Studio'}</h1>
      <p className="m-0 mt-1 text-sm text-slate-500">
        {overlay ? 'Sign in again to keep working. Your unsaved changes are still here.' : 'Enter the admin password.'}
      </p>
      <Input
        className="mt-6"
        type="password"
        autoComplete="current-password"
        autoFocus
        placeholder="Password"
        aria-label="Password"
        value={password}
        status={error ? 'error' : ''}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p role="alert" className="m-0 mt-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="primary" block className="mt-5" loading={busy} disabled={!password}>
        Sign in
      </Button>
    </form>
  );

  if (!overlay) {
    return <div className="flex h-full items-center justify-center bg-[#f4f6fb] p-4">{form}</div>;
  }
  // A modal of its own, stacked above any open dialog (whose focus trap would
  // otherwise make the sign-in unreachable). It can only be left by signing in.
  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1100] bg-slate-900/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Session expired</DialogPrimitive.Title>
          {form}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * Shows the studio only to signed-in admins. An expired session (any API call
 * answered with AUTH_REQUIRED) brings the sign-in back as an overlay, so the
 * page underneath keeps its unsaved state.
 */
export default function AuthGate(props: React.PropsWithChildren) {
  const [status, setStatus] = useState<'checking' | 'signed-in' | 'signed-out'>('checking');
  const [required, setRequired] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    AuthService.me().then(
      (res) => {
        setRequired(res.result.required);
        setStatus(res.result.authenticated ? 'signed-in' : 'signed-out');
      },
      () => setStatus('signed-out'),
    );
    return AuthService.onUnauthorized(() => setExpired(true));
  }, []);

  const value = React.useMemo<AuthContextValue>(() => ({
    required,
    logout: () => {
      AuthService.logout().finally(() => setStatus('signed-out'));
    },
  }), [required]);

  const signedIn = () => {
    setExpired(false);
    setStatus('signed-in');
  };

  if (status === 'checking') return <LoadingBlock className="h-full" />;
  if (status === 'signed-out') return <SignIn onSignedIn={signedIn} />;
  return (
    <AuthContext.Provider value={value}>
      {props.children}
      {expired && <SignIn overlay onSignedIn={() => setExpired(false)} />}
    </AuthContext.Provider>
  );
}
