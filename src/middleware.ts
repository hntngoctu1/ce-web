import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['vi', 'en', 'zh', 'ko', 'ja'] as const;
const defaultLocale = 'vi';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // This codebase does NOT use /[locale]/... route segments.
  // Keep URLs stable (/, /envision, /admin, ...) and drive locale via cookie/header.
  localePrefix: 'never',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next();
  }

  // Apply i18n middleware only
  // Auth protection moved to page/layout level to avoid Edge Runtime + Prisma conflict
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
