import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  overlay?: boolean;
  align?: 'left' | 'center';
  size?: 'default' | 'large' | 'small';
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage,
  overlay = true,
  align = 'left',
  size = 'default',
  className,
}: HeroSectionProps) {
  const heights = {
    small: 'min-h-[300px] py-16',
    default: 'min-h-[500px] py-20',
    large: 'min-h-[600px] lg:min-h-[700px] py-24',
  };

  return (
    <section
      className={cn(
        'relative flex items-center overflow-hidden',
        heights[size],
        !backgroundImage && 'ce-circle-pattern bg-ce-gradient-light',
        className
      )}
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {overlay && (
            <>
              {/* CE guideline: avoid heavy dark tint; use light premium overlay + subtle CE pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60" />
              <div className="ce-hero-pattern absolute inset-0 opacity-15" />
            </>
          )}
        </>
      )}

      {/* Content */}
      <div className="ce-container relative z-10">
        <div
          className={cn(
            'max-w-3xl',
            align === 'center' && 'mx-auto text-center',
            align === 'left' && 'text-left'
          )}
        >
          {subtitle && (
            <p
              className={cn(
                'mb-4 animate-fade-up text-sm font-medium uppercase tracking-[0.2em]',
                backgroundImage ? 'text-ce-primary' : 'text-ce-primary'
              )}
            >
              {subtitle}
            </p>
          )}

          <h1
            className={cn(
              'animation-delay-200 mb-6 animate-fade-up font-heavy leading-tight',
              backgroundImage ? 'text-ce-primary-900' : 'text-ce-primary-900',
              size === 'large' && 'text-4xl md:text-5xl lg:text-6xl',
              size === 'default' && 'text-3xl md:text-4xl lg:text-5xl',
              size === 'small' && 'text-2xl md:text-3xl lg:text-4xl'
            )}
          >
            {title}
          </h1>

          {description && (
            <p
              className={cn(
                'animation-delay-400 mb-8 animate-fade-up text-lg leading-relaxed',
                backgroundImage ? 'text-muted-foreground' : 'text-muted-foreground'
              )}
            >
              {description}
            </p>
          )}

          {(ctaText || secondaryCtaText) && (
            <div
              className={cn(
                'animation-delay-600 flex animate-fade-up flex-wrap gap-4',
                align === 'center' && 'justify-center'
              )}
            >
              {ctaText && ctaHref && (
                <Button asChild size="xl" variant="ce" className={cn('group')}>
                  <Link href={ctaHref}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}

              {secondaryCtaText && secondaryCtaHref && (
                <Button asChild size="xl" variant="ce-outline" className={cn('bg-transparent')}>
                  <Link href={secondaryCtaHref}>{secondaryCtaText}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      {!backgroundImage && (
        <>
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-ce-primary/5" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-ce-primary/5" />
        </>
      )}
    </section>
  );
}
