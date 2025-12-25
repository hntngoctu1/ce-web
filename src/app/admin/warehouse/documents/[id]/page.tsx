import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileText,
  Package,
  Clock,
  User,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { VoidDocumentButton } from '@/components/warehouse/void-document-button';
import { PostDocumentButton } from '@/components/warehouse/post-document-button';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getDocument(id: string) {
  const doc = await prisma.stockDocument.findUnique({
    where: { id },
    include: {
      warehouse: { select: { code: true, name: true } },
      targetWarehouse: { select: { code: true, name: true } },
      lines: {
        include: {
          product: { select: { nameEn: true, sku: true } },
        },
        orderBy: { id: 'asc' },
      },
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!doc) return null;

  // Get audit logs for this document
  const auditLogs = await prisma.inventoryAuditLog.findMany({
    where: {
      entityType: 'StockDocument',
      entityId: id,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return { doc, auditLogs };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  POSTED: { label: 'Posted', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  VOID: { label: 'Void', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  GRN: { label: 'Goods Receipt', color: 'bg-emerald-100 text-emerald-800' },
  ISSUE: { label: 'Issue', color: 'bg-blue-100 text-blue-800' },
  ADJUSTMENT: { label: 'Adjustment', color: 'bg-amber-100 text-amber-800' },
  TRANSFER: { label: 'Transfer', color: 'bg-purple-100 text-purple-800' },
  RESERVE: { label: 'Reserve', color: 'bg-cyan-100 text-cyan-800' },
  RELEASE: { label: 'Release', color: 'bg-gray-100 text-gray-800' },
  DEDUCT: { label: 'Deduct', color: 'bg-rose-100 text-rose-800' },
  RESTOCK: { label: 'Restock', color: 'bg-teal-100 text-teal-800' },
};

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  const data = await getDocument(id);

  if (!data) {
    notFound();
  }

  const { doc, auditLogs } = data;
  const status = statusConfig[doc.status] || statusConfig.DRAFT;
  const type = typeConfig[doc.type] || { label: doc.type, color: 'bg-slate-100 text-slate-800' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/warehouse/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{doc.code}</h1>
              <Badge className={status.color}>
                <status.icon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
              <Badge className={type.color}>{type.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Created {formatDate(doc.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {doc.status === 'DRAFT' && (
            <PostDocumentButton documentId={doc.id} documentCode={doc.code} />
          )}
          {doc.status === 'POSTED' && (
            <VoidDocumentButton documentId={doc.id} documentCode={doc.code} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Type</dt>
                  <dd className="font-medium">{type.label}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="font-medium">{status.label}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Warehouse</dt>
                  <dd className="font-medium">
                    {doc.warehouse?.code} - {doc.warehouse?.name}
                  </dd>
                </div>
                {doc.targetWarehouse && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Target Warehouse</dt>
                    <dd className="font-medium">
                      {doc.targetWarehouse.code} - {doc.targetWarehouse.name}
                    </dd>
                  </div>
                )}
                {doc.referenceType && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Reference</dt>
                    <dd className="font-medium">
                      {doc.referenceType}: {doc.referenceId || 'N/A'}
                    </dd>
                  </div>
                )}
                {doc.note && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-muted-foreground">Note</dt>
                    <dd className="font-medium">{doc.note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Line Items ({doc.lines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Product</th>
                      <th className="py-2 text-left font-medium">SKU</th>
                      <th className="py-2 text-right font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.lines.map((line) => (
                      <tr key={line.id} className="border-b last:border-0">
                        <td className="py-2">
                          {line.product?.nameEn || line.nameSnapshot || 'Unknown'}
                        </td>
                        <td className="py-2 font-mono text-xs">
                          {line.product?.sku || line.skuSnapshot || '-'}
                        </td>
                        <td className="py-2 text-right font-semibold">{Number(line.qty)}</td>
                      </tr>
                    ))}
                    {doc.lines.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-muted-foreground">
                          No line items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Stock Movements */}
          {doc.movements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Stock Movements ({doc.movements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Time</th>
                        <th className="py-2 text-left font-medium">Type</th>
                        <th className="py-2 text-right font-medium">On-hand Δ</th>
                        <th className="py-2 text-right font-medium">Reserved Δ</th>
                        <th className="py-2 text-right font-medium">Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.movements.map((mv) => (
                        <tr key={mv.id} className="border-b last:border-0">
                          <td className="py-2 text-xs text-muted-foreground">
                            {formatDate(mv.createdAt)}
                          </td>
                          <td className="py-2">
                            <Badge variant="outline" className="text-xs">
                              {mv.movementType}
                            </Badge>
                          </td>
                          <td
                            className={`py-2 text-right font-mono ${Number(mv.qtyChangeOnHand) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                          >
                            {Number(mv.qtyChangeOnHand) >= 0 ? '+' : ''}
                            {Number(mv.qtyChangeOnHand)}
                          </td>
                          <td
                            className={`py-2 text-right font-mono ${Number(mv.qtyChangeReserved) >= 0 ? 'text-amber-600' : 'text-blue-600'}`}
                          >
                            {Number(mv.qtyChangeReserved) >= 0 ? '+' : ''}
                            {Number(mv.qtyChangeReserved)}
                          </td>
                          <td className="py-2 text-right font-mono">
                            {Number(mv.balanceOnHandAfter)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Created */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-slate-200 p-1">
                      <FileText className="h-3 w-3" />
                    </div>
                    <div className="w-px flex-1 bg-slate-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Document Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                    {doc.createdBy && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {doc.createdBy}
                      </p>
                    )}
                  </div>
                </div>

                {/* Posted */}
                {doc.postedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-emerald-200 p-1">
                        <CheckCircle className="h-3 w-3 text-emerald-700" />
                      </div>
                      <div className="w-px flex-1 bg-slate-200" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Posted</p>
                      <p className="text-xs text-muted-foreground">{formatDate(doc.postedAt)}</p>
                      {doc.postedBy && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> {doc.postedBy}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Voided */}
                {doc.status === 'VOID' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-red-200 p-1">
                        <XCircle className="h-3 w-3 text-red-700" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700">Voided</p>
                      <p className="text-xs text-muted-foreground">Document was voided</p>
                    </div>
                  </div>
                )}

                {/* Audit Logs */}
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-blue-200 p-1">
                        <AlertCircle className="h-3 w-3 text-blue-700" />
                      </div>
                      <div className="w-px flex-1 bg-slate-200" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reference Info */}
          {doc.referenceType === 'ORDER' && doc.referenceId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Related Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/orders/${doc.referenceId}`}>View Order →</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
