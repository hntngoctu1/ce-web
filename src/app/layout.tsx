import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { BackToTop } from '@/components/ui/back-to-top';
import '@/styles/globals.css';

// Locale is derived from cookie/header (next-intl), so these routes must be dynamic at runtime.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Creative Engineering - Industrial Solutions',
    template: '%s | Creative Engineering',
  },
  description:
    'Creative Engineering delivers innovative industrial solutions since 1999. Your trusted partner for adhesives, tapes, coatings, and specialized equipment.',
  keywords: [
    'industrial solutions',
    'adhesives',
    'tapes',
    'coatings',
    'Henkel',
    'Tesa',
    'Graco',
    'Vietnam',
    'manufacturing',
  ],
  authors: [{ name: 'Creative Engineering' }],
  creator: 'Creative Engineering',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    url: 'https://ce.com.vn',
    siteName: 'Creative Engineering',
    title: 'Creative Engineering - Industrial Solutions',
    description:
      'Creative Engineering delivers innovative industrial solutions since 1999. Your trusted partner for adhesives, tapes, coatings, and specialized equipment.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Creative Engineering',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creative Engineering - Industrial Solutions',
    description: 'Creative Engineering delivers innovative industrial solutions since 1999.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  // Use Montserrat for Vietnamese, Lato for English
  const fontClass = locale === 'vi' ? 'font-montserrat' : 'font-lato';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`min-h-screen bg-background ${fontClass} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              {/* Match header height (h-32 / md:h-36) so content doesn't slide under */}
              <main className="flex-1 pt-32 md:pt-36">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <BackToTop />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
