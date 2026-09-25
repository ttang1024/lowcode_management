import { precacheAndRoute } from 'workbox-precaching';

const meta = new URL(location.href);
const isRuntime = meta.searchParams.get('mode') == 'runtime';
const prefix = isRuntime ? '../' : '';
const filter = isRuntime ? (item) => /public\//.test(item.url) : () => true;
const manifest = (self.__WB_MANIFEST || []).filter(filter).map((m) => {
  return {
    ...m,
    url: prefix + m.url,
  };
});

self.addEventListener('install', () => {
  // when a newswis integrated, replace it directly with the new one,after replacing, ensure compatibility with old resource access.
  self.skipWaiting();
});

self.addEventListener('active', (event) => {
  return event.waitUntil(self.clients.claim());
});

// Configure pre-cached resources
precacheAndRoute(manifest);