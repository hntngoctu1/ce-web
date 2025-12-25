import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Star, Package } from 'lucide-react';
import { CreateWarehouseButton } from '@/components/warehouse/create-warehouse-button';
import { CreateLocationButton } from '@/components/warehouse/create-location-button';

async function getWarehouses() {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      locations: {
        orderBy: { code: 'asc' },
      },
      _count: {
        select: {
          inventoryItems: true,
          stockDocuments: true,
        },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { code: 'asc' }],
  });

  return warehouses;
}

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();
  const t = await getTranslations('admin.warehouse.warehousesPage');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <CreateWarehouseButton />
      </div>

      {warehouses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-4 text-muted-foreground">{t('noWarehousesYet')}</p>
            <CreateWarehouseButton />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-ce-primary/10 p-2">
                      <Building2 className="h-5 w-5 text-ce-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {warehouse.code} - {warehouse.name}
                        {warehouse.isDefault && (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Star className="mr-1 h-3 w-3" />
                            {t('default')}
                          </Badge>
                        )}
                      </CardTitle>
                      {warehouse.address && (
                        <p className="text-sm text-muted-foreground">{warehouse.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {warehouse._count.inventoryItems} {t('items')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {warehouse.locations.length} {t('locations')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      {t('locations')} ({warehouse.locations.length})
                    </h4>
                    <CreateLocationButton
                      warehouseId={warehouse.id}
                      warehouseCode={warehouse.code}
                    />
                  </div>

                  {warehouse.locations.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {warehouse.locations.map((loc) => (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between rounded-lg border bg-slate-50 px-4 py-3"
                        >
                          <div>
                            <p className="font-mono font-medium">{loc.code}</p>
                            <p className="text-xs text-muted-foreground">{loc.name || 'Unnamed'}</p>
                          </div>
                          {loc.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              {t('default')}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed bg-slate-50 py-6 text-center text-sm text-muted-foreground">
                      {t('noLocations')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
