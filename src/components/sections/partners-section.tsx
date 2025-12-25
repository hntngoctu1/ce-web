import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getPartnerLogo, PLACEHOLDERS } from '@/lib/placeholders';

interface Partner {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface PartnersSectionProps {
  partners: Partner[];
  title?: string;
  subtitle?: string;
  className?: string;
}

// Fallback mock partners if database is unavailable
const mockPartners: Partner[] = [
  { id: 'henkel', name: 'Henkel', logoUrl: null },
  { id: 'tesa', name: 'tesa', logoUrl: null },
  { id: 'graco', name: 'Graco', logoUrl: null },

  // Additional partners available in /public/partners (user-downloaded)
  { id: 'avery-dennison', name: 'Avery Dennison', logoUrl: null },
  { id: 'crc', name: 'CRC', logoUrl: null },
  { id: 'dow', name: 'Dow', logoUrl: null },
  { id: 'hermes', name: 'Hermes', logoUrl: null },
  { id: 'huntsman', name: 'Huntsman', logoUrl: null },
  { id: 'lanotec', name: 'Lanotec', logoUrl: null },
  { id: 'mark-andy', name: 'Mark Andy', logoUrl: null },
  { id: 'mirka', name: 'Mirka', logoUrl: null },
  { id: 'nukote-industrial', name: 'Nukote Industrial', logoUrl: null },
  { id: 'pillarhouse', name: 'Pillarhouse', logoUrl: null },
  { id: 'saiyakaya', name: 'Saiyakaya', logoUrl: null },
  { id: 'saki', name: 'SAKI', logoUrl: null },
  { id: 'stoner', name: 'Stoner', logoUrl: null },
  { id: 'techcon', name: 'Techcon', logoUrl: null },
  { id: 'valco-melton', name: 'Valco Melton', logoUrl: null },
];

export function PartnersSection({
  partners,
  title = 'Our Partners',
  subtitle = 'Working with global industry leaders',
  className,
}: PartnersSectionProps) {
  // Merge DB partners with known local partners so the grid looks rich even if DB is minimal.
  const displayPartners = (() => {
    const byId = new Map<string, Partner>();
    for (const p of partners) byId.set((p.id || p.name).toLowerCase(), p);
    for (const p of mockPartners) {
      const key = (p.id || p.name).toLowerCase();
      if (!byId.has(key)) byId.set(key, p);
    }
    return Array.from(byId.values());
  })();

  const resolveLogoSrc = (p: Partner): string | null => {
    // Prefer local assets from /public/partners. This avoids broken DB links after file cleanup.
    const local = getPartnerLogo(p.id || p.name);
    if (local) return local;

    // Only use DB/external logos if they are NOT under /partners (we deleted legacy partner SVGs).
    if (p.logoUrl && !p.logoUrl.startsWith('/partners/')) return p.logoUrl;

    return null;
  };

  const displayPartnersWithLogo = displayPartners
    .map((p) => ({ partner: p, src: resolveLogoSrc(p) }))
    .filter((x) => Boolean(x.src));

  return (
    <section className={cn('ce-section bg-ce-neutral-20', className)}>
      <div className="ce-container">
        <div className="mb-12 text-center">
          <h2 className="ce-heading mb-4 text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
          {displayPartnersWithLogo.map(({ partner, src }) => (
            <div
              key={partner.id}
              className={cn(
                'group flex items-center justify-center rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm',
                'h-20 transition-all duration-300 hover:-translate-y-0.5 hover:border-ce-primary/40 hover:bg-white hover:shadow-md md:h-24'
              )}
            >
              <Image
                // Prefer consistent local assets by partner id/name (lets you drop files into /public/partners without DB updates)
                src={src as string}
                alt={partner.name}
                width={160}
                height={80}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
