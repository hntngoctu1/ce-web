import { cn } from '@/lib/utils';

type GoogleMapEmbedProps = {
  className?: string;
  /** Use the full Google Maps embed URL (the iframe `src`) */
  src: string;
  title?: string;
};

export function GoogleMapEmbed({ className, src, title = 'Google Map' }: GoogleMapEmbedProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
      <div className="relative aspect-[16/9] w-full">
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
