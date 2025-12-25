import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Planning - Admin',
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export default async function AdminPlanningPage() {
  // Minimal Phase 5 (no extra DB yet): store targets in Setting as JSON under key revenuePlan.targets
  const setting = await prisma.setting.findUnique({ where: { key: 'revenuePlan.targets' } });
  const targets: Record<string, number> = setting ? JSON.parse(setting.value) : {};

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const target = Number(targets[ym] || 0);

  const { _sum } = await prisma.payment.aggregate({
    where: { paymentDate: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    _sum: { amount: true },
  });
  const actual = Number(_sum.amount || 0);
  const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heavy text-foreground">Planning</h1>
        <p className="text-muted-foreground">Targets and forecast (lightweight v1, ERP-ready).</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This month target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="text-2xl font-bold">{formatPrice(target || 0, 'VND', 'vi-VN')}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Actual</div>
                <div className="text-2xl font-bold">{formatPrice(actual, 'VND', 'vi-VN')}</div>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-ce-neutral-20">
              <div className="h-full bg-ce-primary" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-sm text-muted-foreground">{pct.toFixed(1)}% complete</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Forecast (simple)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Next step: compute forecast from last 3–6 months average and compare vs target. This can
            be added without changing orders/payments.
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manage targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            Targets are currently stored in{' '}
            <code className="rounded bg-ce-neutral-20 px-1.5 py-0.5">
              Setting.key = revenuePlan.targets
            </code>{' '}
            as JSON.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/settings">Open Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
