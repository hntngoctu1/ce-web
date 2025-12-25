import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { HeroSection } from '@/components/sections/hero-section';

export const metadata: Metadata = {
  title: 'Checkout - Creative Engineering',
};

export default async function CheckoutPage() {
  const locale = await getLocale();
  const t = await getTranslations('checkout');
  const session = await auth();

  let user = null;
  if (session?.user) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { customerProfile: true, addresses: true },
    });
  }

  return (
    <>
      <HeroSection title={t('title')} size="small" align="center" />
      <section className="ce-section">
        <div className="ce-container">
          <CheckoutForm locale={locale} user={user} />
        </div>
      </section>
    </>
  );
}
