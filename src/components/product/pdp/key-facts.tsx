import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type KeyFactsProps = {
  facts: Array<{
    label: string;
    value: string;
    emphasis?: 'muted' | 'default';
  }>;
  className?: string;
};

export function KeyFacts({ facts, className }: KeyFactsProps) {
  if (!facts.length) return null;

  return (
    <div className={cn('rounded-xl bg-ce-neutral-20 p-4', className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={`${f.label}-${f.value}`} className="flex items-start justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {f.label}
            </div>
            <div
              className={cn(
                'text-sm font-medium text-ce-primary-900',
                f.emphasis === 'muted' && 'text-muted-foreground'
              )}
            >
              <Badge
                variant="outline"
                className="border-black/5 bg-white/70 px-2 py-0.5 text-xs font-medium"
              >
                {f.value}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
