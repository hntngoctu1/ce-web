'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
};

interface HeroSlideshowProps {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
}

export function HeroSlideshow({ slides, intervalMs = 6500, className }: HeroSlideshowProps) {
  const safeSlides = useMemo(() => slides.filter((s) => s.title), [slides]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % safeSlides.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, safeSlides.length]);

  const current = safeSlides[index] || safeSlides[0];

  const prev = () => setIndex((i) => (i - 1 + safeSlides.length) % safeSlides.length);
  const next = () => setIndex((i) => (i + 1) % safeSlides.length);

  return (
    <section
      className={cn(
        'relative flex min-h-[600px] items-center overflow-hidden py-24 lg:min-h-[700px]',
        'ce-circle-pattern bg-ce-gradient-light',
        className
      )}
    >
      {/* Background images (crossfade) */}
      {safeSlides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === index ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={i !== index}
        >
          {s.imageUrl && (
            <>
              <Image
                src={s.imageUrl}
                alt=""
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
              {/* Premium light overlay + subtle CE pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60" />
              <div className="ce-hero-pattern absolute inset-0 opacity-15" />
            </>
          )}
        </div>
      ))}

      {/* Content */}
      <div className="ce-container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {current?.subtitle && (
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-ce-primary">
              {current.subtitle}
            </p>
          )}

          <h1 className="mb-6 text-4xl font-heavy leading-tight text-ce-primary-900 md:text-5xl lg:text-6xl">
            {current?.title}
          </h1>

          {current?.description && (
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {current.description}
            </p>
          )}

          {(current?.ctaText || current?.secondaryCtaText) && (
            <div className="flex flex-wrap justify-center gap-4">
              {current?.ctaText && current?.ctaHref && (
                <Button asChild size="xl" variant="ce" className="group">
                  <Link href={current.ctaHref}>
                    {current.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
              {current?.secondaryCtaText && current?.secondaryCtaHref && (
                <Button asChild size="xl" variant="ce-outline" className="bg-transparent">
                  <Link href={current.secondaryCtaHref}>{current.secondaryCtaText}</Link>
                </Button>
              )}
            </div>
          )}

          {/* Controls */}
          {safeSlides.length > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="ghost" size="icon" onClick={prev} aria-label="Previous slide">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {safeSlides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === index
                        ? 'w-8 bg-ce-primary'
                        : 'w-2 bg-ce-primary/30 hover:bg-ce-primary/50'
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={next} aria-label="Next slide">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
