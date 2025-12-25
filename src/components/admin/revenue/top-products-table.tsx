'use client';

import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';

export function TopProductsTable({
  rows,
  className,
}: {
  rows: { name: string; value: number }[];
  className?: string;
}) {
  const t = useTranslations('admin.revenue.charts');

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 text-sm font-semibold text-foreground">{t('productPerformance')}</div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('product')}</TableHead>
              <TableHead className="text-right">{t('revenue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="max-w-[420px] truncate">{r.name}</TableCell>
                  <TableCell className="text-right font-medium">
                    {Math.round(r.value).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                  {t('noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
