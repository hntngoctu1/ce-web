import { notFound } from 'next/navigation';
import Link from 'next/link';
import { solutions } from '@/data/solutions';

type Props = { params: { slug: string } };

export default function SolutionDetailPage({ params }: Props) {
  const solution = solutions.find((s) => s.slug === params.slug);
  if (!solution) return notFound();

  return (
    <div className="bg-ce-primary-900 text-white">
      <div
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(103,110,159,0.55), rgba(67,74,107,0.85)), url(${solution.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-ce-primary-900/20 via-ce-primary-900/70 to-ce-primary-900" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 lg:py-20">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Solutions
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{solution.name}</h1>
          <p className="max-w-3xl text-base text-white/75">{solution.summary}</p>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70"
              >
                {t}
              </span>
            ))}
          </div>
          {solution.stats && (
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              {solution.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className="text-2xl font-semibold text-white">{s.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ce-primary hover:bg-white/90"
            >
              Talk to a specialist
            </Link>
            <Link
              href="/menu/product"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              View related products
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:py-18 mx-auto max-w-6xl space-y-12 px-6 py-14">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Key outcomes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {solution.keyOutcomes.map((o) => (
              <div
                key={o}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80"
              >
                {o}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">How we do it</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {solution.steps.map((s, idx) => (
              <div
                key={s}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                  {idx + 1}
                </div>
                <div className="pt-1.5">{s}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Products & kits</h2>
            <Link
              href="/menu/product"
              className="text-sm font-semibold text-white hover:text-white/80"
            >
              Browse all →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {solution.products.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
              >
                <span>{p.title}</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Resources</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {solution.resources.map((r) => (
              <Link
                key={r.title}
                href={r.href}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                    {r.type}
                  </span>
                  <span>{r.title}</span>
                </div>
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Need guidance?
              </div>
              <div className="text-xl font-bold">Request a walkthrough for {solution.name}</div>
              <div className="text-sm text-white/70">
                Share your application — we’ll propose validated steps and starter BOM.
              </div>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ce-primary hover:bg-white/90"
            >
              Talk to us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
