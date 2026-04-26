import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

const URL_LOCALE_RE = new RegExp(`^/(${routing.locales.join('|')})(?:/|$)`);

/**
 * Locale resolution waterfall, ordered by trustworthiness:
 *   1. `requestLocale` injected by next-intl from the URL prefix (best signal).
 *   2. URL pathname parsed from request headers — covers re-entrant calls of
 *      `getRequestConfig` where next-intl does not re-supply `requestLocale`
 *      (observed on Next 16 + Turbopack with next-intl 4.9 when the browser
 *      Accept-Language disagrees with the URL locale).
 *   3. `NEXT_LOCALE` cookie set by the middleware on the previous response.
 *   4. `routing.defaultLocale` as last resort.
 *
 * Steps 2–4 must never override an URL-prefixed locale, otherwise
 * `bridgingchina.net/en-US` silently renders Chinese for a `Accept-Language: zh`
 * browser. Step 2 is what fixes that bug.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const rawRequestLocale = await requestLocale;
  if (rawRequestLocale && hasLocale(routing.locales, rawRequestLocale)) {
    return loadConfig(rawRequestLocale);
  }

  const headerStore = await headers();
  const pathname =
    headerStore.get('x-invoke-path') ??
    headerStore.get('x-pathname') ??
    headerStore.get('next-url') ??
    headerStore.get('x-next-pathname') ??
    headerStore.get('x-matched-path') ??
    '';
  const urlMatch = pathname.match(URL_LOCALE_RE);
  if (urlMatch && hasLocale(routing.locales, urlMatch[1])) {
    return loadConfig(urlMatch[1]);
  }

  const referer = headerStore.get('referer');
  if (referer) {
    try {
      const refererPath = new URL(referer).pathname;
      const refMatch = refererPath.match(URL_LOCALE_RE);
      if (refMatch && hasLocale(routing.locales, refMatch[1])) {
        return loadConfig(refMatch[1]);
      }
    } catch {
      // ignore malformed referer
    }
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLocale && hasLocale(routing.locales, cookieLocale)) {
    return loadConfig(cookieLocale);
  }

  return loadConfig(routing.defaultLocale);
});

async function loadConfig(locale: string) {
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
}
