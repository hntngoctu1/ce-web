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
      {/* Always show full logo, responsive sizing */}
      <Image
        src="/brand/ce-logo.svg"
        alt="Creative Engineering"
        width={720}
        height={240}
        className={cn('h-[60px] w-auto sm:h-[80px] md:h-[100px]', invertForWhite)}
        priority
      />
    </Link>
  );
}
