import { Url } from 'lowcode-common';
import { AppContextService } from 'lowcode-services';

function getRoute() {
  const parsed = Url.parse(location.href);
  return { ...parsed.params, ...parsed.hashParams };
}

/**
 * Published pages live at `/:app/:page/...`. Links saved before that change
 * still carry a `/public` prefix, so it is dropped here.
 */
function toPageUrl(url: string) {
  return url.replace(/^\/public(?=\/)/, '');
}

/** A site-relative page link, as opposed to an admin route or an external URL. */
function isPageUrl(url: string) {
  return /^\/(?!\/)/.test(url) && !/^\/(admin|design)(\/|$)/.test(url);
}

function autoConvertUrl(url: string) {
  if (!url || !isPageUrl(url)) return url;
  url = toPageUrl(url);
  // In the admin app, page links open the page in the designer instead.
  return AppContextService.isAdmin ? '/design' + url : url;
}

export default {
  getRoute,
  toPageUrl,
  autoConvertUrl,
};
