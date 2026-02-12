"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useParams, Link } from "react-router-dom";
import { INVENTORY } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import BackButton from "@/shared/components/BackButton.tsx";
import {
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
} from "@/core/core.function.ts";
import { useProductPurchaseHistory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import PurchaseHistoryTable from "@/features/ap/post-venta/gestion-almacen/inventario/components/PurchaseHistoryTable.tsx";
import { purchaseHistoryColumns } from "@/features/ap/post-venta/gestion-almacen/inventario/components/PurchaseHistoryColumns.tsx";
import InventoryMovementsOptions from "@/features/ap/post-venta/gestion-almacen/inventario/components/InventoryMovementsOptions.tsx";
import ExportButtons from "@/shared/components/ExportButtons.tsx";
import { exportProductPurchaseHistory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions.ts";

export default function PurchaseHistoryPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [search, setSearch] = useState("");
  const { ROUTE, ABSOLUTE_ROUTE } = INVENTORY;
  const params = useParams();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getFirstDayOfMonth(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getCurrentDayOfMonth(currentDate),
  );

  const productId = parseInt(params.productId as string);
  const warehouseId = parseInt(params.warehouseId as string);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined;
  };

  const { data, isLoading } = useProductPurchaseHistory(
    productId,
    warehouseId,
    {
      date_from: formatDate(dateFrom),
      date_to: formatDate(dateTo),
      search: search || undefined,
    },
    {
      enabled: !isNaN(productId) && !isNaN(warehouseId),
    },
  );

  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  }, [dateFrom, dateTo]);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isNaN(productId) || isNaN(warehouseId)) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-destructive">
            Error: Parámetros inválidos
          </p>
          <Link to={`${ABSOLUTE_ROUTE}`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const productName = data?.product?.name || `Producto #${productId}`;
  const summary = data?.summary;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Histórico de Compras"
          subtitle={`${productName} - ${data?.product?.code || ""}`}
          icon={currentView.icon}
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            onExcelDownload={() =>
              exportProductPurchaseHistory(productId, warehouseId, {
                date_from: formatDate(dateFrom),
                date_to: formatDate(dateTo),
              })
            }
          />
          <BackButton
            route={`${ABSOLUTE_ROUTE}`}
            name={"Inventario"}
            fullname={false}
          />
        </div>
      </HeaderTableWrapper>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                <ShoppingCart className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Total Compras
                </p>
                <p className="text-lg font-semibold text-gray-900 leading-tight">
                  {summary.total_purchases}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                <Package className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Cantidad Total
                </p>
                <p className="text-lg font-semibold text-gray-900 leading-tight">
                  {summary.total_quantity}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                <DollarSign className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Monto Total
                </p>
                <p className="text-lg font-semibold text-gray-900 leading-tight truncate">
                  ${summary.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                <Activity className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Precio Promedio
                </p>
                <p className="text-lg font-semibold text-gray-900 leading-tight truncate">
                  ${summary.average_price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                <TrendingDown className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Precio Mínimo
                </p>
                <p className="text-lg font-semibold text-gray-900 leading-tight truncate">
                  ${parseFloat(summary.min_price).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Precio Máximo
                </p>
                <p className="text-lg font-semibold text-gray-900 leading-tight truncate">
                  ${parseFloat(summary.max_price).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <PurchaseHistoryTable
        isLoading={isLoading}
        columns={purchaseHistoryColumns()}
        data={data?.purchases || []}
      >
        <InventoryMovementsOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </PurchaseHistoryTable>
    </div>
  );
}
