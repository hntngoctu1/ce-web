import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DocumentsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

async function getDocuments(params: { q?: string; type?: string; status?: string; page?: string }) {
  const page = parseInt(params.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {};

  if (params.q) {
    where.code = { contains: params.q, mode: 'insensitive' };
  }

  if (params.type) {
    where.type = params.type;
  }

  if (params.status) {
    where.status = params.status;
  }

  // Count documents by status using simple count queries (avoids groupBy issues)
  const [documents, total, draftCount, postedCount, voidCount] = await Promise.all([
    prisma.stockDocument.findMany({
      where,
      include: {
        warehouse: { select: { code: true } },
        _count: { select: { lines: true, movements: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.stockDocument.count({ where }),
    prisma.stockDocument.count({ where: { status: 'DRAFT' } }),
    prisma.stockDocument.count({ where: { status: 'POSTED' } }),
    prisma.stockDocument.count({ where: { status: 'VOID' } }),
  ]);

  const statusCounts = {
    DRAFT: draftCount,
    POSTED: postedCount,
    VOID: voidCount,
  };

  return {
    documents,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
    statusCounts,
  };
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.warehouse.documentsPage');
  const { documents, total, totalPages, currentPage, statusCounts } = await getDocuments(params);

  const typeOptions = [
    { value: '', label: t('allTypes') },
    { value: 'GRN', label: t('goodsReceipt') },
    { value: 'ISSUE', label: t('issue') },
    { value: 'ADJUSTMENT', label: t('adjustment') },
    { value: 'TRANSFER', label: t('transfer') },
    { value: 'RESERVE', label: t('reserve') },
    { value: 'DEDUCT', label: t('deduct') },
    { value: 'RELEASE', label: t('release') },
    { value: 'RESTOCK', label: t('restock') },
  ];

  const statusOptions = [
    { value: '', label: t('allStatus') },
    { value: 'DRAFT', label: t('draft') },
    { value: 'POSTED', label: t('posted') },
    { value: 'VOID', label: t('voided') },
  ];

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    DRAFT: { label: t('draft'), color: 'bg-slate-100 text-slate-700', icon: Clock },
    POSTED: { label: t('posted'), color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    VOID: { label: t('voided'), color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const typeConfig: Record<string, { label: string; color: string }> = {
    GRN: { label: 'GRN', color: 'bg-emerald-100 text-emerald-800' },
    ISSUE: { label: 'Issue', color: 'bg-blue-100 text-blue-800' },
    ADJUSTMENT: { label: 'Adjust', color: 'bg-amber-100 text-amber-800' },
    TRANSFER: { label: 'Transfer', color: 'bg-purple-100 text-purple-800' },
    RESERVE: { label: 'Reserve', color: 'bg-cyan-100 text-cyan-800' },
    RELEASE: { label: 'Release', color: 'bg-gray-100 text-gray-800' },
    DEDUCT: { label: 'Deduct', color: 'bg-rose-100 text-rose-800' },
    RESTOCK: { label: 'Restock', color: 'bg-teal-100 text-teal-800' },
  };

  const buildQuery = (nextPage: number) => {
    const qs = new URLSearchParams();
    qs.set('page', String(nextPage));
    if (params.q) qs.set('q', params.q);
    if (params.type) qs.set('type', params.type);
    if (params.status) qs.set('status', params.status);
    return qs.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/admin/warehouse/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('newDocument')}
          </Link>
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className={params.status === 'DRAFT' ? 'ring-2 ring-ce-primary' : ''}>
          <CardContent className="flex items-center gap-4 py-4">
            <Clock className="h-8 w-8 text-slate-500" />
            <div>
              <div className="text-2xl font-bold">{statusCounts.DRAFT}</div>
              <div className="text-sm text-muted-foreground">{t('drafts')}</div>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link href="?status=DRAFT">{t('filter')}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className={params.status === 'POSTED' ? 'ring-2 ring-ce-primary' : ''}>
          <CardContent className="flex items-center gap-4 py-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <div className="text-2xl font-bold">{statusCounts.POSTED}</div>
              <div className="text-sm text-muted-foreground">{t('posted')}</div>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link href="?status=POSTED">{t('filter')}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className={params.status === 'VOID' ? 'ring-2 ring-ce-primary' : ''}>
          <CardContent className="flex items-center gap-4 py-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{statusCounts.VOID}</div>
              <div className="text-sm text-muted-foreground">{t('voided')}</div>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link href="?status=VOID">{t('filter')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder={t('searchPlaceholder')}
                defaultValue={params.q}
                className="pl-10"
              />
            </div>
            <select
              name="type"
              defaultValue={params.type || ''}
              className="h-10 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={params.status || ''}
              className="h-10 min-w-[120px] rounded-md border border-input bg-background px-3 text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button type="submit">{t('filter')}</Button>
            <Button type="button" variant="ghost" asChild>
              <Link href="/admin/warehouse/documents">{t('reset')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('documentsCount')} ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-3 font-medium">{t('code')}</th>
                  <th className="px-3 py-3 font-medium">{t('type')}</th>
                  <th className="px-3 py-3 font-medium">{t('status')}</th>
                  <th className="px-3 py-3 font-medium">{t('warehouse')}</th>
                  <th className="px-3 py-3 text-right font-medium">{t('lines')}</th>
                  <th className="px-3 py-3 text-right font-medium">{t('movements')}</th>
                  <th className="px-3 py-3 font-medium">{t('created')}</th>
                  <th className="px-3 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const status = statusConfig[doc.status] || statusConfig.DRAFT;
                  const type = typeConfig[doc.type] || { label: doc.type, color: 'bg-slate-100' };

                  return (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono font-medium">{doc.code}</td>
                      <td className="px-3 py-3">
                        <Badge className={type.color}>{type.label}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={status.color}>
                          <status.icon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{doc.warehouse?.code || '-'}</Badge>
                      </td>
                      <td className="px-3 py-3 text-right">{doc._count.lines}</td>
                      <td className="px-3 py-3 text-right">{doc._count.movements}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/warehouse/documents/${doc.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            {t('view')}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {params.q || params.type || params.status
                          ? t('noDocsFilter')
                          : t('noDocsYet')}
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        {(params.q || params.type || params.status) && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/warehouse/documents">{t('clearFilters')}</Link>
                          </Button>
                        )}
                        <Button size="sm" asChild>
                          <Link href="/admin/warehouse/documents/new">{t('createDocument')}</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {t('showing', {
                  from: (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  to: Math.min(currentPage * ITEMS_PER_PAGE, total),
                  total,
                })}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`?${buildQuery(currentPage - 1)}`}>{t('previous')}</Link>
                  </Button>
                )}
                {currentPage < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`?${buildQuery(currentPage + 1)}`}>{t('next')}</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
