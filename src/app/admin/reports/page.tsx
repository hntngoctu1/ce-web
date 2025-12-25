import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Reports - Admin',
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach((x) => urlParams.append(k, x));
    else urlParams.set(k, v);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heavy text-foreground">Reports</h1>
        <p className="text-muted-foreground">Export-ready reports for management and accounting.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Payments ledger export (date range supported).
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/api/admin/reports/revenue.csv?${urlParams.toString()}`}>
                  Export CSV
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/revenue">Open dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Debt report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Outstanding receivables export (CSV).</p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/api/admin/reports/debt.csv?${urlParams.toString()}`}>Export CSV</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/receivables">Open receivables</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Next steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Excel/PDF export and preview tables can be added next (Phase 4 enhancements), without
          changing the data model.
        </CardContent>
      </Card>
    </div>
  );
}
