import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  const supported = new Set(['vi', 'en', 'zh', 'ko', 'ja']);

  // Try to get locale from cookie first, then header, then default to 'vi'
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale = cookieStore.get('NEXT_LOCALE')?.value;

  if (locale && !supported.has(locale)) {
    locale = undefined;
  }

  if (!locale) {
    const acceptLanguage = headersList.get('accept-language');
    const header = (acceptLanguage || '').toLowerCase();

    // Prefer explicit matches in supported locales (rough but reliable).
    if (header.includes('vi')) locale = 'vi';
    else if (header.includes('zh')) locale = 'zh';
    else if (header.includes('ko')) locale = 'ko';
    else if (header.includes('ja')) locale = 'ja';
    else if (header.includes('en')) locale = 'en';
  }

  locale = locale || 'vi';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
