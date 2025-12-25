import { IndustriesExplorer } from '@/components/industries/industries-explorer';

export default function IndustriesPage() {
  return (
    <div className="bg-gradient-to-b from-ce-primary-900 via-ce-primary-900/90 to-ce-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mb-10 space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Industries
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Solutions at work for every industry
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            Explore industry-proven processes, materials, and automation kits designed to reduce
            rework, speed changeovers, and uplift quality.
          </p>
        </div>

        <IndustriesExplorer />
      </div>
    </div>
  );
}
