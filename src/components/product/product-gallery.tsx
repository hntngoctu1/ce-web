'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type GalleryImage = { url: string; alt?: string | null };

type ProductGalleryProps = {
  images: GalleryImage[];
  fallbackImage: string;
  alt: string;
  videoUrl?: string | null;
  className?: string;
};

export function ProductGallery({
  images,
  fallbackImage,
  alt,
  videoUrl,
  className,
}: ProductGalleryProps) {
  const t = useTranslations('productDetail');
  const normalized = useMemo(() => {
    const list = (images || []).filter((i) => Boolean(i?.url));
    return list.length ? list : [{ url: fallbackImage, alt }];
  }, [alt, fallbackImage, images]);

  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const current = normalized[Math.min(active, normalized.length - 1)];
  const currentIsSvg =
    typeof current?.url === 'string' && current.url.toLowerCase().endsWith('.svg');
  const hasMultipleImages = normalized.length > 1;

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % normalized.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + normalized.length) % normalized.length);
    setIsZoomed(false);
  };

  const goToNext = () => setActive((prev) => (prev + 1) % normalized.length);
  const goToPrev = () => setActive((prev) => (prev - 1 + normalized.length) % normalized.length);

  return (
    <>
      <div className={cn('space-y-3', className)}>
        {/* Main Image */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className="group relative aspect-[4/3] cursor-zoom-in bg-gradient-to-br from-slate-50 to-white"
            onClick={() => openLightbox(active)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openLightbox(active);
            }}
          >
            <Image
              src={current.url}
              alt={current.alt || alt}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02] sm:p-6"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
              unoptimized={currentIsSvg}
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                <ZoomIn className="h-4 w-4" />
                <span>{t('viewLarger')}</span>
              </div>
            </div>

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {active + 1} / {normalized.length}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {(hasMultipleImages || videoUrl) && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {videoUrl && (
              <button
                type="button"
                className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-ce-primary/50 bg-ce-primary/5 transition-all hover:border-ce-primary hover:bg-ce-primary/10 sm:h-16 sm:w-16"
                aria-label="Play video"
              >
                <div className="flex h-full items-center justify-center">
                  <Play className="h-5 w-5 text-ce-primary" />
                </div>
              </button>
            )}
            {normalized.map((img, idx) => {
              const isSvg = typeof img?.url === 'string' && img.url.toLowerCase().endsWith('.svg');
              return (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={cn(
                    'group/thumb relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all sm:h-16 sm:w-16',
                    idx === active
                      ? 'border-ce-primary shadow-md ring-2 ring-ce-primary/20'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-sm'
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || alt}
                    fill
                    className="object-contain p-1 transition-transform group-hover/thumb:scale-105"
                    sizes="64px"
                    unoptimized={isSvg}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => {
            setLightboxOpen(false);
            setIsZoomed(false);
          }}
        >
          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
              setIsZoomed(false);
            }}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {normalized.length}
          </div>

          {/* Nav */}
          {normalized.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className={cn(
              'relative h-[80vh] w-[90vw] max-w-5xl transition-transform duration-300',
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsZoomed(!isZoomed);
              if (e.key === 'Escape') {
                setLightboxOpen(false);
                setIsZoomed(false);
              }
              if (e.key === 'ArrowRight') nextImage();
              if (e.key === 'ArrowLeft') prevImage();
            }}
          >
            <Image
              src={normalized[lightboxIndex].url}
              alt={normalized[lightboxIndex].alt || alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
              unoptimized={
                typeof normalized?.[lightboxIndex]?.url === 'string' &&
                normalized[lightboxIndex].url.toLowerCase().endsWith('.svg')
              }
            />
          </div>

          {/* Bottom Thumbnails */}
          {normalized.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-xl bg-white/10 p-2 backdrop-blur-sm">
              {normalized.slice(0, 8).map((img, idx) => (
                <button
                  key={`lb-thumb-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={cn(
                    'relative h-12 w-12 overflow-hidden rounded-lg border-2 transition-all',
                    idx === lightboxIndex
                      ? 'scale-110 border-white shadow-lg'
                      : 'border-white/30 hover:border-white/60'
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || alt}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
