"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { errorToast, successToast } from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import NotFound from "@/app/not-found.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { DataTable } from "@/shared/components/DataTable.tsx";
import { Form } from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ArrowLeft, Loader2, Replace } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync.tsx";
import { useSupplierOrderById } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.hook.ts";
import { replaceSupplierOrderProduct } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.actions.ts";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.constants.ts";
import { SupplierOrderDetailsResource } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.interface.ts";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import { InventoryResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface.ts";
import { replaceSupplierOrderProductColumns } from "./ReplaceSupplierOrderProductColumns.tsx";

interface ReplaceProductFormValues {
  new_product_id: string;
  replacement_reason: string;
}

export default function ReplaceSupplierOrderProductPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const { ROUTE, ABSOLUTE_ROUTE } = SUPPLIER_ORDER;
  const permissions = useModulePermissions(ROUTE);
  const navigate = useNavigate();
  const { supplierOrderId } = useParams<{ supplierOrderId: string }>();
  const supplierOrderIdNum = supplierOrderId
    ? parseInt(supplierOrderId)
    : undefined;

  const [selectedDetail, setSelectedDetail] =
    useState<SupplierOrderDetailsResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: order,
    isLoading: isLoadingOrder,
    refetch,
  } = useSupplierOrderById(supplierOrderIdNum || 0);

  const form = useForm<ReplaceProductFormValues>({
    defaultValues: { new_product_id: "", replacement_reason: "" },
  });

  const handleBack = () => {
    navigate(ABSOLUTE_ROUTE);
  };

  const handleCloseDialog = () => {
    setSelectedDetail(null);
    form.reset();
  };

  const handleReplace = async (values: ReplaceProductFormValues) => {
    if (!supplierOrderIdNum || !selectedDetail || !values.new_product_id)
      return;

    setIsSubmitting(true);
    try {
      await replaceSupplierOrderProduct(supplierOrderIdNum, {
        original_product_id: selectedDetail.product_id,
        new_product_id: Number(values.new_product_id),
        replacement_reason: values.replacement_reason?.trim() || null,
      });
      await refetch();
      successToast("Repuesto reemplazado correctamente");
      handleCloseDialog();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al reemplazar el repuesto",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingModule || isLoadingOrder) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!order) return <NotFound />;

  const newProductId = form.watch("new_product_id");

  const columns = replaceSupplierOrderProductColumns({
    order,
    canUpdate: permissions.canUpdate,
    onSelect: setSelectedDetail,
  });

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <TitleComponent
              title={`Reemplazar Repuesto - ${order.order_number}`}
              subtitle="Sustituir un repuesto del pedido por otro del almacén"
              icon="Replace"
            />
          </div>
        </div>
      </HeaderTableWrapper>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Proveedor</p>
            <p className="font-semibold">{order.supplier?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén</p>
            <p className="font-semibold">
              {order.warehouse?.description || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orden</p>
            <p className="font-semibold">
              {order.type_currency?.symbol}
              {Number(order.total_amount).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={order.details}
        isVisibleColumnFilter={false}
      />

      <GeneralSheet
        open={selectedDetail !== null}
        onClose={handleCloseDialog}
        title="Reemplazar repuesto"
        subtitle={
          selectedDetail
            ? `Se reemplazará "${selectedDetail.product?.name}" en el pedido ${order.order_number}. Esta acción no se puede deshacer.`
            : undefined
        }
        icon="Replace"
        size="lg"
        childrenFooter={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={form.handleSubmit(handleReplace)}
              disabled={!newProductId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reemplazando...
                </>
              ) : (
                <>
                  <Replace className="mr-2 h-4 w-4" />
                  Sí, reemplazar
                </>
              )}
            </Button>
          </div>
        }
      >
        {selectedDetail && (
          <Form {...form}>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Repuesto actual
                </Label>
                <p className="font-medium">{selectedDetail.product?.name}</p>
              </div>

              <FormSelectAsync
                name="new_product_id"
                label="Nuevo repuesto"
                placeholder="Buscar producto..."
                control={form.control}
                required
                useQueryHook={useInventory}
                additionalParams={{ warehouse_id: order.warehouse_id }}
                mapOptionFn={(inventory: InventoryResource) => ({
                  value: inventory.product_id.toString(),
                  label: `${inventory.product.code} - ${inventory.product.name}`,
                })}
              />

              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Motivo (opcional)
                </Label>
                <Textarea
                  placeholder="Motivo del reemplazo..."
                  {...form.register("replacement_reason")}
                />
              </div>
            </div>
          </Form>
        )}
      </GeneralSheet>
    </div>
  );
}
