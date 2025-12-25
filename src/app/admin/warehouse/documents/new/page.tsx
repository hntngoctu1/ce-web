import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { CreateDocumentForm } from '@/components/warehouse/create-document-form';

async function getFormData() {
  const [warehouses, products] = await Promise.all([
    prisma.warehouse.findMany({
      include: { locations: true },
      orderBy: [{ isDefault: 'desc' }, { code: 'asc' }],
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, sku: true, nameEn: true },
      orderBy: { nameEn: 'asc' },
      take: 500,
    }),
  ]);

  return { warehouses, products };
}

export default async function NewDocumentPage() {
  const { warehouses, products } = await getFormData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/warehouse/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Stock Document</h1>
          <p className="text-muted-foreground">
            Create a new goods receipt, issue, adjustment, or transfer document.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            New Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateDocumentForm warehouses={warehouses} products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
