import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function Logo({ className, variant = 'default' }: LogoProps) {
  // CE Brand Guideline 2022:
  // - DON'T create a logo lockup with text -> use provided logo assets as a single file.
  // - Digital minimum sizes: Logo 80px, Symbol 30px.
  const invertForWhite = variant === 'white' ? 'invert brightness-0' : '';

  return (
    <Link href="/" className={cn('flex items-center', className)} aria-label="Creative Engineering">
      {/* Mobile: symbol only (>= 30px) */}
      <span className="sm:hidden">
        <Image
          src="/brand/ce-symbol.svg"
          alt="Creative Engineering"
          width={120}
          height={64}
          className={cn('h-[30px] w-auto', invertForWhite)}
          priority
        />
      </span>

      {/* Desktop: standard logo as ONE asset (>= 80px) */}
      <span className="hidden sm:block">
        <Image
          src="/brand/ce-logo.svg"
          alt="Creative Engineering"
          width={720}
          height={240}
          className={cn('h-[88px] w-auto md:h-[110px]', invertForWhite)}
          priority
        />
      </span>
    </Link>
  );
}
