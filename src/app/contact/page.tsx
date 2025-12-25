import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/sections/hero-section';
import { ContactForm } from '@/components/contact/contact-form';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { GoogleMapEmbed } from '@/components/contact/google-map-embed';

export const metadata: Metadata = {
  title: 'Contact Us - Creative Engineering',
  description:
    'Get in touch with Creative Engineering. Contact our Ho Chi Minh or Hanoi offices for industrial solutions.',
};

const offices = [
  {
    id: 'hcm',
    nameEn: 'Ho Chi Minh Office',
    nameVi: 'Văn phòng Hồ Chí Minh',
    address: '123 Industrial Park, District 7, Ho Chi Minh City, Vietnam',
    phone: '+84 28 1234 5678',
    email: 'hcm@ce.com.vn',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
  },
  {
    id: 'hn',
    nameEn: 'Hanoi Office',
    nameVi: 'Văn phòng Hà Nội',
    address: '456 Tech Park, Cau Giay District, Hanoi, Vietnam',
    phone: '+84 24 1234 5678',
    email: 'hn@ce.com.vn',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
  },
];

export default async function ContactPage() {
  const locale = await getLocale();
  const t = await getTranslations('contact');
  const isVi = locale.toLowerCase().startsWith('vi');

  return (
    <>
      {/* Hero */}
      <HeroSection title={t('title')} subtitle={t('subtitle')} size="small" align="center" />

      {/* Contact Content */}
      <section className="ce-section">
        <div className="ce-container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">{t('sendMessageTitle')}</h2>
              <ContactForm />
            </div>

            {/* Office Info */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">{t('officesTitle')}</h2>
              <div className="space-y-8">
                {offices.map((office) => (
                  <div key={office.id} className="rounded-lg border bg-card p-6">
                    <h3 className="mb-4 text-lg font-bold text-ce-primary">
                      {isVi ? office.nameVi : office.nameEn}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-ce-primary" />
                        <span>{office.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 flex-shrink-0 text-ce-primary" />
                        <a
                          href={`tel:${office.phone.replace(/\s/g, '')}`}
                          className="hover:text-ce-primary"
                        >
                          {office.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 flex-shrink-0 text-ce-primary" />
                        <a href={`mailto:${office.email}`} className="hover:text-ce-primary">
                          {office.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 flex-shrink-0 text-ce-primary" />
                        <span>{office.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="ce-section bg-ce-neutral-20">
        <div className="ce-container">
          <div className="mb-6">
            <div className="ce-kicker">{t('mapKicker')}</div>
            <h2 className="ce-section-title mt-2 text-2xl font-heavy">Creative Engineering</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t('mapHint')}</p>
          </div>

          <GoogleMapEmbed
            title="Creative Engineering - Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.3251772921367!2d106.77460627586937!3d10.862853257591949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752651c987dfdd%3A0x4b9ba1358083a608!2sC%C3%B4ng%20ty%20TNHH%20Creative%20Engineering!5e0!3m2!1sen!2s!4v1766201403943!5m2!1sen!2s"
          />
        </div>
      </section>
    </>
  );
}
