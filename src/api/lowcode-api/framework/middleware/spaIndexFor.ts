/**
 * The HTML entry that serves a client-side route: the admin app owns `/`,
 * `/admin` and `/design`; every other path is a published page
 * (`/:app/:page/...`) served by the public runtime. Static files and API
 * routes are matched before this fallback runs.
 */
export default function spaIndexFor(path: string) {
  return /^\/($|admin(\/|$)|design(\/|$))/.test(path) ? '/index.html' : '/public/index.html';
}
