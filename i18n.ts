import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

const locales = ['vi', 'en', 'zh', 'ko', 'ja'] as const;
const supported = new Set<string>(locales);

export default getRequestConfig(async ({ requestLocale }) => {
  const segmentLocale = await requestLocale;

  // Don't throw notFound for non-locale segments - they might be valid routes
  // Only use segmentLocale if it's actually a valid locale
  const validSegmentLocale =
    segmentLocale && supported.has(segmentLocale) ? segmentLocale : undefined;

  // Otherwise, prefer cookie, then Accept-Language, then default to vi.
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale = validSegmentLocale || cookieStore.get('NEXT_LOCALE')?.value;

  if (locale && !supported.has(locale)) {
    locale = undefined;
  }

  if (!locale) {
    const acceptLanguage = headersList.get('accept-language');
    const header = (acceptLanguage || '').toLowerCase();

    if (header.includes('vi')) locale = 'vi';
    else if (header.includes('zh')) locale = 'zh';
    else if (header.includes('ko')) locale = 'ko';
    else if (header.includes('ja')) locale = 'ja';
    else if (header.includes('en')) locale = 'en';
  }

  locale = locale || 'vi';

  return {
    locale,
    messages: (await import(`./src/i18n/messages/${locale}.json`)).default,
  };
});
