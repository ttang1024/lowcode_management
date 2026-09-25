import config from 'lowcode-configs';

export default function registerPWA(url: string) {
  const sameOrigin = location.href.indexOf(config.APP_BASE_URL) > -1;
  if (!sameOrigin || !('serviceWorker' in navigator)) return;

  // Dev chunks aren't content-hashed (`designers.js`), so a precaching worker
  // would keep serving stale code after every edit. Remove any worker left by
  // an earlier dev session instead of registering one.
  if (process.env.NODE_ENV === 'development') {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((r) => r.unregister()))
      .catch(() => undefined);
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(url).then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
