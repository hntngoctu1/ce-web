'use client';

import Link from 'next/link';
import { Facebook, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from './logo';
import { useTranslations } from 'next-intl';

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/creativeengineering', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/company/creative-engineering', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@creativeengineering', label: 'YouTube' },
];

export function Footer() {
  const tf = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const currentYear = new Date().getFullYear();
  const locations = ['Ho Chi Minh', 'Hanoi', 'Malaysia', 'Singapore'];

  const navigation = {
    solutions: [
      { label: tNav('envision'), href: '/envision' },
      { label: tNav('engage'), href: '/engage' },
      { label: tNav('entrench'), href: '/entrench' },
    ],
    resources: [
      { label: tCommon('products'), href: '/menu/product' },
      { label: tCommon('blog'), href: '/blog' },
      { label: tCommon('contact'), href: '/contact' },
    ],
    legal: [
      { label: tf('privacyPolicy'), href: '/privacy' },
      { label: tf('termsOfService'), href: '/terms' },
    ],
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-ce-primary via-ce-primary-700 to-ce-primary-900 text-white">
      {/* Premium brand depth (keeps CE palette, makes purple feel richer) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top wash to blend with page body */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 via-white/0 to-transparent" />
        {/* Subtle CE pattern (very low opacity) */}
        <div className="ce-pattern-bg absolute inset-0 opacity-[0.10]" />
        {/* Soft orbs for modern “luxury” feel */}
        <div className="bg-white/8 absolute -right-44 -top-44 h-[520px] w-[520px] rounded-full blur-[140px]" />
        <div className="bg-ce-primary/16 absolute -bottom-56 -left-56 h-[620px] w-[620px] rounded-full blur-[160px]" />
      </div>

      {/* Main Footer */}
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Logo variant="white" className="h-10 w-auto" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/65">{tf('aboutText')}</p>

            {/* Social Links */}
            <div className="mt-8 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-white/12 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/75 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-white/20 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4">
            <div>
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                Solutions
              </h4>
              <ul className="space-y-3">
                {navigation.solutions.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-white/80 transition-all group-hover:w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                Resources
              </h4>
              <ul className="space-y-3">
                {navigation.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-white/80 transition-all group-hover:w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                Legal
              </h4>
              <ul className="space-y-3">
                {navigation.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-white/80 transition-all group-hover:w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Get in Touch
            </h4>

            <div className="space-y-4">
              <a
                href="mailto:hello@ce.com.vn"
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-ce-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50">Email</div>
                  <div className="text-sm text-white/80 transition-colors group-hover:text-white">
                    hello@ce.com.vn
                  </div>
                </div>
              </a>

              <a
                href="tel:+842812345678"
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-ce-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50">Phone</div>
                  <div className="text-sm text-white/80 transition-colors group-hover:text-white">
                    +84 28 1234 5678
                  </div>
                </div>
              </a>
            </div>

            {/* Office locations */}
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                <MapPin className="h-4 w-4" />
                Locations
              </div>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70 backdrop-blur-sm"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">
              © {currentYear} Creative Engineering. All rights reserved.
            </p>
            <p className="text-xs text-white/40">Crafted with precision • Made in Vietnam</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
