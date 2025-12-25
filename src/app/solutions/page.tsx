import { SolutionsExplorer } from '@/components/solutions/solutions-explorer';

export default function SolutionsPage() {
  return (
    <div className="bg-gradient-to-b from-ce-primary-900 via-ce-primary-900/90 to-ce-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mb-10 space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Solutions
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Proven processes & kits ready to deploy
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            Explore solution playbooks for dispensing, coating, labeling, and thermal management —
            all with validated steps and resources.
          </p>
        </div>

        <SolutionsExplorer />
      </div>
    </div>
  );
}
