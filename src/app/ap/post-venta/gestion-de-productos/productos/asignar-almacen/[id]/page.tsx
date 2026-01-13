"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { useWarehousesByCompany } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { CM_POSTVENTA_ID, EMPRESA_AP } from "@/core/core.constants";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRODUCT } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.constants";
import { assignToWarehouse } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.actions";

export default function AssignWarehousePage() {
  const router = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoadingModule, currentView } = useCurrentModule();
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const { ABSOLUTE_ROUTE } = PRODUCT;

  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useWarehousesByCompany({
      my: 1,
      is_received: 1,
      empresa_id: EMPRESA_AP.id,
      type_operation_id: CM_POSTVENTA_ID,
      only_physical: 1,
    });

  const handleAssignToWarehouse = async (warehouseId: number) => {
    if (!id) return;

    setIsAssigning(warehouseId);
    try {
      await assignToWarehouse(parseInt(id), warehouseId);
      successToast("Producto asignado al almacén correctamente");
      router(ABSOLUTE_ROUTE);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Error al asignar el producto al almacén";
      errorToast(msg);
    } finally {
      setIsAssigning(null);
    }
  };

  if (isLoadingModule || isLoadingWarehouses) return <PageSkeleton />;
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router(ABSOLUTE_ROUTE)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <TitleComponent
            title="Asignar Producto a Almacén"
            subtitle="Selecciona el almacén donde deseas asignar este producto"
            icon="Warehouse"
          />
        </div>
      </HeaderTableWrapper>

      {warehouses.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg font-semibold mb-2">
              No hay almacenes disponibles
            </p>
            <p className="text-sm">
              No se encontraron almacenes físicos asignados para asignar el
              producto.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <Card
              key={warehouse.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="size-5" />
                  {warehouse.dyn_code}
                </CardTitle>
                <CardDescription>
                  {warehouse.description || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {warehouse.sede && (
                    <p>
                      <span className="font-medium">Sede:</span>{" "}
                      {warehouse.sede}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleAssignToWarehouse(warehouse.id)}
                  disabled={isAssigning !== null}
                >
                  {isAssigning === warehouse.id
                    ? "Asignando..."
                    : "Asignar a este almacén"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
