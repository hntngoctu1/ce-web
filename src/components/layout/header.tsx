'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, Search, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';
import { CartSheet } from '@/components/cart/cart-sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type LinkItem = { label: string; href: string; desc?: string };
type MenuGroup = { title: string; items: LinkItem[] };

type DesktopMenuKey = 'about' | 'solutions' | 'products' | null;

export function Header() {
  const locale = useLocale();
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Prostech-like IA: About + Solutions + Products + News + Contact
  const aboutItems: LinkItem[] = useMemo(
    () => [
      { label: 'ENVISION', href: '/envision', desc: t('aboutItems.envisionDesc') },
      { label: 'ENGAGE', href: '/engage', desc: t('aboutItems.engageDesc') },
      { label: 'ENTRENCH', href: '/entrench', desc: t('aboutItems.entrenchDesc') },
    ],
    [t]
  );

  const solutionGroups: MenuGroup[] = useMemo(
    () => [
      {
        title: t('solutions.industrialTitle'),
        items: [
          {
            label: t('solutions.industriesLabel'),
            href: '/menu/industrial',
            desc: t('solutions.industriesDesc'),
          },
          {
            label: t('solutions.caseStudiesLabel'),
            href: '/blog?category=case-studies',
            desc: t('solutions.caseStudiesDesc'),
          },
        ],
      },
      {
        title: t('solutions.servicesTitle'),
        items: [
          {
            label: t('solutions.mixDispensingLabel'),
            href: '/envision#services',
            desc: t('solutions.mixDispensingDesc'),
          },
          {
            label: t('solutions.convertingLabel'),
            href: '/envision#services',
            desc: t('solutions.convertingDesc'),
          },
          {
            label: t('solutions.labelingLabel'),
            href: '/envision#services',
            desc: t('solutions.labelingDesc'),
          },
          {
            label: t('solutions.laserLabel'),
            href: '/envision#services',
            desc: t('solutions.laserDesc'),
          },
        ],
      },
    ],
    [t]
  );

  const productGroups: LinkItem[] = useMemo(
    () => [
      { label: t('products.groups.industrialTapes'), href: '/menu/product?group=industrial-tapes' },
      { label: t('products.groups.siliconeRubber'), href: '/menu/product?group=silicone-rubber' },
      { label: t('products.groups.lubricants'), href: '/menu/product?group=lubricants' },
      {
        label: t('products.groups.metalworkingCoatings'),
        href: '/menu/product?group=metalworking-coatings',
      },
      {
        label: t('products.groups.electronicCoatings'),
        href: '/menu/product?group=electronic-coatings',
      },
      { label: t('products.groups.abrasives'), href: '/menu/product?group=sandpaper-abrasives' },
      { label: t('products.groups.nukote'), href: '/menu/product?group=nukote-coatings' },
      {
        label: t('products.groups.industrialAdhesives'),
        href: '/menu/product?group=industrial-adhesives',
      },
      { label: t('products.groups.welding'), href: '/menu/product?group=welding-equipment' },
      { label: t('products.groups.printers'), href: '/menu/product?group=printers' },
      { label: t('products.groups.automaticDosing'), href: '/menu/product?group=automatic-dosing' },
      {
        label: t('products.groups.fluidTransmission'),
        href: '/menu/product?group=fluid-transmission',
      },
      { label: t('products.groups.heatConducting'), href: '/menu/product?group=heat-conducting' },
    ],
    [t]
  );

  const topLinks: LinkItem[] = useMemo(
    () => [
      { label: t('triggers.news'), href: '/blog' },
      { label: t('triggers.contact'), href: '/contact' },
    ],
    [t]
  );

  // Simple hover state for desktop menus - no complex timers, just CSS + minimal state
  const [openMenu, setOpenMenu] = useState<DesktopMenuKey>(null);

  const handleMenuEnter = useCallback((key: DesktopMenuKey) => {
    setOpenMenu(key);
  }, []);

  const handleMenuLeave = useCallback(() => {
    setOpenMenu(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Reusable dropdown item style
  const dropdownItemClass = cn(
    'block rounded-md px-4 py-3 text-base transition-all duration-150',
    'hover:bg-ce-neutral-20 hover:text-ce-primary hover:translate-x-1',
    'focus:bg-ce-neutral-20 focus:text-ce-primary'
  );

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="ce-container">
        <nav className="flex h-32 items-center justify-between md:h-36">
          {/* Logo */}
          <Logo variant={isScrolled ? 'default' : 'default'} />

          {/* Desktop Navigation - CSS-based hover dropdowns (no portal) */}
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {/* About */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('about')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className={cn(
                  'flex h-12 items-center gap-1 rounded-md px-4 text-base font-medium transition-colors',
                  'hover:bg-accent hover:text-ce-primary',
                  openMenu === 'about' && 'bg-accent text-ce-primary'
                )}
              >
                {t('triggers.about')}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openMenu === 'about' && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Panel - inline, not portaled */}
              <div
                className={cn(
                  'absolute left-1/2 top-full z-50 w-96 -translate-x-1/2 pt-2',
                  'transition-all duration-200 ease-out',
                  openMenu === 'about'
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0'
                )}
              >
                <div className="rounded-xl border bg-white p-2 shadow-lg">
                  {aboutItems.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cn(
                        dropdownItemClass,
                        'flex flex-col gap-1',
                        isActive(it.href) && 'bg-ce-neutral-20 text-ce-primary'
                      )}
                      onClick={handleMenuLeave}
                    >
                      <span className="font-semibold">{it.label}</span>
                      {it.desc && <span className="text-sm text-muted-foreground">{it.desc}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('solutions')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className={cn(
                  'flex h-12 items-center gap-1 rounded-md px-4 text-base font-medium transition-colors',
                  'hover:bg-accent hover:text-ce-primary',
                  openMenu === 'solutions' && 'bg-accent text-ce-primary'
                )}
              >
                {t('triggers.solutions')}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openMenu === 'solutions' && 'rotate-180'
                  )}
                />
              </button>

              <div
                className={cn(
                  'absolute left-1/2 top-full z-50 w-96 -translate-x-1/2 pt-2',
                  'transition-all duration-200 ease-out',
                  openMenu === 'solutions'
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0'
                )}
              >
                <div className="rounded-xl border bg-white p-2 shadow-lg">
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {solutionGroups[0]?.title}
                  </div>
                  {solutionGroups[0]?.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cn(
                        dropdownItemClass,
                        'flex flex-col gap-1',
                        isActive(it.href) && 'bg-ce-neutral-20 text-ce-primary'
                      )}
                      onClick={handleMenuLeave}
                    >
                      <span className="font-medium">{it.label}</span>
                      {it.desc && <span className="text-sm text-muted-foreground">{it.desc}</span>}
                    </Link>
                  ))}
                  <div className="my-2 border-t" />
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {solutionGroups[1]?.title}
                  </div>
                  {solutionGroups[1]?.items.map((it) => (
                    <Link
                      key={it.label}
                      href={it.href}
                      className={cn(
                        dropdownItemClass,
                        'flex flex-col gap-1',
                        isActive(it.href) && 'bg-ce-neutral-20 text-ce-primary'
                      )}
                      onClick={handleMenuLeave}
                    >
                      <span className="font-medium">{it.label}</span>
                      {it.desc && <span className="text-sm text-muted-foreground">{it.desc}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('products')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className={cn(
                  'flex h-12 items-center gap-1 rounded-md px-4 text-base font-medium transition-colors',
                  'hover:bg-accent hover:text-ce-primary',
                  openMenu === 'products' && 'bg-accent text-ce-primary'
                )}
              >
                {t('triggers.products')}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openMenu === 'products' && 'rotate-180'
                  )}
                />
              </button>

              <div
                className={cn(
                  'absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-2',
                  'transition-all duration-200 ease-out',
                  openMenu === 'products'
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0'
                )}
              >
                <div className="rounded-xl border bg-white p-2 shadow-lg">
                  <Link
                    href="/menu/product"
                    className={cn(dropdownItemClass, 'font-semibold text-ce-primary')}
                    onClick={handleMenuLeave}
                  >
                    {t('products.viewAll')}
                  </Link>
                  <div className="my-2 border-t" />
                  <div className="max-h-[50vh] overflow-y-auto">
                    {productGroups.map((it) => (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={cn(
                          dropdownItemClass,
                          isActive(it.href) && 'bg-ce-neutral-20 text-ce-primary'
                        )}
                        onClick={handleMenuLeave}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* News & Contact (simple links) */}
            {topLinks.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex h-12 items-center rounded-md px-4 text-base font-medium transition-colors',
                  'hover:bg-accent hover:text-ce-primary',
                  isActive(it.href) && 'text-ce-primary'
                )}
              >
                {it.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <CartSheet />
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              asChild
              aria-label="Search products"
              title="Search products"
            >
              <Link href="/menu/product">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      {t('account.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  {(session.user.role === 'ADMIN' || session.user.role === 'EDITOR') && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        {t('account.adminPanel')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {tCommon('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ce" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">{tCommon('login')}</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetTitle className="sr-only">{t('mobile.navigationMenu')}</SheetTitle>
                <nav className="mt-8 flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('triggers.about')}
                    </div>
                    {aboutItems.map((it) => (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block rounded-md px-3 py-2 text-sm transition-colors',
                          isActive(it.href) ? 'bg-accent text-ce-primary' : 'hover:bg-accent'
                        )}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('triggers.solutions')}
                    </div>
                    <Link
                      href="/menu/industrial"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors',
                        isActive('/menu/industrial')
                          ? 'bg-accent text-ce-primary'
                          : 'hover:bg-accent'
                      )}
                    >
                      {t('solutions.industriesLabel')}
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('triggers.products')}
                    </div>
                    <Link
                      href="/menu/product"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors',
                        isActive('/menu/product') ? 'bg-accent text-ce-primary' : 'hover:bg-accent'
                      )}
                    >
                      {t('mobile.productCatalog')}
                    </Link>
                  </div>

                  {topLinks.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isActive(it.href)
                          ? 'text-ce-primary'
                          : 'text-foreground hover:text-ce-primary'
                      )}
                    >
                      {it.label}
                    </Link>
                  ))}

                  {!session?.user && (
                    <div className="mt-4 border-t pt-4">
                      <Button variant="ce" className="w-full" asChild>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          {tCommon('login')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
